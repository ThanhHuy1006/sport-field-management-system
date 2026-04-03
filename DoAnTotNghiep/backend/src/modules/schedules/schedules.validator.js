export function validateAvailabilityQuery(query) {
  const { date } = query;

  if (!date) {
    throw new Error("date là bắt buộc, định dạng YYYY-MM-DD");
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("date không hợp lệ");
  }

  return { date };
}

export function validateOperatingHoursPayload(payload) {
  const { day_of_week, open_time, close_time, is_closed } = payload;

  if (day_of_week === undefined || day_of_week < 0 || day_of_week > 6) {
    throw new Error("day_of_week phải từ 0 đến 6");
  }

  if (typeof is_closed !== "boolean") {
    throw new Error("is_closed phải là boolean");
  }

  if (!is_closed) {
    if (!open_time || !close_time) {
      throw new Error("open_time và close_time là bắt buộc khi không đóng cửa");
    }
  }

  return {
    day_of_week,
    open_time,
    close_time,
    is_closed,
  };
}

export function validateBlackoutDatePayload(payload) {
  const { date, reason } = payload;

  if (!date) {
    throw new Error("date là bắt buộc");
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error("date không hợp lệ");
  }

  return {
    date,
    reason: reason ? String(reason).trim() : null,
  };
}