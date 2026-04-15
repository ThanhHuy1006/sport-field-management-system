export function validateNotificationId(value) {
  const id = Number(value);
  if (Number.isNaN(id) || id <= 0) {
    throw new Error("notificationId không hợp lệ");
  }
  return id;
}

export function validateBroadcastPayload(payload) {
  const title = String(payload.title || "").trim();
  const message = String(payload.message || "").trim();
  const type = String(payload.type || "SYSTEM").trim().toUpperCase();

  if (!title) {
    throw new Error("title là bắt buộc");
  }

  if (!message) {
    throw new Error("message là bắt buộc");
  }

  return {
    title,
    message,
    type,
    data: payload.data || null,
  };
}