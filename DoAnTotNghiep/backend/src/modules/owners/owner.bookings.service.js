import jwt from "jsonwebtoken";
import {
  AppError,
  AuthError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";
import { ownerBookingsRepository } from "./owner.bookings.repository.js";

const CHECKIN_EARLY_MINUTES = 30;
const CHECKIN_LATE_MINUTES = 60;

function assertCheckInWindow(startDatetime) {
  const now = new Date();
  const start = new Date(startDatetime);

  const openWindow = new Date(start.getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000);
  const closeWindow = new Date(start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000);

  if (now < openWindow) {
    throw new ForbiddenError("Chưa tới thời gian cho phép check-in");
  }

  if (now > closeWindow) {
    throw new ForbiddenError("Đã quá thời gian cho phép check-in");
  }
}

function assertCanCheckInBooking(booking) {
  if (!booking) {
    throw new NotFoundError("Không tìm thấy booking");
  }

  if (!["APPROVED", "PAID"].includes(booking.status)) {
    throw new ForbiddenError("Booking hiện không thể check-in");
  }

  if (booking.checked_in_at) {
    throw new ConflictError("Booking đã được check-in trước đó");
  }

  assertCheckInWindow(booking.start_datetime);
}

export const ownerBookingsService = {
  async getOwnerBookings(ownerId) {
    return ownerBookingsRepository.findOwnerBookings(ownerId);
  },

  async getOwnerBookingDetail(ownerId, bookingId) {
    const booking = await ownerBookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    return booking;
  },

  async approveOwnerBooking(ownerId, bookingId) {
    const booking = await ownerBookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được duyệt");
    }

    return ownerBookingsRepository.approveOwnerBooking(ownerId, bookingId);
  },

  async rejectOwnerBooking(ownerId, bookingId, payload) {
    const booking = await ownerBookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được từ chối");
    }

    return ownerBookingsRepository.rejectOwnerBooking(ownerId, bookingId, payload.note);
  },

  async checkInOwnerBooking(ownerId, bookingId, payload) {
    const booking = await ownerBookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    assertCanCheckInBooking(booking);

    return ownerBookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
      "MANUAL",
      payload.note
    );
  },

  async scanOwnerBookingQr(ownerId, payload) {
    const secret = process.env.CHECKIN_QR_SECRET;

    if (!secret) {
      throw new AppError("CHECKIN_QR_SECRET chưa được cấu hình", {
        statusCode: 500,
        code: "CONFIG_ERROR",
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(payload.qr_token, secret);
    } catch {
      throw new AuthError("QR token không hợp lệ hoặc đã hết hạn");
    }

    if (decoded?.type !== "BOOKING_CHECKIN") {
      throw new ValidationError("QR token không đúng loại");
    }

    const bookingId = Number(decoded.bookingId);

    if (Number.isNaN(bookingId) || bookingId <= 0) {
      throw new ValidationError("QR token không hợp lệ");
    }

    const booking = await ownerBookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking thuộc owner này");
    }

    assertCanCheckInBooking(booking);

    return ownerBookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
      "QR",
      "Checked in by owner via QR"
    );
  },

  async completeOwnerBooking(ownerId, bookingId, payload) {
    const booking = await ownerBookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new ForbiddenError("Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED");
    }

    return ownerBookingsRepository.completeOwnerBooking(
      ownerId,
      bookingId,
      payload.note
    );
  },
};