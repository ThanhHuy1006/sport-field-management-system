// src/modules/vouchers/__tests__/vouchers.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateVoucherIdParams,
  validateAvailableVouchersQuery,
  validateVoucherCodePayload,
  validateCreateVoucherPayload,
  validateUpdateVoucherPayload,
  validateVoucherStatusPayload,
} from "../vouchers.validator.js";

describe("vouchers.validator", () => {
  describe("validateVoucherIdParams", () => {
    it("trả về voucherId hợp lệ", () => {
      const result = validateVoucherIdParams({ voucherId: "10" });

      expect(result).toEqual({ voucherId: 10 });
    });

    it("báo lỗi nếu voucherId không hợp lệ", () => {
      expect(() => {
        validateVoucherIdParams({ voucherId: "abc" });
      }).toThrow("voucherId không hợp lệ");
    });

    it("báo lỗi nếu voucherId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateVoucherIdParams({ voucherId: "0" });
      }).toThrow("voucherId không hợp lệ");
    });
  });

  describe("validateAvailableVouchersQuery", () => {
    it("trả owner_id null nếu không truyền owner_id", () => {
      const result = validateAvailableVouchersQuery({});

      expect(result).toEqual({ owner_id: null });
    });

    it("trả owner_id hợp lệ nếu truyền owner_id", () => {
      const result = validateAvailableVouchersQuery({ owner_id: "5" });

      expect(result).toEqual({ owner_id: 5 });
    });

    it("báo lỗi nếu owner_id không hợp lệ", () => {
      expect(() => {
        validateAvailableVouchersQuery({ owner_id: "abc" });
      }).toThrow("owner_id không hợp lệ");
    });
  });

  describe("validateVoucherCodePayload", () => {
    it("chuẩn hóa code thành uppercase và trim", () => {
      const result = validateVoucherCodePayload({
        code: " summer10 ",
        order_amount: "200000",
        owner_id: "7",
      });

      expect(result).toEqual({
        code: "SUMMER10",
        order_amount: 200000,
        owner_id: 7,
      });
    });

    it("trả owner_id null nếu không truyền owner_id", () => {
      const result = validateVoucherCodePayload({
        code: "SUMMER10",
        order_amount: "200000",
      });

      expect(result.owner_id).toBeNull();
    });

    it("báo lỗi nếu thiếu code", () => {
      expect(() => {
        validateVoucherCodePayload({
          order_amount: 200000,
        });
      }).toThrow("code là bắt buộc");
    });

    it("báo lỗi nếu order_amount không hợp lệ", () => {
      expect(() => {
        validateVoucherCodePayload({
          code: "SUMMER10",
          order_amount: -1,
        });
      }).toThrow("order_amount không hợp lệ");
    });

    it("báo lỗi nếu owner_id không hợp lệ", () => {
      expect(() => {
        validateVoucherCodePayload({
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: "abc",
        });
      }).toThrow("owner_id không hợp lệ");
    });
  });

  describe("validateCreateVoucherPayload", () => {
    it("trả về payload tạo voucher hợp lệ và chuẩn hóa code/type", () => {
      const result = validateCreateVoucherPayload({
        code: " summer10 ",
        type: "fixed",
        discount_value: "50000",
        max_discount_amount: "100000",
        min_order_value: "200000",
        usage_limit_total: "100",
        usage_limit_per_user: "1",
        start_date: "2099-01-01",
        end_date: "2099-12-31",
      });

      expect(result.code).toBe("SUMMER10");
      expect(result.type).toBe("FIXED");
      expect(result.discount_value).toBe(50000);
      expect(result.max_discount_amount).toBe(100000);
      expect(result.min_order_value).toBe(200000);
      expect(result.usage_limit_total).toBe(100);
      expect(result.usage_limit_per_user).toBe(1);
      expect(result.start_date).toBeInstanceOf(Date);
      expect(result.end_date).toBeInstanceOf(Date);
      expect(result.status).toBe("active");
    });

    it("báo lỗi nếu thiếu code", () => {
      expect(() => {
        validateCreateVoucherPayload({
          type: "FIXED",
          discount_value: 50000,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("code là bắt buộc");
    });

    it("báo lỗi nếu type không hợp lệ", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "INVALID",
          discount_value: 50000,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("type không hợp lệ");
    });

    it("báo lỗi nếu discount_value <= 0", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 0,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("discount_value phải > 0");
    });

    it("báo lỗi nếu max_discount_amount không hợp lệ", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "PERCENT",
          discount_value: 10,
          max_discount_amount: -1,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("max_discount_amount không hợp lệ");
    });

    it("báo lỗi nếu min_order_value không hợp lệ", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 50000,
          min_order_value: -1,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("min_order_value không hợp lệ");
    });

    it("báo lỗi nếu usage_limit_total không hợp lệ", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 50000,
          usage_limit_total: -1,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("usage_limit_total không hợp lệ");
    });

    it("báo lỗi nếu usage_limit_per_user không hợp lệ", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 50000,
          usage_limit_per_user: -1,
          start_date: "2099-01-01",
          end_date: "2099-12-31",
        });
      }).toThrow("usage_limit_per_user không hợp lệ");
    });

    it("báo lỗi nếu thiếu start_date hoặc end_date", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 50000,
        });
      }).toThrow("start_date và end_date là bắt buộc");
    });

    it("báo lỗi nếu start_date hoặc end_date không hợp lệ", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 50000,
          start_date: "abc",
          end_date: "2099-12-31",
        });
      }).toThrow("start_date hoặc end_date không hợp lệ");
    });

    it("báo lỗi nếu end_date nhỏ hơn start_date", () => {
      expect(() => {
        validateCreateVoucherPayload({
          code: "SUMMER10",
          type: "FIXED",
          discount_value: 50000,
          start_date: "2099-12-31",
          end_date: "2099-01-01",
        });
      }).toThrow("end_date phải lớn hơn hoặc bằng start_date");
    });
  });

  describe("validateUpdateVoucherPayload", () => {
    it("trả về data update hợp lệ", () => {
      const result = validateUpdateVoucherPayload({
        discount_value: "60000",
        max_discount_amount: "100000",
        min_order_value: "200000",
        usage_limit_total: "50",
        usage_limit_per_user: "2",
        start_date: "2099-01-01",
        end_date: "2099-12-31",
      });

      expect(result.discount_value).toBe(60000);
      expect(result.max_discount_amount).toBe(100000);
      expect(result.min_order_value).toBe(200000);
      expect(result.usage_limit_total).toBe(50);
      expect(result.usage_limit_per_user).toBe(2);
      expect(result.start_date).toBeInstanceOf(Date);
      expect(result.end_date).toBeInstanceOf(Date);
    });

    it("cho phép set max_discount_amount là null", () => {
      const result = validateUpdateVoucherPayload({
        max_discount_amount: null,
      });

      expect(result.max_discount_amount).toBeNull();
    });

    it("báo lỗi nếu payload update rỗng", () => {
      expect(() => {
        validateUpdateVoucherPayload({});
      }).toThrow("Không có dữ liệu hợp lệ để cập nhật");
    });

    it("báo lỗi nếu discount_value <= 0", () => {
      expect(() => {
        validateUpdateVoucherPayload({
          discount_value: 0,
        });
      }).toThrow("discount_value phải > 0");
    });

    it("báo lỗi nếu start_date update không hợp lệ", () => {
      expect(() => {
        validateUpdateVoucherPayload({
          start_date: "abc",
        });
      }).toThrow("start_date không hợp lệ");
    });

    it("báo lỗi nếu end_date update không hợp lệ", () => {
      expect(() => {
        validateUpdateVoucherPayload({
          end_date: "abc",
        });
      }).toThrow("end_date không hợp lệ");
    });

    it("báo lỗi nếu end_date nhỏ hơn start_date khi update", () => {
      expect(() => {
        validateUpdateVoucherPayload({
          start_date: "2099-12-31",
          end_date: "2099-01-01",
        });
      }).toThrow("end_date phải lớn hơn hoặc bằng start_date");
    });
  });

  describe("validateVoucherStatusPayload", () => {
    it("trả về status hợp lệ và lowercase", () => {
      const result = validateVoucherStatusPayload({
        status: " ACTIVE ",
      });

      expect(result).toEqual({ status: "active" });
    });

    it("báo lỗi nếu status không hợp lệ", () => {
      expect(() => {
        validateVoucherStatusPayload({
          status: "deleted",
        });
      }).toThrow("status không hợp lệ");
    });
  });
});