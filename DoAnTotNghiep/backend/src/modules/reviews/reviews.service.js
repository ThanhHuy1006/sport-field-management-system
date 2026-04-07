import { reviewsRepository } from "./reviews.repository.js";
import {
  validateCreateReviewPayload,
  validateUpdateReviewPayload,
  validateReplyReviewPayload,
} from "./reviews.validator.js";

export const reviewsService = {
  async createReview(userId, payload) {
    const valid = validateCreateReviewPayload(payload);

    const booking = await reviewsRepository.findBookingForReview(
      userId,
      valid.booking_id
    );

    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (!["PAID", "COMPLETED"].includes(booking.status)) {
      throw new Error("Chỉ có thể đánh giá booking đã thanh toán hoặc hoàn thành");
    }

    const existed = await reviewsRepository.findReviewByBookingId(valid.booking_id);
    if (existed) {
      throw new Error("Booking này đã được đánh giá trước đó");
    }

    return reviewsRepository.createReview({
      booking_id: valid.booking_id,
      field_id: booking.field_id,
      user_id: userId,
      rating: valid.rating,
      comment: valid.comment,
      visible: true,
    });
  },

  async updateMyReview(userId, reviewId, payload) {
    const id = Number(reviewId);
    if (Number.isNaN(id)) {
      throw new Error("reviewId không hợp lệ");
    }

    const review = await reviewsRepository.findMyReviewById(userId, id);
    if (!review) {
      throw new Error("Không tìm thấy review");
    }

    const valid = validateUpdateReviewPayload(payload);

    return reviewsRepository.updateMyReview(id, valid);
  },

  async deleteMyReview(userId, reviewId) {
    const id = Number(reviewId);
    if (Number.isNaN(id)) {
      throw new Error("reviewId không hợp lệ");
    }

    const review = await reviewsRepository.findMyReviewById(userId, id);
    if (!review) {
      throw new Error("Không tìm thấy review");
    }

    return reviewsRepository.hideMyReview(id);
  },

  async getOwnerReviews(ownerId) {
    return reviewsRepository.findOwnerReviews(ownerId);
  },

  async replyOwnerReview(ownerId, reviewId, payload) {
    const id = Number(reviewId);
    if (Number.isNaN(id)) {
      throw new Error("reviewId không hợp lệ");
    }

    const review = await reviewsRepository.findOwnerReviewById(ownerId, id);
    if (!review) {
      throw new Error("Không tìm thấy review");
    }

    const valid = validateReplyReviewPayload(payload);

    return reviewsRepository.replyOwnerReview(id, valid.reply_text);
  },
};