export function validateRegisterPayload(payload) {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");
  const phone = payload.phone ? String(payload.phone).trim() : null;

  if (!name) {
    throw new Error("name là bắt buộc");
  }

  if (!email) {
    throw new Error("email là bắt buộc");
  }

  if (!/\S+@\S+\.\S+/.test(email)) {
    throw new Error("email không hợp lệ");
  }

  if (!password) {
    throw new Error("password là bắt buộc");
  }

  if (password.length < 6) {
    throw new Error("password phải có ít nhất 6 ký tự");
  }

  return {
    name,
    email,
    password,
    phone,
  };
}

export function validateLoginPayload(payload) {
  const email = String(payload.email || "").trim().toLowerCase();
  const password = String(payload.password || "");

  if (!email) {
    throw new Error("email là bắt buộc");
  }

  if (!password) {
    throw new Error("password là bắt buộc");
  }

  return {
    email,
    password,
  };
}

export function validateChangePasswordPayload(payload) {
  const oldPassword = String(payload.oldPassword || "");
  const newPassword = String(payload.newPassword || "");

  if (!oldPassword || !newPassword) {
    throw new Error("oldPassword và newPassword là bắt buộc");
  }

  if (newPassword.length < 6) {
    throw new Error("newPassword phải có ít nhất 6 ký tự");
  }

  if (oldPassword === newPassword) {
    throw new Error("newPassword phải khác oldPassword");
  }

  return {
    oldPassword,
    newPassword,
  };
}