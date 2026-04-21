import { ValidationError } from "../../core/errors/index.js";

const ALLOWED_PROVIDERS = ["VNPAY", "MOMO", "ZALOPAY", "ONSITE", "BANK_TRANSFER"];

export function validateBookingIdParams(params) {
  const bookingId = Number(params.bookingId);

  if (Number.isNaN(bookingId) || bookingId <= 0) {
    throw new ValidationError("bookingId không hợp lệ");
  }

  return { bookingId };
}

export function validatePaymentIdParams(params) {
  const paymentId = Number(params.paymentId);

  if (Number.isNaN(paymentId) || paymentId <= 0) {
    throw new ValidationError("paymentId không hợp lệ");
  }

  return { paymentId };
}

export function validateCreatePaymentPayload(payload) {
  const booking_id = Number(payload.booking_id);
  const provider = String(payload.provider || "").trim();

  if (Number.isNaN(booking_id) || booking_id <= 0) {
    throw new ValidationError("booking_id không hợp lệ");
  }

  if (!ALLOWED_PROVIDERS.includes(provider)) {
    throw new ValidationError("provider không hợp lệ");
  }

  return {
    booking_id,
    provider,
  };
}