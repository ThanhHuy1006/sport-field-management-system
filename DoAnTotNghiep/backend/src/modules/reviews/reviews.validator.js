import { ValidationError } from "../../core/errors/index.js";

export function validateReviewIdParams(params) {
  const reviewId = Number(params.reviewId);

  if (Number.isNaN(reviewId) || reviewId <= 0) {
    throw new ValidationError("reviewId không hợp lệ");
  }

  return { reviewId };
}

export function validateCreateReviewPayload(payload) {
  const booking_id = Number(payload.booking_id);
  const rating = Number(payload.rating);
  const comment = payload.comment ? String(payload.comment).trim() : null;

  if (Number.isNaN(booking_id) || booking_id <= 0) {
    throw new ValidationError("booking_id không hợp lệ");
  }

  if (Number.isNaN(rating) || rating < 1 || rating > 5) {
    throw new ValidationError("rating phải từ 1 đến 5");
  }

  return {
    booking_id,
    rating,
    comment,
  };
}

export function validateUpdateReviewPayload(payload) {
  const data = {};

  if (payload.rating !== undefined) {
    const rating = Number(payload.rating);
    if (Number.isNaN(rating) || rating < 1 || rating > 5) {
      throw new ValidationError("rating phải từ 1 đến 5");
    }
    data.rating = rating;
  }

  if (payload.comment !== undefined) {
    data.comment = payload.comment ? String(payload.comment).trim() : null;
  }

  if (Object.keys(data).length === 0) {
    throw new ValidationError("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}

export function validateReplyReviewPayload(payload) {
  const reply_text = payload.reply_text ? String(payload.reply_text).trim() : "";

  if (!reply_text) {
    throw new ValidationError("reply_text là bắt buộc");
  }

  return { reply_text };
}
export function validateFieldReviewParams(params) {
  const fieldId = Number(params.fieldId);

  if (Number.isNaN(fieldId) || fieldId <= 0) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  return { fieldId };
}