import { ValidationError } from "../../core/errors/index.js";

const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

function isValidDateString(value) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isValidTimeString(value) {
  return TIME_PATTERN.test(String(value || "").trim());
}

function parseLocalDate(dateStr) {
  const [year, month, day] = String(dateStr).split("-").map(Number);
  return new Date(year, month - 1, day);
}

function validateTime(value, fieldName) {
  const time = String(value || "").trim();

  if (!isValidTimeString(time)) {
    throw new ValidationError(`${fieldName} phải có định dạng HH:mm`);
  }

  return time;
}

function normalizeWindows(payload) {
  const isClosed = Boolean(payload.is_closed);

  if (isClosed) {
    return [];
  }

  const rawWindows = Array.isArray(payload.windows)
    ? payload.windows
    : payload.open_time && payload.close_time
      ? [
          {
            start_time: payload.open_time,
            end_time: payload.close_time,
          },
        ]
      : [];

  if (rawWindows.length === 0) {
    throw new ValidationError(
      "windows phải có ít nhất 1 khung giờ khi không đóng cửa",
    );
  }

  const windows = rawWindows.map((window, index) => {
    const start_time = validateTime(
      window.start_time,
      `windows[${index}].start_time`,
    );

    const end_time = validateTime(
      window.end_time,
      `windows[${index}].end_time`,
    );

    if (start_time >= end_time) {
      throw new ValidationError(
        `windows[${index}]: giờ bắt đầu phải trước giờ kết thúc`,
      );
    }

    return {
      start_time,
      end_time,
    };
  });

  const sortedWindows = [...windows].sort((a, b) =>
    a.start_time.localeCompare(b.start_time),
  );

  for (let i = 1; i < sortedWindows.length; i++) {
    const previous = sortedWindows[i - 1];
    const current = sortedWindows[i];

    if (previous.end_time > current.start_time) {
      throw new ValidationError(
        "Các khung giờ mở cửa trong cùng một ngày không được chồng lên nhau",
      );
    }
  }

  return sortedWindows;
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

  const parsed = parseLocalDate(date);

  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("date không hợp lệ");
  }

  return { date };
}

export function validateOperatingHoursPayload(payload) {
  const day_of_week = Number(payload.day_of_week);
  const is_closed = Boolean(payload.is_closed);

  if (
    !Number.isInteger(day_of_week) ||
    day_of_week < 1 ||
    day_of_week > 7
  ) {
    throw new ValidationError("day_of_week phải từ 1 đến 7");
  }

  const windows = normalizeWindows({
    ...payload,
    is_closed,
  });

  return {
    day_of_week,
    is_closed,
    windows,

    // Giữ fallback để service/mapper cũ nếu còn dùng không bị vỡ.
    open_time: windows[0]?.start_time ?? null,
    close_time: windows[0]?.end_time ?? null,
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

  const parsed = parseLocalDate(date);

  if (Number.isNaN(parsed.getTime())) {
    throw new ValidationError("date không hợp lệ");
  }

  return {
    date,
    reason,
  };
}