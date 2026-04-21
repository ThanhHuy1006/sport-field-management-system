import { ValidationError } from "../../core/errors/index.js";
import { USER_STATUS } from "../../config/constant.js";

const USER_STATUSES = [
  USER_STATUS.ACTIVE,
  USER_STATUS.LOCKED,
  USER_STATUS.DELETED,
];

export function validateAdminUserIdParams(params) {
  const userId = Number(params.userId);

  if (Number.isNaN(userId) || userId <= 0) {
    throw new ValidationError("userId không hợp lệ");
  }

  return { userId };
}

export function validateAdminFieldIdParams(params) {
  const fieldId = Number(params.fieldId);

  if (Number.isNaN(fieldId) || fieldId <= 0) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  return { fieldId };
}

export function validateAdminBookingIdParams(params) {
  const bookingId = Number(params.bookingId);

  if (Number.isNaN(bookingId) || bookingId <= 0) {
    throw new ValidationError("bookingId không hợp lệ");
  }

  return { bookingId };
}

export function validateUserStatusPayload(payload) {
  const status = String(payload.status || "").trim().toLowerCase();

  if (!USER_STATUSES.includes(status)) {
    throw new ValidationError("status user không hợp lệ");
  }

  return { status };
}

export function validateRejectOwnerRegistrationPayload(payload) {
  const reject_reason = String(payload.reject_reason || "").trim();

  if (!reject_reason) {
    throw new ValidationError("reject_reason là bắt buộc");
  }

  return { reject_reason };
}