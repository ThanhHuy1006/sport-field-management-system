// src/modules/admin/__tests__/admin.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateAdminUserIdParams,
  validateAdminFieldIdParams,
  validateAdminBookingIdParams,
  validateUserStatusPayload,
  validateRejectOwnerRegistrationPayload,
  validateRejectFieldPayload,
} from "../admin.validator.js";

describe("admin.validator", () => {
  describe("validateAdminUserIdParams", () => {
    it("trả về userId hợp lệ", () => {
      const result = validateAdminUserIdParams({ userId: "10" });

      expect(result).toEqual({ userId: 10 });
    });

    it("báo lỗi nếu userId không phải số", () => {
      expect(() => {
        validateAdminUserIdParams({ userId: "abc" });
      }).toThrow("userId không hợp lệ");
    });

    it("báo lỗi nếu userId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateAdminUserIdParams({ userId: "0" });
      }).toThrow("userId không hợp lệ");
    });
  });

  describe("validateAdminFieldIdParams", () => {
    it("trả về fieldId hợp lệ", () => {
      const result = validateAdminFieldIdParams({ fieldId: "5" });

      expect(result).toEqual({ fieldId: 5 });
    });

    it("báo lỗi nếu fieldId không phải số", () => {
      expect(() => {
        validateAdminFieldIdParams({ fieldId: "abc" });
      }).toThrow("fieldId không hợp lệ");
    });

    it("báo lỗi nếu fieldId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateAdminFieldIdParams({ fieldId: "-1" });
      }).toThrow("fieldId không hợp lệ");
    });
  });

  describe("validateAdminBookingIdParams", () => {
    it("trả về bookingId hợp lệ", () => {
      const result = validateAdminBookingIdParams({ bookingId: "7" });

      expect(result).toEqual({ bookingId: 7 });
    });

    it("báo lỗi nếu bookingId không phải số", () => {
      expect(() => {
        validateAdminBookingIdParams({ bookingId: "abc" });
      }).toThrow("bookingId không hợp lệ");
    });

    it("báo lỗi nếu bookingId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateAdminBookingIdParams({ bookingId: "0" });
      }).toThrow("bookingId không hợp lệ");
    });
  });

  describe("validateUserStatusPayload", () => {
    it("trả về status active hợp lệ và lowercase", () => {
      const result = validateUserStatusPayload({ status: " ACTIVE " });

      expect(result).toEqual({ status: "active" });
    });

    it("trả về status locked hợp lệ", () => {
      const result = validateUserStatusPayload({ status: "locked" });

      expect(result).toEqual({ status: "locked" });
    });

    it("trả về status deleted hợp lệ", () => {
      const result = validateUserStatusPayload({ status: "deleted" });

      expect(result).toEqual({ status: "deleted" });
    });

    it("báo lỗi nếu status không hợp lệ", () => {
      expect(() => {
        validateUserStatusPayload({ status: "inactive" });
      }).toThrow("status user không hợp lệ");
    });

    it("báo lỗi nếu thiếu status", () => {
      expect(() => {
        validateUserStatusPayload({});
      }).toThrow("status user không hợp lệ");
    });
  });

  describe("validateRejectOwnerRegistrationPayload", () => {
    it("trả về reject_reason hợp lệ và trim", () => {
      const result = validateRejectOwnerRegistrationPayload({
        reject_reason: " Thiếu giấy phép kinh doanh ",
      });

      expect(result).toEqual({
        reject_reason: "Thiếu giấy phép kinh doanh",
      });
    });

    it("báo lỗi nếu thiếu reject_reason", () => {
      expect(() => {
        validateRejectOwnerRegistrationPayload({});
      }).toThrow("reject_reason là bắt buộc");
    });

    it("báo lỗi nếu reject_reason rỗng", () => {
      expect(() => {
        validateRejectOwnerRegistrationPayload({
          reject_reason: "   ",
        });
      }).toThrow("reject_reason là bắt buộc");
    });
  });

  describe("validateRejectFieldPayload", () => {
    it("trả về reject_reason hợp lệ và trim", () => {
      const result = validateRejectFieldPayload({
        reject_reason: " Thông tin sân chưa đầy đủ ",
      });

      expect(result).toEqual({
        reject_reason: "Thông tin sân chưa đầy đủ",
      });
    });

    it("báo lỗi nếu thiếu reject_reason", () => {
      expect(() => {
        validateRejectFieldPayload({});
      }).toThrow("reject_reason là bắt buộc");
    });

    it("báo lỗi nếu reject_reason rỗng", () => {
      expect(() => {
        validateRejectFieldPayload({
          reject_reason: "   ",
        });
      }).toThrow("reject_reason là bắt buộc");
    });

    it("báo lỗi nếu reject_reason vượt quá 255 ký tự", () => {
      expect(() => {
        validateRejectFieldPayload({
          reject_reason: "a".repeat(256),
        });
      }).toThrow("reject_reason không được vượt quá 255 ký tự");
    });
  });
});