import jwt from "jsonwebtoken";
import { bookingsRepository } from "./bookings.repository.js";
import {
  AuthError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";

const CHECKIN_EARLY_MINUTES = 30;
const CHECKIN_LATE_MINUTES = 60;

function diffMinutes(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

function getDayOfWeek(date) {
  return date.getDay();
}

function combineDateAndTime(date, timeStr) {
  const iso = date.toISOString().slice(0, 10);
  return new Date(`${iso}T${timeStr}`);
}

function isWithinOperatingHours(start, end, operatingHour) {
  const open = combineDateAndTime(start, operatingHour.open_time);
  const close = combineDateAndTime(start, operatingHour.close_time);

  return start >= open && end <= close;
}

function assertFutureBooking(startDatetime) {
  if (startDatetime <= new Date()) {
    throw new ValidationError("Không thể đặt sân ở thời điểm đã qua");
  }
}

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

async function assertBookableField(valid) {
  const field = await bookingsRepository.findFieldById(valid.field_id);
  if (!field) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  if (field.status !== "active") {
    throw new ForbiddenError("Sân hiện không khả dụng");
  }

  const duration = diffMinutes(valid.start_datetime, valid.end_datetime);

  if (duration <= 0) {
    throw new ValidationError("Khoảng thời gian đặt không hợp lệ");
  }

  if (duration % field.min_duration_minutes !== 0) {
    throw new ValidationError(
      `Thời lượng đặt phải chia hết cho ${field.min_duration_minutes} phút`
    );
  }

  assertFutureBooking(valid.start_datetime);

  const dayOfWeek = getDayOfWeek(valid.start_datetime);
  const operatingHour = await bookingsRepository.findOperatingHourByFieldAndDay(
    field.id,
    dayOfWeek
  );

  if (!operatingHour) {
    throw new ForbiddenError("Sân không hoạt động vào ngày này");
  }

  if (!isWithinOperatingHours(valid.start_datetime, valid.end_datetime, operatingHour)) {
    throw new ForbiddenError("Khung giờ đặt nằm ngoài giờ hoạt động của sân");
  }

  return field;
}

export const bookingsService = {
  async checkAvailability(payload) {
    const field = await assertBookableField(payload);

    const blackout = await bookingsRepository.findBlackoutByFieldAndRange(
      field.id,
      payload.start_datetime,
      payload.end_datetime
    );

    if (blackout) {
      return {
        available: false,
        reason: "Ngày/giờ này đang bị khóa",
      };
    }

    const conflicts = await bookingsRepository.findConflictingBookings(
      field.id,
      payload.start_datetime,
      payload.end_datetime
    );

    if (conflicts.length > 0) {
      return {
        available: false,
        reason: "Khung giờ đã được đặt",
        conflicts,
      };
    }

    const duration = diffMinutes(payload.start_datetime, payload.end_datetime);
    const total_price = (duration / 60) * Number(field.base_price_per_hour);

    return {
      available: true,
      total_price,
      field,
    };
  },

  async createBooking(userId, payload) {
    const availability = await this.checkAvailability(payload);

    if (!availability.available) {
      throw new ConflictError(availability.reason || "Khung giờ không khả dụng");
    }

    const booking = await bookingsRepository.createBookingWithHistory({
      field_id: payload.field_id,
      user_id: userId,
      start_datetime: payload.start_datetime,
      end_datetime: payload.end_datetime,
      notes: payload.notes,
      total_price: availability.total_price,
      status: "PENDING_CONFIRM",
    });

    return booking;
  },

  async getMyBookings(userId) {
    return bookingsRepository.findMyBookings(userId);
  },

  async getMyBookingDetail(userId, bookingId) {
    const booking = await bookingsRepository.findMyBookingById(userId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    return booking;
  },

  async cancelMyBooking(userId, bookingId) {
    const booking = await bookingsRepository.findMyBookingById(userId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (!["PENDING_CONFIRM", "APPROVED", "AWAITING_PAYMENT"].includes(booking.status)) {
      throw new ForbiddenError("Booking hiện không thể hủy");
    }

    if (new Date() >= new Date(booking.start_datetime)) {
      throw new ForbiddenError("Không thể hủy booking đã bắt đầu hoặc đã qua");
    }

    return bookingsRepository.cancelMyBooking(userId, bookingId);
  },

  async getMyBookingCheckInQr(userId, bookingId) {
    const booking = await bookingsRepository.findMyBookingById(userId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (!["APPROVED", "PAID"].includes(booking.status)) {
      throw new ForbiddenError("Booking hiện chưa thể tạo mã check-in");
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

  async getOwnerBookings(ownerId) {
    return bookingsRepository.findOwnerBookings(ownerId);
  },

  async getOwnerBookingDetail(ownerId, bookingId) {
    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    return booking;
  },

  async approveOwnerBooking(ownerId, bookingId) {
    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được duyệt");
    }

    return bookingsRepository.approveOwnerBooking(ownerId, bookingId);
  },

  async rejectOwnerBooking(ownerId, bookingId, payload) {
    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được từ chối");
    }

    return bookingsRepository.rejectOwnerBooking(ownerId, bookingId, payload.note);
  },

  async checkInOwnerBooking(ownerId, bookingId, payload) {
    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    assertCanCheckInBooking(booking);

    return bookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
      "MANUAL",
      payload.note
    );
  },

  async scanOwnerBookingQr(ownerId, payload) {
    const secret = process.env.CHECKIN_QR_SECRET;
    if (!secret) {
      throw new Error("CHECKIN_QR_SECRET chưa được cấu hình");
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

    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking thuộc owner này");
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
    const booking = await bookingsRepository.findOwnerBookingById(ownerId, bookingId);
    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "CHECKED_IN") {
      throw new ForbiddenError("Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED");
    }

    return bookingsRepository.completeOwnerBooking(ownerId, bookingId, payload.note);
  },
};