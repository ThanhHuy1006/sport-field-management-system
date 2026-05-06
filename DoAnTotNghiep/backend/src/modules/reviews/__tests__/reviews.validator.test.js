// src/modules/reviews/__tests__/reviews.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateReviewIdParams,
  validateCreateReviewPayload,
  validateUpdateReviewPayload,
  validateReplyReviewPayload,
  validateFieldReviewParams,
} from "../reviews.validator.js";

describe("reviews.validator", () => {
  describe("validateReviewIdParams", () => {
    it("trả về reviewId hợp lệ", () => {
      const result = validateReviewIdParams({ reviewId: "10" });

      expect(result).toEqual({ reviewId: 10 });
    });

    it("báo lỗi nếu reviewId không hợp lệ", () => {
      expect(() => {
        validateReviewIdParams({ reviewId: "abc" });
      }).toThrow("reviewId không hợp lệ");
    });

    it("báo lỗi nếu reviewId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateReviewIdParams({ reviewId: "0" });
      }).toThrow("reviewId không hợp lệ");
    });
  });

  describe("validateCreateReviewPayload", () => {
    it("trả về payload tạo review hợp lệ", () => {
      const result = validateCreateReviewPayload({
        booking_id: "5",
        rating: "4",
        comment: " Sân tốt, sạch sẽ ",
      });

      expect(result).toEqual({
        booking_id: 5,
        rating: 4,
        comment: "Sân tốt, sạch sẽ",
      });
    });

    it("cho phép comment là null nếu không truyền comment", () => {
      const result = validateCreateReviewPayload({
        booking_id: "5",
        rating: "5",
      });

      expect(result).toEqual({
        booking_id: 5,
        rating: 5,
        comment: null,
      });
    });

    it("báo lỗi nếu booking_id không hợp lệ", () => {
      expect(() => {
        validateCreateReviewPayload({
          booking_id: "abc",
          rating: 5,
          comment: "Tốt",
        });
      }).toThrow("booking_id không hợp lệ");
    });

    it("báo lỗi nếu booking_id nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateCreateReviewPayload({
          booking_id: 0,
          rating: 5,
          comment: "Tốt",
        });
      }).toThrow("booking_id không hợp lệ");
    });

    it("báo lỗi nếu rating nhỏ hơn 1", () => {
      expect(() => {
        validateCreateReviewPayload({
          booking_id: 1,
          rating: 0,
          comment: "Tệ",
        });
      }).toThrow("rating phải từ 1 đến 5");
    });

    it("báo lỗi nếu rating lớn hơn 5", () => {
      expect(() => {
        validateCreateReviewPayload({
          booking_id: 1,
          rating: 6,
          comment: "Tốt",
        });
      }).toThrow("rating phải từ 1 đến 5");
    });

    it("báo lỗi nếu rating không phải số", () => {
      expect(() => {
        validateCreateReviewPayload({
          booking_id: 1,
          rating: "abc",
          comment: "Tốt",
        });
      }).toThrow("rating phải từ 1 đến 5");
    });
  });

  describe("validateUpdateReviewPayload", () => {
    it("trả về payload cập nhật review hợp lệ", () => {
      const result = validateUpdateReviewPayload({
        rating: "5",
        comment: " Cập nhật đánh giá ",
      });

      expect(result).toEqual({
        rating: 5,
        comment: "Cập nhật đánh giá",
      });
    });

    it("cho phép chỉ cập nhật rating", () => {
      const result = validateUpdateReviewPayload({
        rating: "4",
      });

      expect(result).toEqual({
        rating: 4,
      });
    });

    it("cho phép chỉ cập nhật comment", () => {
      const result = validateUpdateReviewPayload({
        comment: " Sân ổn ",
      });

      expect(result).toEqual({
        comment: "Sân ổn",
      });
    });

    it("cho phép cập nhật comment thành null", () => {
      const result = validateUpdateReviewPayload({
        comment: "",
      });

      expect(result).toEqual({
        comment: null,
      });
    });

    it("báo lỗi nếu rating update không hợp lệ", () => {
      expect(() => {
        validateUpdateReviewPayload({
          rating: 10,
        });
      }).toThrow("rating phải từ 1 đến 5");
    });

    it("báo lỗi nếu payload update rỗng", () => {
      expect(() => {
        validateUpdateReviewPayload({});
      }).toThrow("Không có dữ liệu hợp lệ để cập nhật");
    });
  });

  describe("validateReplyReviewPayload", () => {
    it("trả về reply_text hợp lệ", () => {
      const result = validateReplyReviewPayload({
        reply_text: " Cảm ơn bạn đã đánh giá ",
      });

      expect(result).toEqual({
        reply_text: "Cảm ơn bạn đã đánh giá",
      });
    });

    it("báo lỗi nếu thiếu reply_text", () => {
      expect(() => {
        validateReplyReviewPayload({});
      }).toThrow("reply_text là bắt buộc");
    });

    it("báo lỗi nếu reply_text rỗng", () => {
      expect(() => {
        validateReplyReviewPayload({
          reply_text: "   ",
        });
      }).toThrow("reply_text là bắt buộc");
    });
  });

  describe("validateFieldReviewParams", () => {
    it("trả về fieldId hợp lệ", () => {
      const result = validateFieldReviewParams({ fieldId: "3" });

      expect(result).toEqual({ fieldId: 3 });
    });

    it("báo lỗi nếu fieldId không hợp lệ", () => {
      expect(() => {
        validateFieldReviewParams({ fieldId: "abc" });
      }).toThrow("fieldId không hợp lệ");
    });

    it("báo lỗi nếu fieldId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateFieldReviewParams({ fieldId: "0" });
      }).toThrow("fieldId không hợp lệ");
    });
  });
});