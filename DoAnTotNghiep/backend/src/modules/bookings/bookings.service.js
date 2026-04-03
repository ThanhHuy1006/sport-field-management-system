import { bookingsRepository } from "./bookings.repository.js";
import {
  validateCheckAvailabilityPayload,
  validateCreateBookingPayload,
} from "./bookings.validator.js";

function diffMinutes(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

function isSameDate(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export const bookingsService = {
  async checkAvailability(payload) {
    const valid = validateCheckAvailabilityPayload(payload);

    const field = await bookingsRepository.findFieldById(valid.field_id);
    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (field.status !== "active") {
      throw new Error("Sân hiện không khả dụng");
    }

    const duration = diffMinutes(valid.start_datetime, valid.end_datetime);

    if (duration <= 0) {
      throw new Error("Khoảng thời gian đặt không hợp lệ");
    }

    if (duration % field.min_duration_minutes !== 0) {
      throw new Error(
        `Thời lượng đặt phải chia hết cho ${field.min_duration_minutes} phút`
      );
    }

    const blackout = await bookingsRepository.findBlackoutByFieldAndRange(
      field.id,
      valid.start_datetime,
      valid.end_datetime
    );

    if (blackout) {
      return {
        available: false,
        reason: "Ngày/giờ này đang bị khóa",
      };
    }

    const conflicts = await bookingsRepository.findConflictingBookings(
      field.id,
      valid.start_datetime,
      valid.end_datetime
    );

    if (conflicts.length > 0) {
      return {
        available: false,
        reason: "Khung giờ đã được đặt",
        conflicts,
      };
    }

    const total_price =
      (duration / 60) * Number(field.base_price_per_hour);

    return {
      available: true,
      total_price,
      field,
    };
  },

  async createBooking(userId, payload) {
    const valid = validateCreateBookingPayload(payload);

    const availability = await this.checkAvailability(valid);
    if (!availability.available) {
      throw new Error(availability.reason || "Khung giờ không khả dụng");
    }

    const booking = await bookingsRepository.createBookingWithHistory({
      field_id: valid.field_id,
      user_id: userId,
      start_datetime: valid.start_datetime,
      end_datetime: valid.end_datetime,
      note: valid.note,
      total_price: availability.total_price,
      status: "PENDING_CONFIRM",
    });

    return booking;
  },

  async getMyBookings(userId) {
    return bookingsRepository.findMyBookings(userId);
  },

  async getMyBookingDetail(userId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findMyBookingById(userId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    return booking;
  },

  async cancelMyBooking(userId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findMyBookingById(userId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (!["PENDING_CONFIRM", "APPROVED", "AWAITING_PAYMENT"].includes(booking.status)) {
      throw new Error("Booking hiện không thể hủy");
    }

    if (!isSameDate(new Date(), booking.start_datetime)) {
      // cho hủy trước ngày chơi, còn logic policy sâu để sau
    }

    return bookingsRepository.cancelMyBooking(userId, id);
  },
};