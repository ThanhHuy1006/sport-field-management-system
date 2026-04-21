import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../errors/index.js";

export const CHECKIN_EARLY_MINUTES = 30;
export const CHECKIN_LATE_MINUTES = 60;

function toDate(value) {
  return value instanceof Date ? value : new Date(value);
}

function diffMinutes(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

function combineDateAndTime(date, timeStr) {
  const d = toDate(date);
  const iso = d.toISOString().slice(0, 10);
  return new Date(`${iso}T${timeStr}`);
}

export function assertFieldExists(field) {
  if (!field) {
    throw new NotFoundError("Không tìm thấy sân");
  }
}

export function assertFieldActive(field) {
  if (field.status !== "active") {
    throw new ForbiddenError("Sân hiện không khả dụng");
  }
}

export function assertBookingTimeRange(startDatetime, endDatetime) {
  const start = toDate(startDatetime);
  const end = toDate(endDatetime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new ValidationError("Thời gian booking không hợp lệ");
  }

  if (start >= end) {
    throw new ValidationError("end_datetime phải lớn hơn start_datetime");
  }
}

export function assertBookingInFuture(startDatetime) {
  const start = toDate(startDatetime);

  if (start <= new Date()) {
    throw new ValidationError("Không thể đặt sân ở thời điểm đã qua");
  }
}

export function assertBookingDurationMatchesField(field, startDatetime, endDatetime) {
  const start = toDate(startDatetime);
  const end = toDate(endDatetime);

  const duration = diffMinutes(start, end);
  const minDuration = Number(field.min_duration_minutes || 60);

  if (duration <= 0) {
    throw new ValidationError("Khoảng thời gian đặt không hợp lệ");
  }

  if (duration % minDuration !== 0) {
    throw new ValidationError(
      `Thời lượng đặt phải chia hết cho ${minDuration} phút`
    );
  }

  return duration;
}

export function assertOperatingHourExists(operatingHour) {
  if (!operatingHour) {
    throw new ForbiddenError("Sân không hoạt động vào ngày này");
  }
}

export function assertBookingWithinOperatingHours(
  startDatetime,
  endDatetime,
  operatingHour
) {
  const start = toDate(startDatetime);
  const end = toDate(endDatetime);

  const open = combineDateAndTime(start, operatingHour.open_time);
  const close = combineDateAndTime(start, operatingHour.close_time);

  if (start < open || end > close) {
    throw new ForbiddenError("Khung giờ đặt nằm ngoài giờ hoạt động của sân");
  }
}

export function assertNoBlackout(blackout) {
  if (blackout) {
    throw new ConflictError("Ngày/giờ này đang bị khóa");
  }
}

export function assertNoConflicts(conflicts) {
  if (Array.isArray(conflicts) && conflicts.length > 0) {
    throw new ConflictError("Khung giờ đã được đặt");
  }
}

export function assertBookingExists(booking) {
  if (!booking) {
    throw new NotFoundError("Không tìm thấy booking");
  }
}

export function assertBookingCancelable(booking) {
  assertBookingExists(booking);

  if (!["PENDING_CONFIRM", "APPROVED", "AWAITING_PAYMENT"].includes(booking.status)) {
    throw new ForbiddenError("Booking hiện không thể hủy");
  }

  if (new Date() >= new Date(booking.start_datetime)) {
    throw new ForbiddenError("Không thể hủy booking đã bắt đầu hoặc đã qua");
  }
}

export function assertBookingApprovable(booking) {
  assertBookingExists(booking);

  if (booking.status !== "PENDING_CONFIRM") {
    throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được duyệt");
  }
}

export function assertBookingRejectable(booking) {
  assertBookingExists(booking);

  if (booking.status !== "PENDING_CONFIRM") {
    throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được từ chối");
  }
}

export function assertBookingCompletable(booking) {
  assertBookingExists(booking);

  if (booking.status !== "CHECKED_IN") {
    throw new ForbiddenError("Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED");
  }
}

export function assertBookingCanGenerateCheckInQr(booking) {
  assertBookingExists(booking);

  if (!["APPROVED", "PAID"].includes(booking.status)) {
    throw new ForbiddenError("Booking hiện chưa thể tạo mã check-in");
  }

  if (booking.checked_in_at) {
    throw new ConflictError("Booking đã được check-in");
  }
}

export function assertCheckInWindow(startDatetime) {
  const now = new Date();
  const start = toDate(startDatetime);

  const openWindow = new Date(start.getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000);
  const closeWindow = new Date(start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000);

  if (now < openWindow) {
    throw new ForbiddenError("Chưa tới thời gian cho phép check-in");
  }

  if (now > closeWindow) {
    throw new ForbiddenError("Đã quá thời gian cho phép check-in");
  }
}

export function assertBookingCheckInAllowed(booking) {
  assertBookingExists(booking);

  if (!["APPROVED", "PAID"].includes(booking.status)) {
    throw new ForbiddenError("Booking hiện không thể check-in");
  }

  if (booking.checked_in_at) {
    throw new ConflictError("Booking đã được check-in trước đó");
  }

  assertCheckInWindow(booking.start_datetime);
}

export function calculateBookingTotalPrice(field, startDatetime, endDatetime) {
  const start = toDate(startDatetime);
  const end = toDate(endDatetime);
  const duration = diffMinutes(start, end);
  const hourlyPrice = Number(field.base_price_per_hour || 0);

  return (duration / 60) * hourlyPrice;
}