import { ValidationError } from "../../core/errors/index.js";

// const ALLOWED_FIELD_STATUSES = ["pending", "active", "hidden", "maintenance"];
const ALLOWED_OWNER_FIELD_STATUSES = ["inactive", "maintenance"];
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const ALLOWED_APPROVAL_MODES = ["MANUAL", "AUTO"];

function toNullableString(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;

  const text = String(value).trim();
  return text || null;
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

function toPositiveMoney(value, fieldName) {
  const num = Number(value);

  if (Number.isNaN(num) || num < 0) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return num;
}

function validateTime(value, fieldName) {
  const time = String(value || "").trim();

  if (!TIME_PATTERN.test(time)) {
    throw new ValidationError(`${fieldName} phải có định dạng HH:mm`);
  }

  return time;
}

function buildFullAddress({ address, address_line, ward, district, province }) {
  const fullAddress = String(address || "").trim();

  if (fullAddress) {
    return fullAddress;
  }

  return [address_line, ward, district, province]
    .map((item) => (item === undefined || item === null ? "" : String(item).trim()))
    .filter(Boolean)
    .join(", ");
}

function normalizeAmenities(value) {
  if (value === undefined || value === null) return [];

  if (!Array.isArray(value)) {
    throw new ValidationError("amenities phải là mảng");
  }

  const names = value
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return [...new Set(names)];
}
function normalizeApprovalMode(value) {
  if (value === undefined) return undefined;

  const mode = String(value || "").trim().toUpperCase();

  if (!ALLOWED_APPROVAL_MODES.includes(mode)) {
    throw new ValidationError("approval_mode không hợp lệ");
  }

  return mode;
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

  const address_line = toNullableString(payload.address_line) ?? null;
  const ward = toNullableString(payload.ward) ?? null;
  const district = toNullableString(payload.district) ?? null;
  const province = toNullableString(payload.province) ?? null;

  const address = buildFullAddress({
    address: payload.address,
    address_line,
    ward,
    district,
    province,
  });

  if (!field_name) throw new ValidationError("field_name là bắt buộc");
  if (!sport_type) throw new ValidationError("sport_type là bắt buộc");
  if (!address) throw new ValidationError("address là bắt buộc");

  const weekday_price =
    payload.weekday_price !== undefined
      ? toPositiveMoney(payload.weekday_price, "weekday_price")
      : toPositiveMoney(payload.base_price_per_hour, "base_price_per_hour");

  const weekend_price =
    payload.weekend_price !== undefined
      ? toPositiveMoney(payload.weekend_price, "weekend_price")
      : weekday_price;

  if (weekday_price < 50000) {
    throw new ValidationError("weekday_price tối thiểu 50,000 VND");
  }

  if (weekend_price < 50000) {
    throw new ValidationError("weekend_price tối thiểu 50,000 VND");
  }

  // const open_time = validateTime(payload.open_time ?? "06:00", "open_time");
  // const close_time = validateTime(payload.close_time ?? "22:00", "close_time");

  // if (open_time >= close_time) {
  //   throw new ValidationError("open_time phải trước close_time");
  // }

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

  const currency = payload.currency
    ? String(payload.currency).trim().toUpperCase()
    : "VND";

  const amenities = normalizeAmenities(payload.amenities);
  const approval_mode = normalizeApprovalMode(payload.approval_mode) ?? "MANUAL";

  return {
    fieldData: {
      field_name,
      sport_type,
      description: toNullableString(payload.description) ?? null,

      address,
      address_line,
      ward,
      district,
      province,

      latitude,
      longitude,
      base_price_per_hour: weekday_price,
      currency,
      status: "pending",
      approval_mode,
      min_duration_minutes,
      max_players,
    },

    pricingRules: [
      {
        day_type: "WEEKDAY",
        start_time: "00:00",
        end_time: "23:59",
        price: weekday_price,
        currency,
        priority: 0,
        active: true,
      },
      {
        day_type: "WEEKEND",
        start_time: "00:00",
        end_time: "23:59",
        price: weekend_price,
        currency,
        priority: 0,
        active: true,
      },
    ],

    // operatingHours: Array.from({ length: 7 }, (_, index) => ({
    //   day_of_week: index + 1,
    //   open_time,
    //   close_time,
    // })),

    amenities,
  };
}

export function validateUpdateOwnerFieldPayload(payload) {
  const fieldData = {};
  const pricingRules = [];
  let amenities;

  if (payload.field_name !== undefined) {
    const value = String(payload.field_name || "").trim();
    if (!value) throw new ValidationError("field_name không hợp lệ");
    fieldData.field_name = value;
  }

  if (payload.sport_type !== undefined) {
    const value = String(payload.sport_type || "").trim();
    if (!value) throw new ValidationError("sport_type không hợp lệ");
    fieldData.sport_type = value;
  }

  if (payload.description !== undefined) {
    fieldData.description = toNullableString(payload.description);
  }

  if (payload.address !== undefined) {
    const value = String(payload.address || "").trim();
    if (!value) throw new ValidationError("address không hợp lệ");
    fieldData.address = value;
  }

  if (payload.address_line !== undefined) {
    fieldData.address_line = toNullableString(payload.address_line);
  }

  if (payload.ward !== undefined) {
    fieldData.ward = toNullableString(payload.ward);
  }

  if (payload.district !== undefined) {
    fieldData.district = toNullableString(payload.district);
  }

  if (payload.province !== undefined) {
    fieldData.province = toNullableString(payload.province);
  }

  if (
    payload.address === undefined &&
    (
      payload.address_line !== undefined ||
      payload.ward !== undefined ||
      payload.district !== undefined ||
      payload.province !== undefined
    )
  ) {
    const address = buildFullAddress({
      address: "",
      address_line: payload.address_line,
      ward: payload.ward,
      district: payload.district,
      province: payload.province,
    });

    if (address) {
      fieldData.address = address;
    }
  }

  if (payload.latitude !== undefined) {
    fieldData.latitude = toNullableNumber(payload.latitude, "latitude");
  }

  if (payload.longitude !== undefined) {
    fieldData.longitude = toNullableNumber(payload.longitude, "longitude");
  }

  if (payload.currency !== undefined) {
    const value = String(payload.currency || "").trim().toUpperCase();
    if (!value) throw new ValidationError("currency không hợp lệ");
    fieldData.currency = value;
  }

  const currency = fieldData.currency || String(payload.currency || "VND").trim().toUpperCase();

  if (payload.weekday_price !== undefined || payload.base_price_per_hour !== undefined) {
    const weekdayPrice =
      payload.weekday_price !== undefined
        ? toPositiveMoney(payload.weekday_price, "weekday_price")
        : toPositiveMoney(payload.base_price_per_hour, "base_price_per_hour");

    if (weekdayPrice < 50000) {
      throw new ValidationError("weekday_price tối thiểu 50,000 VND");
    }

    fieldData.base_price_per_hour = weekdayPrice;

    pricingRules.push({
      day_type: "WEEKDAY",
      start_time: "00:00",
      end_time: "23:59",
      price: weekdayPrice,
      currency,
      priority: 0,
      active: true,
    });
  }

  if (payload.weekend_price !== undefined) {
    const weekendPrice = toPositiveMoney(payload.weekend_price, "weekend_price");

    if (weekendPrice < 50000) {
      throw new ValidationError("weekend_price tối thiểu 50,000 VND");
    }

    pricingRules.push({
      day_type: "WEEKEND",
      start_time: "00:00",
      end_time: "23:59",
      price: weekendPrice,
      currency,
      priority: 0,
      active: true,
    });
  }

  if (payload.min_duration_minutes !== undefined) {
    const value = Number(payload.min_duration_minutes);
    if (Number.isNaN(value) || value <= 0 || value % 30 !== 0) {
      throw new ValidationError("min_duration_minutes phải là số dương và chia hết cho 30");
    }

    fieldData.min_duration_minutes = value;
  }

  if (payload.max_players !== undefined) {
    const value =
      payload.max_players === null || payload.max_players === ""
        ? null
        : Number(payload.max_players);

    if (value !== null && (Number.isNaN(value) || value <= 0)) {
      throw new ValidationError("max_players không hợp lệ");
    }

    fieldData.max_players = value;
  }

  if (payload.approval_mode !== undefined) {
    fieldData.approval_mode = normalizeApprovalMode(payload.approval_mode);
  }

  if (payload.amenities !== undefined) {
    amenities = normalizeAmenities(payload.amenities);
  }

  if (
    Object.keys(fieldData).length === 0 &&
    pricingRules.length === 0 &&
    amenities === undefined
  ) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return {
    fieldData,
    pricingRules,
    amenities,
  };
}


// export function validateOwnerFieldStatusPayload(payload) {
//   const status = String(payload.status || "").trim().toLowerCase();

//   if (!ALLOWED_FIELD_STATUSES.includes(status)) {
//     throw new ValidationError("status không hợp lệ");
//   }

//   return { status };
  
// }
export function validateOwnerFieldStatusPayload(payload) {
  const status = String(payload.status || "").trim().toLowerCase();

  if (!ALLOWED_OWNER_FIELD_STATUSES.includes(status)) {
    throw new ValidationError(
      "Owner chỉ được chuyển sân sang inactive hoặc maintenance"
    );
  }

  return { status };
}
export function validateFieldImageParams(params) {
  const fieldId = Number(params.fieldId);
  const imageId = Number(params.imageId);

  if (Number.isNaN(fieldId) || fieldId <= 0) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  if (Number.isNaN(imageId) || imageId <= 0) {
    throw new ValidationError("imageId không hợp lệ");
  }

  return { fieldId, imageId };
}