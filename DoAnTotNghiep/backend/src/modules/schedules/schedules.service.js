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
  const [year, month, day] = String(dateStr).split("-").map(Number);
  const [hour, minute] = String(timeStr).split(":").map(Number);

  return new Date(year, month - 1, day, hour, minute, 0, 0);
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

function isFullDayBlackout(blackout, dayStart, dayEnd) {
  return blackout.start_datetime <= dayStart && blackout.end_datetime >= dayEnd;
}

function buildSlotsFromOperatingWindow({
  date,
  operatingWindow,
  slotDuration,
  stepMinutes,
  bookings,
  blackouts = [],
  now = new Date(),
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

    const blackout = blackouts.find((item) =>
      overlaps(slotStart, slotEnd, item.start_datetime, item.end_datetime),
    );

    const conflict = bookings.find((booking) =>
      overlaps(
        slotStart,
        slotEnd,
        booking.start_datetime,
        booking.end_datetime,
      ),
    );

    const isPast = slotStart <= now;

    let status = "available";
    let reason = null;

    if (isPast) {
      status = "past";
      reason = "Đã qua";
    } else if (blackout) {
      status = "blackout";
      reason = blackout.reason
        ? `Sân đóng đột xuất: ${blackout.reason}`
        : "Sân đóng đột xuất";
    } else if (conflict) {
      status = "booked";
      reason = "Đã có người đặt";
    }

    slots.push({
      start_time: formatTime(slotStart),
      end_time: formatTime(slotEnd),
      start_datetime: slotStart,
      end_datetime: slotEnd,
      status,
      available: status === "available",
      is_past: isPast,
      reason,
      booking_id: conflict?.id || null,
      blackout_id: blackout?.id || null,
    });

    cursor = addMinutes(cursor, stepMinutes);
  }

  return slots;
}

function mapAffectedBooking(booking) {
  return {
    id: booking.id,
    customer_name:
      booking.contact_name || booking.users?.name || "Khách hàng",
    customer_email: booking.contact_email || booking.users?.email || null,
    customer_phone: booking.contact_phone || booking.users?.phone || null,
    start_datetime: booking.start_datetime,
    end_datetime: booking.end_datetime,
    status: booking.status,
    total_price: booking.total_price ? Number(booking.total_price) : 0,
    payment_status: booking.payments?.status || null,
    payment_amount: booking.payments?.amount
      ? Number(booking.payments.amount)
      : null,
  };
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

    const blackouts = await schedulesRepository.findBlackoutsByFieldAndRange(
      id,
      dayStart,
      dayEnd,
    );

    const fullDayBlackout = blackouts.find((blackout) =>
      isFullDayBlackout(blackout, dayStart, dayEnd),
    );

    if (fullDayBlackout) {
      return {
        fieldId: id,
        date,
        isBlackout: true,
        blackoutReason: fullDayBlackout.reason,
        slots: [],
      };
    }

    const dayOfWeek = getDayOfWeek(date);

    const operatingWindows =
      await schedulesRepository.findOperatingHoursByFieldAndDay(id, dayOfWeek);

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

    const minDuration = field.min_duration_minutes || 60;

    const requestedDuration =
      query.duration_minutes !== undefined && query.duration_minutes !== null
        ? Number(query.duration_minutes)
        : minDuration;

    if (
      Number.isNaN(requestedDuration) ||
      requestedDuration <= 0 ||
      requestedDuration % 30 !== 0
    ) {
      throw new ForbiddenError("Thời lượng đặt sân không hợp lệ");
    }

    if (requestedDuration < minDuration) {
      throw new ForbiddenError(
        `Thời lượng đặt sân tối thiểu là ${minDuration} phút`,
      );
    }

    const slotDuration = requestedDuration;
    const stepMinutes = field.slot_step_minutes || 30;

    const bookings = await schedulesRepository.findBookingsByFieldAndDate(
      id,
      dayStart,
      dayEnd,
    );

    const now = new Date();

    const slots = validOperatingWindows.flatMap((operatingWindow) =>
      buildSlotsFromOperatingWindow({
        date,
        operatingWindow,
        slotDuration,
        stepMinutes,
        bookings,
        blackouts,
        now,
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

  async getOwnerBlackoutDates(fieldId, user) {
    const id = Number(fieldId);

    await ensureManageableField(id, user);

    return schedulesRepository.findBlackoutsByField(id);
  },

  async previewBlackoutDate(fieldId, payload, user) {
    const id = Number(fieldId);

    await ensureManageableField(id, user);

    const startDateTime = combineDateAndTime(payload.date, payload.start_time);
    const endDateTime = combineDateAndTime(payload.date, payload.end_time);

    const affectedBookings =
      await schedulesRepository.findAffectedBookingsByRange(
        id,
        startDateTime,
        endDateTime,
      );

    const totalPaidAmount = affectedBookings
      .filter((booking) => booking.status === "PAID")
      .reduce((sum, booking) => sum + Number(booking.total_price || 0), 0);

    return {
      field_id: id,
      start_datetime: startDateTime,
      end_datetime: endDateTime,
      total_affected: affectedBookings.length,
      total_paid_amount: totalPaidAmount,
      bookings: affectedBookings.map(mapAffectedBooking),
    };
  },

  async createBlackoutDate(fieldId, payload, user) {
    const id = Number(fieldId);

    await ensureManageableField(id, user);

    const startDateTime = combineDateAndTime(payload.date, payload.start_time);
    const endDateTime = combineDateAndTime(payload.date, payload.end_time);

    const existed = await schedulesRepository.findBlackoutsByFieldAndRange(
      id,
      startDateTime,
      endDateTime,
    );

    if (existed.length > 0) {
      throw new ConflictError("Khoảng thời gian này đã bị khóa trước đó");
    }

    const result = await schedulesRepository.createBlackoutWithBookingEffects({
      fieldId: id,
      startDateTime,
      endDateTime,
      reason: payload.reason,
      action: payload.action,
      changedBy: user.id,
    });

    return {
      ...result.blackout,
      affected_bookings_count: result.affectedBookings.length,
      cancelled_count: result.cancelledCount,
      refund_requested_count: result.refundRequestedCount,
      affected_bookings: result.affectedBookings.map(mapAffectedBooking),
    };
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
