const USER_STATUSES = ["active", "locked", "deleted"];
const OWNER_STATUSES = ["pending", "approved", "rejected"];

export function validateUserStatusPayload(payload) {
  const status = String(payload.status || "").trim().toLowerCase();

  if (!USER_STATUSES.includes(status)) {
    throw new Error("status user không hợp lệ");
  }

  return { status };
}

export function validateRejectOwnerPayload(payload) {
  const reason = payload.reason ? String(payload.reason).trim() : "";

  if (!reason) {
    throw new Error("reason là bắt buộc");
  }

  return { reason };
}

export function validateId(value, name = "id") {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error(`${name} không hợp lệ`);
  }
  return id;
}