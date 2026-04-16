import { ValidationError } from "../../core/errors/index.js";

export function validateOwnerRegistrationPayload(payload) {
  const business_name = String(payload.business_name || "").trim();

  if (!business_name) {
    throw new ValidationError("business_name là bắt buộc");
  }

  return { business_name };
}

export function validateOwnerRegistrationUpdatePayload(payload) {
  const data = {};

  if (payload.business_name !== undefined) {
    const value = String(payload.business_name || "").trim();
    if (!value) {
      throw new ValidationError("business_name không hợp lệ");
    }
    data.business_name = value;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}

export function validateOwnerProfileUpdatePayload(payload) {
  const data = {};

  if (payload.name !== undefined) {
    const value = String(payload.name || "").trim();
    if (!value) {
      throw new ValidationError("name không hợp lệ");
    }
    data.name = value;
  }

  if (payload.phone !== undefined) {
    const value = String(payload.phone || "").trim();
    if (!value) {
      throw new ValidationError("phone không hợp lệ");
    }
    data.phone = value;
  }

  if (payload.avatar_url !== undefined) {
    data.avatar_url = payload.avatar_url ? String(payload.avatar_url).trim() : null;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}