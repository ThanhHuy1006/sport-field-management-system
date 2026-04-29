import { ValidationError } from "../../core/errors/index.js";
const ALLOWED_BOOKING_PAYMENT_METHODS = ["ONSITE", "BANK_TRANSFER"];
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

function parsePositiveInt(value, fieldName, { min = 1, max = Number.MAX_SAFE_INTEGER } = {}) {
  const num = Number(value);

  if (Number.isNaN(num) || num < min || num > max || !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return num;
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

// export function validateCreateBookingPayload(payload) {
//   const base = validateCheckAvailabilityPayload(payload);
//   const rawNotes = payload.notes ?? payload.note ?? null;

//   return {
//     ...base,
//     notes: rawNotes ? String(rawNotes).trim() : null,
//   };
// }
export function validateCreateBookingPayload(payload) {
  const base = validateCheckAvailabilityPayload(payload);
  const rawNotes = payload.notes ?? payload.note ?? null;
  const rawContactName = payload.contact_name ?? null;
  const rawContactEmail = payload.contact_email ?? null;
  const rawContactPhone = payload.contact_phone ?? null;
  const rawRequestedPaymentMethod =
    payload.requested_payment_method ?? payload.payment_method ?? "ONSITE";

  const requested_payment_method = String(rawRequestedPaymentMethod).trim();

  if (!ALLOWED_BOOKING_PAYMENT_METHODS.includes(requested_payment_method)) {
    throw new ValidationError("requested_payment_method không hợp lệ");
  }

  return {
    ...base,
    notes: rawNotes ? String(rawNotes).trim() : null,
    contact_name: rawContactName ? String(rawContactName).trim() : null,
    contact_email: rawContactEmail ? String(rawContactEmail).trim() : null,
    contact_phone: rawContactPhone ? String(rawContactPhone).trim() : null,
    requested_payment_method,
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

export function validateBookingListQuery(query) {
  const page = parsePositiveInt(query.page ?? 1, "page", { min: 1, max: 100000 });
  const limit = parsePositiveInt(query.limit ?? 10, "limit", { min: 1, max: 100 });

  const allowedStatuses = [
    "PENDING_CONFIRM",
    "APPROVED",
    "AWAITING_PAYMENT",
    "PAID",
    "REJECTED",
    "CANCELLED",
    "COMPLETED",
    "PAY_FAILED",
    "CHECKED_IN",
    "PAYMENT_EXPIRED",
  ];

  const status = query.status ? String(query.status).trim() : "";

  if (status && !allowedStatuses.includes(status)) {
    throw new ValidationError("status không hợp lệ");
  }

  return {
    page,
    limit,
    status: status || undefined,
  };
}

export function validateAvailabilitySlotsQuery(query) {
  const field_id = parsePositiveInt(query.field_id, "field_id", { min: 1 });

  const date = String(query.date || "").trim();
  if (!date) {
    throw new ValidationError("date là bắt buộc");
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError("date phải có định dạng YYYY-MM-DD");
  }

  const duration_minutes =
    query.duration_minutes !== undefined && query.duration_minutes !== ""
      ? parsePositiveInt(query.duration_minutes, "duration_minutes", { min: 1, max: 1440 })
      : undefined;

  return {
    field_id,
    date,
    duration_minutes,
  };
}