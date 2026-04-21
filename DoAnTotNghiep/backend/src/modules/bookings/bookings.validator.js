import { ValidationError } from "../../core/errors/index.js";

function parseDateTime(value, fieldName) {
  const raw = String(value || "").trim();

  if (!raw) {
    throw new ValidationError(`${fieldName} là bắt buộc`);
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return parsed;
}

export function validateBookingIdParams(params) {
  const bookingId = Number(params.bookingId);

  if (Number.isNaN(bookingId) || bookingId < 1) {
    throw new ValidationError("bookingId không hợp lệ");
  }

  return { bookingId };
}

export function validateCheckAvailabilityPayload(payload) {
  const field_id = Number(payload.field_id);

  if (Number.isNaN(field_id) || field_id < 1) {
    throw new ValidationError("field_id không hợp lệ");
  }

  const start_datetime = parseDateTime(payload.start_datetime, "start_datetime");
  const end_datetime = parseDateTime(payload.end_datetime, "end_datetime");

  if (start_datetime >= end_datetime) {
    throw new ValidationError("end_datetime phải lớn hơn start_datetime");
  }

  return {
    field_id,
    start_datetime,
    end_datetime,
  };
}

export function validateCreateBookingPayload(payload) {
  const base = validateCheckAvailabilityPayload(payload);
  const rawNotes = payload.notes ?? payload.note ?? null;

  return {
    ...base,
    notes: rawNotes ? String(rawNotes).trim() : null,
  };
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