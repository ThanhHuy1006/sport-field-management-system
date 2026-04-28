import { ValidationError } from "../../core/errors/index.js";

function toTrimmedString(value) {
  return String(value ?? "").trim();
}

function validateMaxLength(value, fieldName, maxLength) {
  if (value && value.length > maxLength) {
    throw new ValidationError(`${fieldName} không được vượt quá ${maxLength} ký tự`);
  }
}

function requireText(payload, fieldName, maxLength) {
  const value = toTrimmedString(payload[fieldName]);

  if (!value) {
    throw new ValidationError(`${fieldName} là bắt buộc`);
  }

  validateMaxLength(value, fieldName, maxLength);
  return value;
}

function optionalText(payload, fieldName, maxLength) {
  if (payload[fieldName] === undefined) {
    return undefined;
  }

  const value = toTrimmedString(payload[fieldName]);

  if (!value) {
    return null;
  }

  validateMaxLength(value, fieldName, maxLength);
  return value;
}

export function validateOwnerRegistrationPayload(payload = {}) {
  const business_name = requireText(payload, "business_name", 160);
  const address = requireText(payload, "address", 255);

  const license_url = requireText(payload, "license_url", 255);
  const id_front_url = requireText(payload, "id_front_url", 255);
  const id_back_url = requireText(payload, "id_back_url", 255);

  const tax_code = optionalText(payload, "tax_code", 50) ?? null;

  return {
    business_name,
    tax_code,
    address,
    license_url,
    id_front_url,
    id_back_url,
  };
}

export function validateOwnerRegistrationUpdatePayload(payload = {}) {
  const data = {};

  if (payload.business_name !== undefined) {
    data.business_name = requireText(payload, "business_name", 160);
  }

  if (payload.tax_code !== undefined) {
    data.tax_code = optionalText(payload, "tax_code", 50);
  }

  if (payload.address !== undefined) {
    data.address = requireText(payload, "address", 255);
  }

  if (payload.license_url !== undefined) {
    data.license_url = requireText(payload, "license_url", 255);
  }

  if (payload.id_front_url !== undefined) {
    data.id_front_url = requireText(payload, "id_front_url", 255);
  }

  if (payload.id_back_url !== undefined) {
    data.id_back_url = requireText(payload, "id_back_url", 255);
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}

export function validateOwnerProfileUpdatePayload(payload = {}) {
  const data = {};

  if (payload.name !== undefined) {
    const value = toTrimmedString(payload.name);
    if (!value) {
      throw new ValidationError("name không hợp lệ");
    }
    data.name = value;
  }

  if (payload.phone !== undefined) {
    const value = toTrimmedString(payload.phone);
    if (!value) {
      throw new ValidationError("phone không hợp lệ");
    }
    data.phone = value;
  }

  if (payload.avatar_url !== undefined) {
    data.avatar_url = payload.avatar_url ? toTrimmedString(payload.avatar_url) : null;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}