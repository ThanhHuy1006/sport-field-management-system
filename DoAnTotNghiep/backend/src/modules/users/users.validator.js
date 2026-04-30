//todo
import { ValidationError } from "../../core/errors/index.js";

export function validateUpdateMePayload(payload) {
  const data = {};

  if (payload.name !== undefined) {
    const name = String(payload.name || "").trim();

    if (!name) {
      throw new ValidationError("Tên không được để trống");
    }

    if (name.length > 120) {
      throw new ValidationError("Tên không được vượt quá 120 ký tự");
    }

    data.name = name;
  }

  if (payload.phone !== undefined) {
    const phone = String(payload.phone || "").trim();

    if (phone && phone.length > 30) {
      throw new ValidationError("Số điện thoại không được vượt quá 30 ký tự");
    }

    data.phone = phone || null;
  }

  if (payload.avatar_url !== undefined) {
    const avatarUrl = String(payload.avatar_url || "").trim();

    if (avatarUrl && avatarUrl.length > 500) {
      throw new ValidationError("Đường dẫn ảnh đại diện không được vượt quá 500 ký tự");
    }

    data.avatar_url = avatarUrl || null;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}