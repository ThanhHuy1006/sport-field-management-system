import { ValidationError } from "../../core/errors/index.js";

const ALLOWED_FIELD_STATUSES = ["pending", "active", "hidden", "maintenance"];

function toNullableString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  return String(value).trim();
}

function toNullableNumber(value, fieldName) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;

  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return num;
}

export function validateFieldIdParam(params) {
  const fieldId = Number(params.fieldId);

  if (Number.isNaN(fieldId) || fieldId <= 0) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  return { fieldId };
}

export function validateCreateOwnerFieldPayload(payload) {
  const field_name = String(payload.field_name || "").trim();
  const sport_type = String(payload.sport_type || "").trim();
  const address = String(payload.address || "").trim();

  if (!field_name) throw new ValidationError("field_name là bắt buộc");
  if (!sport_type) throw new ValidationError("sport_type là bắt buộc");
  if (!address) throw new ValidationError("address là bắt buộc");

  const base_price_per_hour = Number(payload.base_price_per_hour);
  if (Number.isNaN(base_price_per_hour) || base_price_per_hour < 0) {
    throw new ValidationError("base_price_per_hour không hợp lệ");
  }

  const latitude = toNullableNumber(payload.latitude, "latitude");
  const longitude = toNullableNumber(payload.longitude, "longitude");

  const min_duration_minutes =
    payload.min_duration_minutes !== undefined
      ? Number(payload.min_duration_minutes)
      : 60;

  if (
    Number.isNaN(min_duration_minutes) ||
    min_duration_minutes <= 0 ||
    min_duration_minutes % 30 !== 0
  ) {
    throw new ValidationError("min_duration_minutes phải là số dương và chia hết cho 30");
  }

  const max_players =
    payload.max_players !== undefined ? Number(payload.max_players) : null;

  if (max_players !== null && (Number.isNaN(max_players) || max_players <= 0)) {
    throw new ValidationError("max_players không hợp lệ");
  }

  const currency = payload.currency ? String(payload.currency).trim().toUpperCase() : "VND";

  return {
    field_name,
    sport_type,
    description: toNullableString(payload.description) ?? null,
    address,
    latitude,
    longitude,
    base_price_per_hour,
    currency,
    status: "pending",
    min_duration_minutes,
    max_players,
  };
}

export function validateUpdateOwnerFieldPayload(payload) {
  const data = {};

  if (payload.field_name !== undefined) {
    const value = String(payload.field_name || "").trim();
    if (!value) throw new ValidationError("field_name không hợp lệ");
    data.field_name = value;
  }

  if (payload.sport_type !== undefined) {
    const value = String(payload.sport_type || "").trim();
    if (!value) throw new ValidationError("sport_type không hợp lệ");
    data.sport_type = value;
  }

  if (payload.description !== undefined) {
    data.description = toNullableString(payload.description);
  }

  if (payload.address !== undefined) {
    const value = String(payload.address || "").trim();
    if (!value) throw new ValidationError("address không hợp lệ");
    data.address = value;
  }

  if (payload.latitude !== undefined) {
    data.latitude = toNullableNumber(payload.latitude, "latitude");
  }

  if (payload.longitude !== undefined) {
    data.longitude = toNullableNumber(payload.longitude, "longitude");
  }

  if (payload.base_price_per_hour !== undefined) {
    const value = Number(payload.base_price_per_hour);
    if (Number.isNaN(value) || value < 0) {
      throw new ValidationError("base_price_per_hour không hợp lệ");
    }
    data.base_price_per_hour = value;
  }

  if (payload.currency !== undefined) {
    const value = String(payload.currency || "").trim().toUpperCase();
    if (!value) throw new ValidationError("currency không hợp lệ");
    data.currency = value;
  }

  if (payload.min_duration_minutes !== undefined) {
    const value = Number(payload.min_duration_minutes);
    if (Number.isNaN(value) || value <= 0 || value % 30 !== 0) {
      throw new ValidationError("min_duration_minutes phải là số dương và chia hết cho 30");
    }
    data.min_duration_minutes = value;
  }

  if (payload.max_players !== undefined) {
    const value =
      payload.max_players === null || payload.max_players === ""
        ? null
        : Number(payload.max_players);

    if (value !== null && (Number.isNaN(value) || value <= 0)) {
      throw new ValidationError("max_players không hợp lệ");
    }

    data.max_players = value;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}

export function validateOwnerFieldStatusPayload(payload) {
  const status = String(payload.status || "").trim().toLowerCase();

  if (!ALLOWED_FIELD_STATUSES.includes(status)) {
    throw new ValidationError("status không hợp lệ");
  }

  return { status };
}