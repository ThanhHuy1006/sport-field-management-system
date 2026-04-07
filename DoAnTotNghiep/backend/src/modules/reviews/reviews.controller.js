import { successResponse } from "../../core/utils/response.js";
import { reviewsService } from "./reviews.service.js";
import { toReviewResponse } from "./reviews.mapper.js";

export const reviewsController = {
  async createReview(req, res, next) {
    try {
      const item = await reviewsService.createReview(req.user.id, req.body);
      return successResponse(res, toReviewResponse(item), "Tạo review thành công", 201);
    } catch (error) {
      next(error);
    }
  },

  async updateMyReview(req, res, next) {
    try {
      const item = await reviewsService.updateMyReview(
        req.user.id,
        req.params.reviewId,
        req.body
      );
      return successResponse(res, toReviewResponse(item), "Cập nhật review thành công");
    } catch (error) {
      next(error);
    }
  },

  async deleteMyReview(req, res, next) {
    try {
      await reviewsService.deleteMyReview(req.user.id, req.params.reviewId);
      return successResponse(res, null, "Ẩn review thành công");
    } catch (error) {
      next(error);
    }
  },

  async getOwnerReviews(req, res, next) {
    try {
      const items = await reviewsService.getOwnerReviews(req.user.id);
      return successResponse(
        res,
        items.map(toReviewResponse),
        "Lấy danh sách review của owner thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async replyOwnerReview(req, res, next) {
    try {
      const item = await reviewsService.replyOwnerReview(
        req.user.id,
        req.params.reviewId,
        req.body
      );
      return successResponse(res, toReviewResponse(item), "Phản hồi review thành công");
    } catch (error) {
      next(error);
    }
  },
};