import jwt from "jsonwebtoken";
import {
  ConflictError,
  NotFoundError,
  AuthError,
} from "../../core/errors/index.js";
import { ownerBookingsRepository } from "./owner.bookings.repository.js";
import {
  validateOwnerBookingIdParam,
  validateOwnerBookingsQuery,
  validateRejectOwnerBookingPayload,
  validateCompleteOwnerBookingPayload,
  validateManualCheckInPayload,
  validateCheckInQrPayload,
} from "./owner.bookings.validator.js";

const CHECKIN_EARLY_MINUTES = 30;
const CHECKIN_LATE_MINUTES = 60;

function assertCheckInWindow(startDatetime) {
  const now = new Date();
  const start = new Date(startDatetime);

  const openWindow = new Date(start.getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000);
  const closeWindow = new Date(start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000);

  if (now < openWindow) {
    throw new ConflictError("Chưa tới thời gian cho phép check-in");
  }

  if (now > closeWindow) {
    throw new ConflictError("Đã quá thời gian cho phép check-in");
  }
}

function assertCanCheckInBooking(booking) {
  if (!booking) {
    throw new NotFoundError("Không tìm thấy booking");
  }

  if (!["APPROVED", "PAID"].includes(booking.status)) {
    throw new ConflictError("Booking hiện không thể check-in");
  }

  if (booking.checked_in_at) {
    throw new ConflictError("Booking đã được check-in trước đó");
  }

  assertCheckInWindow(booking.start_datetime);
}

export const ownerBookingsService = {
  async getOwnerBookings(ownerId, query) {
    const filters = validateOwnerBookingsQuery(query);
    return ownerBookingsRepository.findOwnerBookings(ownerId, filters);
  },

  async getOwnerBookingDetail(ownerId, params) {
    const { bookingId } = validateOwnerBookingIdParam(params);

    const item = await ownerBookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!item) {
      throw new NotFoundError("Không tìm thấy booking của owner");
    }

    return item;
  },

  async approveOwnerBooking(ownerId, params) {
    const { bookingId } = validateOwnerBookingIdParam(params);

    const booking = await ownerBookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking của owner");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ConflictError("Chỉ booking đang chờ xác nhận mới được duyệt");
    }

    return ownerBookingsRepository.approveOwnerBooking(ownerId, bookingId);
  },

  async rejectOwnerBooking(ownerId, params, payload) {
    const { bookingId } = validateOwnerBookingIdParam(params);

    const booking = await ownerBookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking của owner");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ConflictError("Chỉ booking đang chờ xác nhận mới được từ chối");
    }

    const valid = validateRejectOwnerBookingPayload(payload);

    return ownerBookingsRepository.rejectOwnerBooking(
      ownerId,
      bookingId,
      valid.note
    );
  },

  async checkInOwnerBooking(ownerId, params, payload) {
    const { bookingId } = validateOwnerBookingIdParam(params);

    const booking = await ownerBookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking của owner");
    }

    assertCanCheckInBooking(booking);

    const valid = validateManualCheckInPayload(payload);

    return ownerBookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
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
      throw new AuthError("QR token không hợp lệ hoặc đã hết hạn");
    }

    if (decoded?.type !== "BOOKING_CHECKIN") {
      throw new AuthError("QR token không đúng loại");
    }

    const bookingId = Number(decoded.bookingId);
    if (Number.isNaN(bookingId) || bookingId <= 0) {
      throw new AuthError("QR token không hợp lệ");
    }

    const booking = await ownerBookingsRepository.findOwnerBookingById(ownerId, bookingId);
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

  async completeOwnerBooking(ownerId, params, payload) {
    const { bookingId } = validateOwnerBookingIdParam(params);

    const booking = await ownerBookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking của owner");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new ConflictError("Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED");
    }

    const valid = validateCompleteOwnerBookingPayload(payload);

    return ownerBookingsRepository.completeOwnerBooking(
      ownerId,
      bookingId,
      valid.note
    );
  },

  async getMyBookingCheckInQr(userId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id) || id <= 0) {
      throw new NotFoundError("bookingId không hợp lệ");
    }

    const booking = await ownerBookingsRepository.findMemberBookingById(userId, id);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking của bạn");
    }

    if (!["APPROVED", "PAID"].includes(booking.status)) {
      throw new ConflictError("Booking hiện chưa thể tạo mã check-in");
    }

    if (booking.checked_in_at) {
      throw new ConflictError("Booking đã được check-in");
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
};