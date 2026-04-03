export function validateCheckAvailabilityPayload(payload) {
  const { field_id, start_datetime, end_datetime } = payload;

  if (!field_id || Number.isNaN(Number(field_id))) {
    throw new Error("field_id không hợp lệ");
  }

  if (!start_datetime || !end_datetime) {
    throw new Error("start_datetime và end_datetime là bắt buộc");
  }

  const start = new Date(start_datetime);
  const end = new Date(end_datetime);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("start_datetime hoặc end_datetime không hợp lệ");
  }

  if (start >= end) {
    throw new Error("end_datetime phải lớn hơn start_datetime");
  }

  return {
    field_id: Number(field_id),
    start_datetime: start,
    end_datetime: end,
  };
}

export function validateCreateBookingPayload(payload) {
  const { field_id, start_datetime, end_datetime, note } =
    validateCheckAvailabilityPayload(payload);

  return {
    field_id,
    start_datetime,
    end_datetime,
    note: note ? String(note).trim() : null,
  };
}