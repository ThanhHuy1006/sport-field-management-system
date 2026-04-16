import { ValidationError } from "../../core/errors/index.js";

const ALLOWED_OWNER_BOOKING_FILTER_STATUSES = [
  "PENDING_CONFIRM",
  "APPROVED",
  "AWAITING_PAYMENT",
  "PAID",
  "CHECKED_IN",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "PAY_FAILED",
];

export function validateOwnerBookingIdParam(params) {
  const bookingId = Number(params.bookingId);

  if (Number.isNaN(bookingId) || bookingId <= 0) {
    throw new ValidationError("bookingId không hợp lệ");
  }

  return { bookingId };
}

export function validateOwnerBookingsQuery(query) {
  const data = {};

  if (query.status !== undefined) {
    const status = String(query.status || "").trim().toUpperCase();

    if (!ALLOWED_OWNER_BOOKING_FILTER_STATUSES.includes(status)) {
      throw new ValidationError("status filter không hợp lệ");
    }

    data.status = status;
  }

  if (query.field_id !== undefined) {
    const field_id = Number(query.field_id);
    if (Number.isNaN(field_id) || field_id <= 0) {
      throw new ValidationError("field_id không hợp lệ");
    }
    data.field_id = field_id;
  }

  if (query.date_from !== undefined) {
    const date_from = new Date(`${query.date_from}T00:00:00`);
    if (Number.isNaN(date_from.getTime())) {
      throw new ValidationError("date_from không hợp lệ");
    }
    data.date_from = date_from;
  }

  if (query.date_to !== undefined) {
    const date_to = new Date(`${query.date_to}T23:59:59`);
    if (Number.isNaN(date_to.getTime())) {
      throw new ValidationError("date_to không hợp lệ");
    }
    data.date_to = date_to;
  }

  if (data.date_from && data.date_to && data.date_from > data.date_to) {
    throw new ValidationError("date_from phải nhỏ hơn hoặc bằng date_to");
  }

  return data;
}

export function validateRejectOwnerBookingPayload(payload) {
  const note = payload?.note ? String(payload.note).trim() : "";

  if (!note) {
    throw new ValidationError("note là bắt buộc khi từ chối booking");
  }

  return { note };
}

export function validateCompleteOwnerBookingPayload(payload) {
  return {
    note: payload?.note ? String(payload.note).trim() : "Completed by owner",
  };
}

export function validateManualCheckInPayload(payload) {
  return {
    note: payload?.note ? String(payload.note).trim() : "Checked in manually by owner",
  };
}

export function validateCheckInQrPayload(payload) {
  const qr_token = String(payload?.qr_token || "").trim();

  if (!qr_token) {
    throw new ValidationError("qr_token là bắt buộc");
  }

  return { qr_token };
}