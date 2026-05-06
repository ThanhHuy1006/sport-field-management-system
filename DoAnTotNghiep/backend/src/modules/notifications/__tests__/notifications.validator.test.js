// src/modules/notifications/__tests__/notifications.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateNotificationIdParams,
  validateBroadcastPayload,
} from "../notifications.validator.js";

describe("notifications.validator", () => {
  describe("validateNotificationIdParams", () => {
    it("trả về notificationId hợp lệ", () => {
      const result = validateNotificationIdParams({
        notificationId: "10",
      });

      expect(result).toEqual({
        notificationId: 10,
      });
    });

    it("báo lỗi nếu notificationId không phải số", () => {
      expect(() => {
        validateNotificationIdParams({
          notificationId: "abc",
        });
      }).toThrow("notificationId không hợp lệ");
    });

    it("báo lỗi nếu notificationId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateNotificationIdParams({
          notificationId: "0",
        });
      }).toThrow("notificationId không hợp lệ");
    });
  });

  describe("validateBroadcastPayload", () => {
    it("trả về payload broadcast hợp lệ và chuẩn hóa type", () => {
      const result = validateBroadcastPayload({
        title: " Thông báo hệ thống ",
        body: " Hệ thống bảo trì lúc 22h ",
        type: " system ",
      });

      expect(result).toEqual({
        title: "Thông báo hệ thống",
        body: "Hệ thống bảo trì lúc 22h",
        type: "SYSTEM",
      });
    });

    it("mặc định type là SYSTEM nếu không truyền", () => {
      const result = validateBroadcastPayload({
        title: "Thông báo",
        body: "Nội dung thông báo",
      });

      expect(result).toEqual({
        title: "Thông báo",
        body: "Nội dung thông báo",
        type: "SYSTEM",
      });
    });

    it("cho phép type BOOKING", () => {
      const result = validateBroadcastPayload({
        title: "Booking",
        body: "Có booking mới",
        type: "BOOKING",
      });

      expect(result.type).toBe("BOOKING");
    });

    it("cho phép type PAYMENT", () => {
      const result = validateBroadcastPayload({
        title: "Payment",
        body: "Thanh toán thành công",
        type: "PAYMENT",
      });

      expect(result.type).toBe("PAYMENT");
    });

    it("cho phép type PROMO", () => {
      const result = validateBroadcastPayload({
        title: "Khuyến mãi",
        body: "Có voucher mới",
        type: "PROMO",
      });

      expect(result.type).toBe("PROMO");
    });

    it("báo lỗi nếu thiếu title", () => {
      expect(() => {
        validateBroadcastPayload({
          body: "Nội dung thông báo",
          type: "SYSTEM",
        });
      }).toThrow("title là bắt buộc");
    });

    it("báo lỗi nếu title rỗng", () => {
      expect(() => {
        validateBroadcastPayload({
          title: "   ",
          body: "Nội dung thông báo",
          type: "SYSTEM",
        });
      }).toThrow("title là bắt buộc");
    });

    it("báo lỗi nếu thiếu body", () => {
      expect(() => {
        validateBroadcastPayload({
          title: "Thông báo",
          type: "SYSTEM",
        });
      }).toThrow("body là bắt buộc");
    });

    it("báo lỗi nếu body rỗng", () => {
      expect(() => {
        validateBroadcastPayload({
          title: "Thông báo",
          body: "   ",
          type: "SYSTEM",
        });
      }).toThrow("body là bắt buộc");
    });

    it("báo lỗi nếu type không hợp lệ", () => {
      expect(() => {
        validateBroadcastPayload({
          title: "Thông báo",
          body: "Nội dung",
          type: "INVALID",
        });
      }).toThrow("type notification không hợp lệ");
    });
  });
});