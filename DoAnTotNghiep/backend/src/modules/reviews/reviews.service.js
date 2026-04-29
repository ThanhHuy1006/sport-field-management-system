import { reviewsRepository } from "./reviews.repository.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";

export const reviewsService = {
  async createReview(userId, payload) {
    const booking = await reviewsRepository.findBookingForReview(
      userId,
      payload.booking_id,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    // if (!["PAID", "COMPLETED"].includes(booking.status)) {
    //   throw new ForbiddenError(
    //     "Chỉ có thể đánh giá booking đã thanh toán hoặc hoàn thành"
    //   );
    // }
    if (booking.status !== "COMPLETED") {
      throw new ForbiddenError("Chỉ có thể đánh giá booking đã hoàn thành");
    }

    const existed = await reviewsRepository.findReviewByBookingId(
      payload.booking_id,
    );
    if (existed) {
      throw new ConflictError("Booking này đã được đánh giá trước đó");
    }

    return reviewsRepository.createReview({
      booking_id: payload.booking_id,
      field_id: booking.field_id,
      user_id: userId,
      rating: payload.rating,
      comment: payload.comment,
      visible: true,
    });
  },

  async updateMyReview(userId, reviewId, payload) {
    const review = await reviewsRepository.findMyReviewById(userId, reviewId);

    if (!review) {
      throw new NotFoundError("Không tìm thấy review");
    }

    return reviewsRepository.updateMyReview(reviewId, payload);
  },

  async deleteMyReview(userId, reviewId) {
    const review = await reviewsRepository.findMyReviewById(userId, reviewId);

    if (!review) {
      throw new NotFoundError("Không tìm thấy review");
    }

    return reviewsRepository.hideMyReview(reviewId);
  },

  async getOwnerReviews(ownerId) {
    return reviewsRepository.findOwnerReviews(ownerId);
  },

  async replyOwnerReview(ownerId, reviewId, payload) {
    const review = await reviewsRepository.findOwnerReviewById(
      ownerId,
      reviewId,
    );

    if (!review) {
      throw new NotFoundError("Không tìm thấy review");
    }

    return reviewsRepository.replyOwnerReview(reviewId, payload.reply_text);
  },
  async getPublicFieldReviews(fieldId) {
    const [items, summary] = await Promise.all([
      reviewsRepository.findPublicReviewsByFieldId(fieldId),
      reviewsRepository.getFieldReviewSummary(fieldId),
    ]);

    return {
      items,
      summary: {
        average_rating: summary._avg.rating
          ? Number(summary._avg.rating.toFixed(1))
          : 0,
        total_reviews: summary._count.id,
      },
    };
  },
};
