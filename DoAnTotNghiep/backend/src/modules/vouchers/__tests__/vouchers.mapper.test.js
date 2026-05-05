// src/modules/vouchers/__tests__/vouchers.mapper.test.js

import { describe, it, expect } from "vitest";
import {
  toVoucherResponse,
  toVoucherValidationResponse,
} from "../vouchers.mapper.js";

describe("vouchers.mapper", () => {
  const mockVoucher = {
    id: 1,
    owner_id: 10,
    created_by: 5,
    code: "SUMMER10",
    type: "FIXED",
    discount_value: "50000",
    max_discount_amount: "100000",
    min_order_value: "200000",
    usage_limit_total: 100,
    usage_limit_per_user: 1,
    start_date: new Date("2099-01-01"),
    end_date: new Date("2099-12-31"),
    status: "active",
    created_at: new Date("2098-12-01"),
  };

  describe("toVoucherResponse", () => {
    it("map đúng voucher response và chuyển các trường tiền sang number", () => {
      const result = toVoucherResponse(mockVoucher);

      expect(result).toEqual({
        id: 1,
        owner_id: 10,
        created_by: 5,
        code: "SUMMER10",
        type: "FIXED",
        discount_value: 50000,
        max_discount_amount: 100000,
        min_order_value: 200000,
        usage_limit_total: 100,
        usage_limit_per_user: 1,
        start_date: new Date("2099-01-01"),
        end_date: new Date("2099-12-31"),
        status: "active",
        created_at: new Date("2098-12-01"),
      });
    });

    it("trả null nếu item là null", () => {
      expect(toVoucherResponse(null)).toBeNull();
    });

    it("map các trường tiền thành null nếu không có giá trị", () => {
      const result = toVoucherResponse({
        ...mockVoucher,
        discount_value: null,
        max_discount_amount: null,
        min_order_value: null,
      });

      expect(result.discount_value).toBeNull();
      expect(result.max_discount_amount).toBeNull();
      expect(result.min_order_value).toBeNull();
    });
  });

  describe("toVoucherValidationResponse", () => {
    it("map đúng kết quả validate voucher", () => {
      const result = toVoucherValidationResponse({
        voucher: mockVoucher,
        order_amount: 200000,
        discount_amount: 50000,
        final_amount: 150000,
      });

      expect(result.order_amount).toBe(200000);
      expect(result.discount_amount).toBe(50000);
      expect(result.final_amount).toBe(150000);

      expect(result.voucher).toEqual(toVoucherResponse(mockVoucher));
    });

    it("trả voucher null nếu voucher không tồn tại", () => {
      const result = toVoucherValidationResponse({
        voucher: null,
        order_amount: 200000,
        discount_amount: 0,
        final_amount: 200000,
      });

      expect(result.voucher).toBeNull();
      expect(result.final_amount).toBe(200000);
    });
  });
});