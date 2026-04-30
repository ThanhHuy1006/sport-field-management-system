import { ValidationError } from "../../core/errors/index.js";

const ALLOWED_RANGES = ["today", "7d", "30d", "month", "year", "custom"];

function parseOptionalPositiveInt(value, fieldName) {
  if (value === undefined || value === null || value === "" || value === "all") {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number) || number <= 0) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return number;
}

function normalizeDate(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return value;
}

export function validateReportQuery(query) {
  const range = String(query.range || "month").trim();

  if (!ALLOWED_RANGES.includes(range)) {
    throw new ValidationError("range không hợp lệ");
  }

  const fieldId = parseOptionalPositiveInt(query.field_id, "field_id");
  const sportType = String(query.sport_type || "").trim() || null;
  const district = String(query.district || "").trim() || null;
  const from = normalizeDate(query.from, "from");
  const to = normalizeDate(query.to, "to");

  if (range === "custom" && (!from || !to)) {
    throw new ValidationError("from và to là bắt buộc khi range=custom");
  }

  if (from && to && new Date(`${from}T00:00:00`) > new Date(`${to}T00:00:00`)) {
    throw new ValidationError("from phải nhỏ hơn hoặc bằng to");
  }

  return {
    range,
    field_id: fieldId,
    sport_type: sportType,
    district,
    from,
    to,
  };
}