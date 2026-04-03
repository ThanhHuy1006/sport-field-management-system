import { schedulesRepository } from "./schedules.repository.js";
import {
  validateAvailabilityQuery,
  validateOperatingHoursPayload,
  validateBlackoutDatePayload,
} from "./schedules.validator.js";

function getDayOfWeek(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDay();
}

function startOfDay(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function endOfDay(dateStr) {
  return new Date(`${dateStr}T23:59:59`);
}

function combineDateAndTime(dateStr, timeStr) {
  return new Date(`${dateStr}T${timeStr}`);
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

export const schedulesService = {
  async getPublicAvailability(fieldId, query) {
    const id = Number(fieldId);
    if (Number.isNaN(id)) {
      throw new Error("fieldId không hợp lệ");
    }

    const { date } = validateAvailabilityQuery(query);

    const field = await schedulesRepository.findFieldById(id);
    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (field.status !== "active") {
      throw new Error("Sân hiện không khả dụng");
    }

    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);

    const blackout = await schedulesRepository.findBlackoutByFieldAndDate(id, dayStart, dayEnd);
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
    const operatingHour = await schedulesRepository.findOperatingHourByFieldAndDay(id, dayOfWeek);

    if (!operatingHour) {
      return {
        fieldId: id,
        date,
        isBlackout: false,
        blackoutReason: null,
        slots: [],
      };
    }

    const slotDuration = field.min_duration_minutes || 60;
    const bookings = await schedulesRepository.findBookingsByFieldAndDate(id, dayStart, dayEnd);

    let cursor = combineDateAndTime(date, operatingHour.open_time);
    const closeTime = combineDateAndTime(date, operatingHour.close_time);

    const slots = [];

    while (cursor < closeTime) {
      const slotStart = new Date(cursor);
      const slotEnd = addMinutes(slotStart, slotDuration);

      if (slotEnd > closeTime) break;

      const conflict = bookings.find((booking) =>
        overlaps(slotStart, slotEnd, booking.start_datetime, booking.end_datetime)
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
    const id = Number(fieldId);
    if (Number.isNaN(id)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await schedulesRepository.findFieldById(id);
    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (user.role === "OWNER" && field.owner_id !== user.id) {
      throw new Error("Bạn không có quyền quản lý sân này");
    }

    return schedulesRepository.findOperatingHoursByField(id);
  },

  async upsertOwnerOperatingHours(fieldId, payload, user) {
    const id = Number(fieldId);
    if (Number.isNaN(id)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await schedulesRepository.findFieldById(id);
    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (user.role === "OWNER" && field.owner_id !== user.id) {
      throw new Error("Bạn không có quyền quản lý sân này");
    }

    const validPayload = validateOperatingHoursPayload(payload);

    const existed = await schedulesRepository.findOperatingHourByFieldAndDay(
      id,
      validPayload.day_of_week
    );

    if (existed) {
      return schedulesRepository.updateOperatingHour(existed.id, validPayload);
    }

    return schedulesRepository.createOperatingHour(id, validPayload);
  },

  async createBlackoutDate(fieldId, payload, user) {
    const id = Number(fieldId);
    if (Number.isNaN(id)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await schedulesRepository.findFieldById(id);
    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (user.role === "OWNER" && field.owner_id !== user.id) {
      throw new Error("Bạn không có quyền quản lý sân này");
    }

    const validPayload = validateBlackoutDatePayload(payload);

    const existed = await schedulesRepository.findBlackoutByFieldAndDate(
      id,
      startOfDay(validPayload.date),
      endOfDay(validPayload.date)
    );

    if (existed) {
      throw new Error("Ngày này đã bị khóa trước đó");
    }

    return schedulesRepository.createBlackoutDate(id, validPayload);
  },

  async deleteBlackoutDate(blackoutDateId, user) {
    const id = Number(blackoutDateId);
    if (Number.isNaN(id)) {
      throw new Error("blackoutDateId không hợp lệ");
    }

    const blackoutDate = await schedulesRepository.findBlackoutDateById(id);
    if (!blackoutDate) {
      throw new Error("Không tìm thấy ngày khóa");
    }

    const field = await schedulesRepository.findFieldById(blackoutDate.field_id);
    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (user.role === "OWNER" && field.owner_id !== user.id) {
      throw new Error("Bạn không có quyền quản lý sân này");
    }

    return schedulesRepository.deleteBlackoutDate(id);
  },
};