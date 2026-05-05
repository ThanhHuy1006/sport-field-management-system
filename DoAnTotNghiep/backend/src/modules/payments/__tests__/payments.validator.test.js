// src/modules/payments/__tests__/payments.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateBookingIdParams,
  validatePaymentIdParams,
  validateCreatePaymentPayload,
} from "../payments.validator.js";

describe("payments.validator", () => {
  describe("validateBookingIdParams", () => {
    it("trả về bookingId hợp lệ", () => {
      const result = validateBookingIdParams({
        bookingId: "10",
      });

      expect(result).toEqual({
        bookingId: 10,
      });
    });

    it("báo lỗi nếu bookingId không phải số", () => {
      expect(() => {
        validateBookingIdParams({
          bookingId: "abc",
        });
      }).toThrow("bookingId không hợp lệ");
    });

    it("báo lỗi nếu bookingId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateBookingIdParams({
          bookingId: "0",
        });
      }).toThrow("bookingId không hợp lệ");
    });
  });

  describe("validatePaymentIdParams", () => {
    it("trả về paymentId hợp lệ", () => {
      const result = validatePaymentIdParams({
        paymentId: "5",
      });

      expect(result).toEqual({
        paymentId: 5,
      });
    });

    it("báo lỗi nếu paymentId không phải số", () => {
      expect(() => {
        validatePaymentIdParams({
          paymentId: "xyz",
        });
      }).toThrow("paymentId không hợp lệ");
    });

    it("báo lỗi nếu paymentId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validatePaymentIdParams({
          paymentId: "-1",
        });
      }).toThrow("paymentId không hợp lệ");
    });
  });

  describe("validateCreatePaymentPayload", () => {
    it("trả về payload tạo payment hợp lệ", () => {
      const result = validateCreatePaymentPayload({
        booking_id: "12",
        provider: "BANK_TRANSFER",
      });

      expect(result).toEqual({
        booking_id: 12,
        provider: "BANK_TRANSFER",
      });
    });

    it("báo lỗi nếu booking_id không hợp lệ", () => {
      expect(() => {
        validateCreatePaymentPayload({
          booking_id: "abc",
          provider: "BANK_TRANSFER",
        });
      }).toThrow("booking_id không hợp lệ");
    });

    it("báo lỗi nếu provider không hợp lệ", () => {
      expect(() => {
        validateCreatePaymentPayload({
          booking_id: 12,
          provider: "MOMO",
        });
      }).toThrow("provider không hợp lệ");
    });

    it("báo lỗi nếu thiếu provider", () => {
      expect(() => {
        validateCreatePaymentPayload({
          booking_id: 12,
        });
      }).toThrow("provider không hợp lệ");
    });
  });
});