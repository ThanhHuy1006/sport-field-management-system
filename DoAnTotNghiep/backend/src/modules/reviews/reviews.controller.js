import { successResponse, createdResponse } from "../../core/utils/response.js";
import { reviewsService } from "./reviews.service.js";
import { toReviewResponse } from "./reviews.mapper.js";

export const reviewsController = {
  async createReview(req, res, next) {
    try {
      const payload = req.validated?.body ?? req.body;
      const item = await reviewsService.createReview(req.user.id, payload);

      return createdResponse(
        res,
        toReviewResponse(item),
        "Tạo review thành công",
      );
    } catch (error) {
      next(error);
    }
  },

  async updateMyReview(req, res, next) {
    try {
      const { reviewId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const item = await reviewsService.updateMyReview(
        req.user.id,
        reviewId,
        payload,
      );

      return successResponse(
        res,
        toReviewResponse(item),
        "Cập nhật review thành công",
      );
    } catch (error) {
      next(error);
    }
  },

  async deleteMyReview(req, res, next) {
    try {
      const { reviewId } = req.validated?.params ?? req.params;

      await reviewsService.deleteMyReview(req.user.id, reviewId);

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
        "Lấy danh sách review của owner thành công",
      );
    } catch (error) {
      next(error);
    }
  },

  async replyOwnerReview(req, res, next) {
    try {
      const { reviewId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const item = await reviewsService.replyOwnerReview(
        req.user.id,
        reviewId,
        payload,
      );

      return successResponse(
        res,
        toReviewResponse(item),
        "Phản hồi review thành công",
      );
    } catch (error) {
      next(error);
    }
  },
  async getPublicFieldReviews(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;

      const result = await reviewsService.getPublicFieldReviews(fieldId);

      return successResponse(
        res,
        {
          items: result.items.map(toReviewResponse),
          summary: result.summary,
        },
        "Lấy danh sách đánh giá của sân thành công",
      );
    } catch (error) {
      next(error);
    }
  },
};
