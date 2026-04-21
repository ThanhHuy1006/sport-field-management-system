import { ValidationError } from "../../core/errors/index.js";

export function validateNotificationIdParams(params) {
  const notificationId = Number(params.notificationId);

  if (Number.isNaN(notificationId) || notificationId <= 0) {
    throw new ValidationError("notificationId không hợp lệ");
  }

  return { notificationId };
}

export function validateBroadcastPayload(payload) {
  const title = String(payload.title || "").trim();
  const message = String(payload.message || "").trim();
  const type = String(payload.type || "SYSTEM").trim().toUpperCase();

  if (!title) {
    throw new ValidationError("title là bắt buộc");
  }

  if (!message) {
    throw new ValidationError("message là bắt buộc");
  }

  return {
    title,
    message,
    type,
    data: payload.data || null,
  };
}