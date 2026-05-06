// src/modules/reviews/__tests__/reviews.service.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../reviews.repository.js", () => ({
  reviewsRepository: {
    findBookingForReview: vi.fn(),
    findReviewByBookingId: vi.fn(),
    createReview: vi.fn(),
    findMyReviewById: vi.fn(),
    updateMyReview: vi.fn(),
    hideMyReview: vi.fn(),
    findOwnerReviews: vi.fn(),
    findOwnerReviewById: vi.fn(),
    replyOwnerReview: vi.fn(),
    findPublicReviewsByFieldId: vi.fn(),
    getFieldReviewSummary: vi.fn(),
  },
}));

import { reviewsService } from "../reviews.service.js";
import { reviewsRepository } from "../reviews.repository.js";

describe("reviews.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createReview", () => {
    it("báo lỗi nếu không tìm thấy booking", async () => {
      reviewsRepository.findBookingForReview.mockResolvedValue(null);

      await expect(
        reviewsService.createReview(5, {
          booking_id: 100,
          rating: 5,
          comment: "Sân tốt",
        }),
      ).rejects.toThrow("Không tìm thấy booking");

      expect(reviewsRepository.findReviewByBookingId).not.toHaveBeenCalled();
      expect(reviewsRepository.createReview).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu booking chưa hoàn thành", async () => {
      reviewsRepository.findBookingForReview.mockResolvedValue({
        id: 100,
        field_id: 3,
        user_id: 5,
        status: "PAID",
      });

      await expect(
        reviewsService.createReview(5, {
          booking_id: 100,
          rating: 5,
          comment: "Sân tốt",
        }),
      ).rejects.toThrow("Chỉ có thể đánh giá booking đã hoàn thành");

      expect(reviewsRepository.findReviewByBookingId).not.toHaveBeenCalled();
      expect(reviewsRepository.createReview).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu booking đã được đánh giá trước đó", async () => {
      reviewsRepository.findBookingForReview.mockResolvedValue({
        id: 100,
        field_id: 3,
        user_id: 5,
        status: "COMPLETED",
      });

      reviewsRepository.findReviewByBookingId.mockResolvedValue({
        id: 1,
        booking_id: 100,
      });

      await expect(
        reviewsService.createReview(5, {
          booking_id: 100,
          rating: 5,
          comment: "Sân tốt",
        }),
      ).rejects.toThrow("Booking này đã được đánh giá trước đó");

      expect(reviewsRepository.createReview).not.toHaveBeenCalled();
    });

    it("tạo review thành công nếu booking đã hoàn thành và chưa có review", async () => {
      reviewsRepository.findBookingForReview.mockResolvedValue({
        id: 100,
        field_id: 3,
        user_id: 5,
        status: "COMPLETED",
      });

      reviewsRepository.findReviewByBookingId.mockResolvedValue(null);

      reviewsRepository.createReview.mockResolvedValue({
        id: 1,
        booking_id: 100,
        field_id: 3,
        user_id: 5,
        rating: 5,
        comment: "Sân tốt",
        visible: true,
      });

      const result = await reviewsService.createReview(5, {
        booking_id: 100,
        rating: 5,
        comment: "Sân tốt",
      });

      expect(reviewsRepository.findBookingForReview).toHaveBeenCalledWith(
        5,
        100,
      );

      expect(reviewsRepository.findReviewByBookingId).toHaveBeenCalledWith(100);

      expect(reviewsRepository.createReview).toHaveBeenCalledWith({
        booking_id: 100,
        field_id: 3,
        user_id: 5,
        rating: 5,
        comment: "Sân tốt",
        visible: true,
      });

      expect(result.id).toBe(1);
      expect(result.visible).toBe(true);
    });
  });

  describe("updateMyReview", () => {
    it("báo lỗi nếu không tìm thấy review của user", async () => {
      reviewsRepository.findMyReviewById.mockResolvedValue(null);

      await expect(
        reviewsService.updateMyReview(5, 999, {
          rating: 4,
          comment: "Cập nhật",
        }),
      ).rejects.toThrow("Không tìm thấy review");

      expect(reviewsRepository.updateMyReview).not.toHaveBeenCalled();
    });

    it("cập nhật review thành công nếu review thuộc user", async () => {
      reviewsRepository.findMyReviewById.mockResolvedValue({
        id: 1,
        user_id: 5,
      });

      reviewsRepository.updateMyReview.mockResolvedValue({
        id: 1,
        user_id: 5,
        rating: 4,
        comment: "Cập nhật",
      });

      const result = await reviewsService.updateMyReview(5, 1, {
        rating: 4,
        comment: "Cập nhật",
      });

      expect(reviewsRepository.findMyReviewById).toHaveBeenCalledWith(5, 1);

      expect(reviewsRepository.updateMyReview).toHaveBeenCalledWith(1, {
        rating: 4,
        comment: "Cập nhật",
      });

      expect(result.rating).toBe(4);
      expect(result.comment).toBe("Cập nhật");
    });
  });

  describe("deleteMyReview", () => {
    it("báo lỗi nếu không tìm thấy review của user khi xóa", async () => {
      reviewsRepository.findMyReviewById.mockResolvedValue(null);

      await expect(reviewsService.deleteMyReview(5, 999)).rejects.toThrow(
        "Không tìm thấy review",
      );

      expect(reviewsRepository.hideMyReview).not.toHaveBeenCalled();
    });

    it("ẩn review thành công nếu review thuộc user", async () => {
      reviewsRepository.findMyReviewById.mockResolvedValue({
        id: 1,
        user_id: 5,
        visible: true,
      });

      reviewsRepository.hideMyReview.mockResolvedValue({
        id: 1,
        user_id: 5,
        visible: false,
      });

      const result = await reviewsService.deleteMyReview(5, 1);

      expect(reviewsRepository.findMyReviewById).toHaveBeenCalledWith(5, 1);
      expect(reviewsRepository.hideMyReview).toHaveBeenCalledWith(1);
      expect(result.visible).toBe(false);
    });
  });

  describe("getOwnerReviews", () => {
    it("trả về danh sách review của owner", async () => {
      reviewsRepository.findOwnerReviews.mockResolvedValue([
        {
          id: 1,
          field_id: 3,
          rating: 5,
        },
        {
          id: 2,
          field_id: 4,
          rating: 4,
        },
      ]);

      const result = await reviewsService.getOwnerReviews(10);

      expect(reviewsRepository.findOwnerReviews).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(2);
    });
  });

  describe("replyOwnerReview", () => {
    it("báo lỗi nếu owner không tìm thấy review thuộc sân của mình", async () => {
      reviewsRepository.findOwnerReviewById.mockResolvedValue(null);

      await expect(
        reviewsService.replyOwnerReview(10, 999, {
          reply_text: "Cảm ơn bạn",
        }),
      ).rejects.toThrow("Không tìm thấy review");

      expect(reviewsRepository.replyOwnerReview).not.toHaveBeenCalled();
    });

    it("owner phản hồi review thành công", async () => {
      reviewsRepository.findOwnerReviewById.mockResolvedValue({
        id: 1,
        field_id: 3,
        rating: 5,
      });

      reviewsRepository.replyOwnerReview.mockResolvedValue({
        id: 1,
        reply_text: "Cảm ơn bạn",
        reply_at: new Date("2099-06-01T10:00:00"),
      });

      const result = await reviewsService.replyOwnerReview(10, 1, {
        reply_text: "Cảm ơn bạn",
      });

      expect(reviewsRepository.findOwnerReviewById).toHaveBeenCalledWith(10, 1);

      expect(reviewsRepository.replyOwnerReview).toHaveBeenCalledWith(
        1,
        "Cảm ơn bạn",
      );

      expect(result.reply_text).toBe("Cảm ơn bạn");
    });
  });

  describe("getPublicFieldReviews", () => {
    it("trả về danh sách review public và summary có average_rating", async () => {
      reviewsRepository.findPublicReviewsByFieldId.mockResolvedValue([
        {
          id: 1,
          field_id: 3,
          rating: 5,
          visible: true,
        },
        {
          id: 2,
          field_id: 3,
          rating: 4,
          visible: true,
        },
      ]);

      reviewsRepository.getFieldReviewSummary.mockResolvedValue({
        _avg: {
          rating: 4.666,
        },
        _count: {
          id: 2,
        },
      });

      const result = await reviewsService.getPublicFieldReviews(3);

      expect(reviewsRepository.findPublicReviewsByFieldId).toHaveBeenCalledWith(
        3,
      );

      expect(reviewsRepository.getFieldReviewSummary).toHaveBeenCalledWith(3);

      expect(result.items).toHaveLength(2);
      expect(result.summary).toEqual({
        average_rating: 4.7,
        total_reviews: 2,
      });
    });

    it("trả average_rating = 0 nếu sân chưa có review", async () => {
      reviewsRepository.findPublicReviewsByFieldId.mockResolvedValue([]);

      reviewsRepository.getFieldReviewSummary.mockResolvedValue({
        _avg: {
          rating: null,
        },
        _count: {
          id: 0,
        },
      });

      const result = await reviewsService.getPublicFieldReviews(3);

      expect(result.items).toEqual([]);
      expect(result.summary).toEqual({
        average_rating: 0,
        total_reviews: 0,
      });
    });
  });
});