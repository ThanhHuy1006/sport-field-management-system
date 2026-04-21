import { ValidationError } from "../../core/errors/index.js";

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeString(value) {
  return /^\d{2}:\d{2}$/.test(value);
}

export function validateFieldIdParams(params) {
  const fieldId = Number(params.fieldId);

  if (Number.isNaN(fieldId) || fieldId < 1) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  return { fieldId };
}

export function validateBlackoutDateIdParams(params) {
  const blackoutDateId = Number(params.blackoutDateId);

  if (Number.isNaN(blackoutDateId) || blackoutDateId < 1) {
    throw new ValidationError("blackoutDateId không hợp lệ");
  }

  return { blackoutDateId };
}

export function validateAvailabilityQuery(query) {
  const date = String(query.date || "").trim();

  if (!date) {
    throw new ValidationError("date là bắt buộc, định dạng YYYY-MM-DD");
  }

  if (!isValidDateString(date)) {
    throw new ValidationError("date không hợp lệ");
  }

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("date không hợp lệ");
  }

  return { date };
}

export function validateOperatingHoursPayload(payload) {
  const day_of_week = Number(payload.day_of_week);
  const is_closed = Boolean(payload.is_closed);
  const open_time = payload.open_time ? String(payload.open_time).trim() : null;
  const close_time = payload.close_time ? String(payload.close_time).trim() : null;

  if (Number.isNaN(day_of_week) || day_of_week < 0 || day_of_week > 6) {
    throw new ValidationError("day_of_week phải từ 0 đến 6");
  }

  if (!is_closed) {
    if (!open_time || !close_time) {
      throw new ValidationError("open_time và close_time là bắt buộc khi không đóng cửa");
    }

    if (!isValidTimeString(open_time) || !isValidTimeString(close_time)) {
      throw new ValidationError("open_time và close_time phải có định dạng HH:mm");
    }

    if (open_time >= close_time) {
      throw new ValidationError("open_time phải nhỏ hơn close_time");
    }
  }

  return {
    day_of_week,
    open_time: is_closed ? null : open_time,
    close_time: is_closed ? null : close_time,
    is_closed,
  };
}

export function validateBlackoutDatePayload(payload) {
  const date = String(payload.date || "").trim();
  const reason = payload.reason ? String(payload.reason).trim() : null;

  if (!date) {
    throw new ValidationError("date là bắt buộc");
  }

  if (!isValidDateString(date)) {
    throw new ValidationError("date không hợp lệ");
  }

  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("date không hợp lệ");
  }

  return {
    date,
    reason,
  };
}