import { ValidationError } from "../../core/errors/index.js";

const ALLOWED_NOTIFICATION_TYPES = ["BOOKING", "PAYMENT", "SYSTEM", "PROMO"];

export function validateNotificationIdParams(params) {
  const notificationId = Number(params.notificationId);

  if (Number.isNaN(notificationId) || notificationId <= 0) {
    throw new ValidationError("notificationId không hợp lệ");
  }

  return { notificationId };
}

export function validateBroadcastPayload(payload) {
  const title = String(payload.title || "").trim();
  const body = String(payload.body || "").trim();
  const type = String(payload.type || "SYSTEM").trim().toUpperCase();

  if (!title) {
    throw new ValidationError("title là bắt buộc");
  }

  if (!body) {
    throw new ValidationError("body là bắt buộc");
  }

  if (!ALLOWED_NOTIFICATION_TYPES.includes(type)) {
    throw new ValidationError("type notification không hợp lệ");
  }

  return {
    title,
    body,
    type,
  };
}