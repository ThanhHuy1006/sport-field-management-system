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

function isOperatingHourClosed(operatingHour) {
  return (
    !operatingHour ||
    !operatingHour.open_time ||
    !operatingHour.close_time
  );
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

export const schedulesService = {
  async getPublicAvailability(fieldId, query) {
    const id = fieldId;
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
      dayEnd
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

    const operatingHour =
      await schedulesRepository.findOperatingHourByFieldAndDay(id, dayOfWeek);

    if (isOperatingHourClosed(operatingHour)) {
      return {
        fieldId: id,
        date,
        isBlackout: false,
        blackoutReason: null,
        slots: [],
      };
    }

    const slotDuration = field.min_duration_minutes || 60;

    const bookings = await schedulesRepository.findBookingsByFieldAndDate(
      id,
      dayStart,
      dayEnd
    );

    let cursor = combineDateAndTime(date, operatingHour.open_time);
    const closeTime = combineDateAndTime(date, operatingHour.close_time);

    const slots = [];

    while (cursor < closeTime) {
      const slotStart = new Date(cursor);
      const slotEnd = addMinutes(slotStart, slotDuration);

      if (slotEnd > closeTime) break;

      const conflict = bookings.find((booking) =>
        overlaps(
          slotStart,
          slotEnd,
          booking.start_datetime,
          booking.end_datetime
        )
      );

      slots.push({
        start_time: formatTime(slotStart),
        end_time: formatTime(slotEnd),
        start_datetime: slotStart,
        end_datetime: slotEnd,
        status: conflict ? "booked" : "available",
        booking_id: conflict?.id || null,
      });

      cursor = slotEnd;
    }

    return {
      fieldId: id,
      date,
      isBlackout: false,
      blackoutReason: null,
      slots,
    };
  },

  async getOwnerOperatingHours(fieldId, user) {
    const id = fieldId;

    await ensureManageableField(id, user);

    const existing = await schedulesRepository.findOperatingHoursByField(id);
    const byDay = new Map(existing.map((item) => [item.day_of_week, item]));

    return Array.from({ length: 7 }, (_, index) => {
      const day = index + 1;
      const item = byDay.get(day);

      if (item) {
        const isClosed = !item.open_time || !item.close_time;

        return {
          ...item,
          is_closed: isClosed,
        };
      }

      return {
        id: null,
        field_id: id,
        day_of_week: day,
        open_time: null,
        close_time: null,
        is_closed: true,
      };
    });
  },

  async upsertOwnerOperatingHours(fieldId, payload, user) {
    const id = fieldId;

    await ensureManageableField(id, user);

    const existed = await schedulesRepository.findOperatingHourByFieldAndDay(
      id,
      payload.day_of_week
    );

    if (payload.is_closed) {
      if (existed) {
        await schedulesRepository.deleteOperatingHour(existed.id);
      }

      return {
        id: existed?.id ?? null,
        field_id: id,
        day_of_week: payload.day_of_week,
        open_time: null,
        close_time: null,
        is_closed: true,
      };
    }

    const item = existed
      ? await schedulesRepository.updateOperatingHour(existed.id, payload)
      : await schedulesRepository.createOperatingHour(id, payload);

    return {
      ...item,
      is_closed: false,
    };
  },

  async createBlackoutDate(fieldId, payload, user) {
    const id = fieldId;

    await ensureManageableField(id, user);

    const existed = await schedulesRepository.findBlackoutByFieldAndDate(
      id,
      startOfDay(payload.date),
      endOfDay(payload.date)
    );

    if (existed) {
      throw new ConflictError("Ngày này đã bị khóa trước đó");
    }

    return schedulesRepository.createBlackoutDate(id, payload);
  },

  async deleteBlackoutDate(blackoutDateId, user) {
    const id = blackoutDateId;

    const blackoutDate = await schedulesRepository.findBlackoutDateById(id);

    if (!blackoutDate) {
      throw new NotFoundError("Không tìm thấy ngày khóa");
    }

    await ensureManageableField(blackoutDate.field_id, user);

    return schedulesRepository.deleteBlackoutDate(id);
  },
};