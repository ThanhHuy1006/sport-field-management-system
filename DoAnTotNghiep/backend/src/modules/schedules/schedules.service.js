import { schedulesRepository } from "./schedules.repository.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";

function parseLocalDate(dateStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  return new Date(year, month - 1, day);
}

// DB quy ước:
// 1 = Thứ hai
// 2 = Thứ ba
// ...
// 6 = Thứ bảy
// 7 = Chủ nhật
function getDayOfWeek(dateStr) {
  const date = parseLocalDate(dateStr);
  const jsDay = date.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  return jsDay === 0 ? 7 : jsDay;
}

function startOfDay(dateStr) {
  const date = parseLocalDate(dateStr);
  date.setHours(0, 0, 0, 0);
  return date;
}

function endOfDay(dateStr) {
  const date = parseLocalDate(dateStr);
  date.setHours(23, 59, 59, 999);
  return date;
}

function combineDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}:00`);
}

function addMinutes(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}

function formatTime(date) {
  return date.toTimeString().slice(0, 5);
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && startB < endA;
}

function isOperatingWindowValid(window) {
  return Boolean(window?.open_time && window?.close_time);
}

function mapOperatingRowsToDaySchedule(fieldId, dayOfWeek, rows = []) {
  const windows = rows
    .filter((item) => item.is_active !== false)
    .filter(isOperatingWindowValid)
    .sort((a, b) => String(a.open_time).localeCompare(String(b.open_time)))
    .map((item) => ({
      id: item.id,
      start_time: item.open_time,
      end_time: item.close_time,
    }));

  return {
    id: rows[0]?.id ?? null,
    field_id: Number(fieldId),
    day_of_week: Number(dayOfWeek),
    is_closed: windows.length === 0,
    windows,

    // Fallback cho mapper/API cũ nếu còn dùng.
    open_time: windows[0]?.start_time ?? null,
    close_time: windows[0]?.end_time ?? null,
  };
}

async function ensureManageableField(fieldId, user) {
  const field = await schedulesRepository.findFieldById(fieldId);

  if (!field) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  if (user.role === "OWNER" && field.owner_id !== user.id) {
    throw new ForbiddenError("Bạn không có quyền quản lý sân này");
  }

  return field;
}

function buildSlotsFromOperatingWindow({
  date,
  operatingWindow,
  slotDuration,
  stepMinutes,
  bookings,
}) {
  const slots = [];

  if (!isOperatingWindowValid(operatingWindow)) {
    return slots;
  }

  let cursor = combineDateAndTime(date, operatingWindow.open_time);
  const closeTime = combineDateAndTime(date, operatingWindow.close_time);

  while (cursor < closeTime) {
    const slotStart = new Date(cursor);
    const slotEnd = addMinutes(slotStart, slotDuration);

    if (slotEnd > closeTime) break;

    const conflict = bookings.find((booking) =>
      overlaps(
        slotStart,
        slotEnd,
        booking.start_datetime,
        booking.end_datetime,
      ),
    );

    slots.push({
      start_time: formatTime(slotStart),
      end_time: formatTime(slotEnd),
      start_datetime: slotStart,
      end_datetime: slotEnd,
      status: conflict ? "booked" : "available",
      booking_id: conflict?.id || null,
    });

    cursor = addMinutes(cursor, stepMinutes);
  }

  return slots;
}

export const schedulesService = {
  async getPublicAvailability(fieldId, query) {
    const id = Number(fieldId);
    const { date } = query;

    const field = await schedulesRepository.findFieldById(id);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    if (field.status !== "active") {
      throw new ForbiddenError("Sân hiện không khả dụng");
    }

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const blackout = await schedulesRepository.findBlackoutByFieldAndDate(
      id,
      dayStart,
      dayEnd,
    );

    if (blackout) {
      return {
        fieldId: id,
        date,
        isBlackout: true,
        blackoutReason: blackout.reason,
        slots: [],
      };
    }

    const dayOfWeek = getDayOfWeek(date);

    const operatingWindows =
      await schedulesRepository.findOperatingHoursByFieldAndDay(
        id,
        dayOfWeek,
      );

    const validOperatingWindows = operatingWindows.filter(
      isOperatingWindowValid,
    );

    if (validOperatingWindows.length === 0) {
      return {
        fieldId: id,
        date,
        isBlackout: false,
        blackoutReason: null,
        slots: [],
      };
    }

    const slotDuration = field.min_duration_minutes || 60;
    const stepMinutes = field.slot_step_minutes || slotDuration;

    const bookings = await schedulesRepository.findBookingsByFieldAndDate(
      id,
      dayStart,
      dayEnd,
    );

    const slots = validOperatingWindows.flatMap((operatingWindow) =>
      buildSlotsFromOperatingWindow({
        date,
        operatingWindow,
        slotDuration,
        stepMinutes,
        bookings,
      }),
    );

    return {
      fieldId: id,
      date,
      isBlackout: false,
      blackoutReason: null,
      slots,
    };
  },

  async getOwnerOperatingHours(fieldId, user) {
    const id = Number(fieldId);

    await ensureManageableField(id, user);

    const existing = await schedulesRepository.findOperatingHoursByField(id);

    return Array.from({ length: 7 }, (_, index) => {
      const dayOfWeek = index + 1;

      const rows = existing.filter(
        (item) => Number(item.day_of_week) === dayOfWeek,
      );

      return mapOperatingRowsToDaySchedule(id, dayOfWeek, rows);
    });
  },

  async upsertOwnerOperatingHours(fieldId, payload, user) {
    const id = Number(fieldId);

    await ensureManageableField(id, user);

    const rows = await schedulesRepository.replaceOperatingHoursByDay(
      id,
      payload,
    );

    return mapOperatingRowsToDaySchedule(id, payload.day_of_week, rows);
  },

  async createBlackoutDate(fieldId, payload, user) {
    const id = Number(fieldId);

    await ensureManageableField(id, user);

    const existed = await schedulesRepository.findBlackoutByFieldAndDate(
      id,
      startOfDay(payload.date),
      endOfDay(payload.date),
    );

    if (existed) {
      throw new ConflictError("Ngày này đã bị khóa trước đó");
    }

    return schedulesRepository.createBlackoutDate(id, payload);
  },

  async deleteBlackoutDate(blackoutDateId, user) {
    const id = Number(blackoutDateId);

    const blackoutDate = await schedulesRepository.findBlackoutDateById(id);

    if (!blackoutDate) {
      throw new NotFoundError("Không tìm thấy ngày khóa");
    }

    await ensureManageableField(blackoutDate.field_id, user);

    return schedulesRepository.deleteBlackoutDate(id);
  },
};