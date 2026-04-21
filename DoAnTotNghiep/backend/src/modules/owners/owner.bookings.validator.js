import { ValidationError } from "../../core/errors/index.js";

export function validateBookingIdParam(params) {
  const bookingId = Number(params.bookingId);

  if (Number.isNaN(bookingId) || bookingId <= 0) {
    throw new ValidationError("bookingId không hợp lệ");
  }

  return { bookingId };
}

export function validateRejectBookingPayload(payload) {
  return {
    note: payload?.note ? String(payload.note).trim() : "Rejected by owner",
  };
}

export function validateManualCheckInPayload(payload) {
  return {
    note: payload?.note
      ? String(payload.note).trim()
      : "Checked in manually by owner",
  };
}

export function validateCheckInQrPayload(payload) {
  const qr_token = String(payload?.qr_token || "").trim();

  if (!qr_token) {
    throw new ValidationError("qr_token là bắt buộc");
  }

  return { qr_token };
}

export function validateCompleteBookingPayload(payload) {
  return {
    note: payload?.note ? String(payload.note).trim() : "Completed by owner",
  };
}