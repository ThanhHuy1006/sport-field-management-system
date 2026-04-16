import jwt from "jsonwebtoken";
import { bookingsRepository } from "./bookings.repository.js";
import {
  validateCheckAvailabilityPayload,
  validateCreateBookingPayload,
  validateRejectBookingPayload,
  validateManualCheckInPayload,
  validateCheckInQrPayload,
  validateCompleteBookingPayload,
} from "./bookings.validator.js";

const CHECKIN_EARLY_MINUTES = 30;
const CHECKIN_LATE_MINUTES = 60;

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

function assertCheckInWindow(startDatetime) {
  const now = new Date();
  const start = new Date(startDatetime);

  const openWindow = new Date(start.getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000);
  const closeWindow = new Date(start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000);

  if (now < openWindow) {
    throw new Error("Chưa tới thời gian cho phép check-in");
  }

  if (now > closeWindow) {
    throw new Error("Đã quá thời gian cho phép check-in");
  }
}

function assertCanCheckInBooking(booking) {
  if (!booking) {
    throw new Error("Không tìm thấy booking");
  }

  if (!["APPROVED", "PAID"].includes(booking.status)) {
    throw new Error("Booking hiện không thể check-in");
  }

  if (booking.checked_in_at) {
    throw new Error("Booking đã được check-in trước đó");
  }

  assertCheckInWindow(booking.start_datetime);
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

    const total_price = (duration / 60) * Number(field.base_price_per_hour);

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
      notes: valid.notes,
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
      // để policy sâu hơn sau
    }

    return bookingsRepository.cancelMyBooking(userId, id);
  },

  async getMyBookingCheckInQr(userId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id) || id <= 0) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findMyBookingById(userId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (!["APPROVED", "PAID"].includes(booking.status)) {
      throw new Error("Booking hiện chưa thể tạo mã check-in");
    }

    if (booking.checked_in_at) {
      throw new Error("Booking đã được check-in");
    }

    const secret = process.env.CHECKIN_QR_SECRET;
    if (!secret) {
      throw new Error("CHECKIN_QR_SECRET chưa được cấu hình");
    }

    const start = new Date(booking.start_datetime);
    const expiresAt = new Date(start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000);
    const expiresInSeconds = Math.max(
      60,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000)
    );

    const qr_token = jwt.sign(
      {
        bookingId: booking.id,
        userId: booking.user_id,
        type: "BOOKING_CHECKIN",
      },
      secret,
      { expiresIn: expiresInSeconds }
    );

    return {
      booking_id: booking.id,
      qr_token,
      expires_at: expiresAt.toISOString(),
    };
  },

  async getOwnerBookings(ownerId) {
    return bookingsRepository.findOwnerBookings(ownerId);
  },

  async getOwnerBookingDetail(ownerId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    return booking;
  },

  async approveOwnerBooking(ownerId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new Error("Chỉ booking đang chờ xác nhận mới được duyệt");
    }

    return bookingsRepository.approveOwnerBooking(ownerId, id);
  },

  async rejectOwnerBooking(ownerId, bookingId, payload) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new Error("Chỉ booking đang chờ xác nhận mới được từ chối");
    }

    const valid = validateRejectBookingPayload(payload);

    return bookingsRepository.rejectOwnerBooking(ownerId, id, valid.note);
  },

  async checkInOwnerBooking(ownerId, bookingId, payload) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    assertCanCheckInBooking(booking);

    const valid = validateManualCheckInPayload(payload);

    return bookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      id,
      "MANUAL",
      valid.note
    );
  },

  async scanOwnerBookingQr(ownerId, payload) {
    const valid = validateCheckInQrPayload(payload);

    const secret = process.env.CHECKIN_QR_SECRET;
    if (!secret) {
      throw new Error("CHECKIN_QR_SECRET chưa được cấu hình");
    }

    let decoded;
    try {
      decoded = jwt.verify(valid.qr_token, secret);
    } catch {
      throw new Error("QR token không hợp lệ hoặc đã hết hạn");
    }

    if (decoded?.type !== "BOOKING_CHECKIN") {
      throw new Error("QR token không đúng loại");
    }

    const bookingId = Number(decoded.bookingId);
    if (Number.isNaN(bookingId) || bookingId <= 0) {
      throw new Error("QR token không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new Error("Không tìm thấy booking thuộc owner này");
    }

    assertCanCheckInBooking(booking);

    return bookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
      "QR",
      "Checked in by owner via QR"
    );
  },

  async completeOwnerBooking(ownerId, bookingId, payload) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, id);
    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new Error("Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED");
    }

    const valid = validateCompleteBookingPayload(payload);

    return bookingsRepository.completeOwnerBooking(ownerId, id, valid.note);
  },
};