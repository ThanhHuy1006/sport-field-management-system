import { ValidationError } from "../../core/errors/index.js";

export function validateOwnerFieldIdParam(params) {
  const fieldId = Number(params.fieldId);

  if (Number.isNaN(fieldId) || fieldId <= 0) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  return { fieldId };
}

export function validateBlackoutDateIdParam(params) {
  const blackoutDateId = Number(params.blackoutDateId);

  if (Number.isNaN(blackoutDateId) || blackoutDateId <= 0) {
    throw new ValidationError("blackoutDateId không hợp lệ");
  }

  return { blackoutDateId };
}

export function validateOperatingHoursPayload(payload) {
  if (!Array.isArray(payload)) {
    throw new ValidationError("Payload operating hours phải là mảng");
  }

  const normalized = payload.map((item, index) => {
    const day_of_week = Number(item.day_of_week);
    const open_time = String(item.open_time || "").trim();
    const close_time = String(item.close_time || "").trim();
    const is_closed = Boolean(item.is_closed);

    if (Number.isNaN(day_of_week) || day_of_week < 0 || day_of_week > 6) {
      throw new ValidationError(`day_of_week không hợp lệ tại phần tử ${index}`);
    }

    if (!is_closed) {
      if (!open_time || !close_time) {
        throw new ValidationError(`open_time và close_time là bắt buộc tại phần tử ${index}`);
      }

      if (open_time >= close_time) {
        throw new ValidationError(`open_time phải nhỏ hơn close_time tại phần tử ${index}`);
      }
    }

    return {
      day_of_week,
      open_time: is_closed ? null : open_time,
      close_time: is_closed ? null : close_time,
      is_closed,
    };
  });

  const uniqueDays = new Set(normalized.map((x) => x.day_of_week));
  if (uniqueDays.size !== normalized.length) {
    throw new ValidationError("Mỗi day_of_week chỉ được xuất hiện 1 lần");
  }

  return normalized;
}

export function validateCreateBlackoutPayload(payload) {
  const start_datetime = new Date(payload.start_datetime);
  const end_datetime = new Date(payload.end_datetime);
  const reason = payload.reason ? String(payload.reason).trim() : null;

  if (Number.isNaN(start_datetime.getTime()) || Number.isNaN(end_datetime.getTime())) {
    throw new ValidationError("start_datetime hoặc end_datetime không hợp lệ");
  }

  if (start_datetime >= end_datetime) {
    throw new ValidationError("end_datetime phải lớn hơn start_datetime");
  }

  return {
    start_datetime,
    end_datetime,
    reason,
  };
}