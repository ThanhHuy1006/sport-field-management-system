// src/modules/vouchers/__tests__/vouchers.service.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../vouchers.repository.js", () => ({
  vouchersRepository: {
    findByCode: vi.fn(),
    countVoucherUsageTotal: vi.fn(),
    countVoucherUsageByUser: vi.fn(),
    findAvailablePublicOrOwnerVouchers: vi.fn(),
    findOwnerVouchers: vi.fn(),
    findOwnerVoucherById: vi.fn(),
    createOwnerVoucher: vi.fn(),
    updateOwnerVoucher: vi.fn(),
    updateOwnerVoucherStatus: vi.fn(),
  },
}));

import { vouchersService } from "../vouchers.service.js";
import { vouchersRepository } from "../vouchers.repository.js";

const activeFixedVoucher = {
  id: 1,
  owner_id: 10,
  code: "SUMMER10",
  type: "FIXED",
  discount_value: 50000,
  max_discount_amount: null,
  min_order_value: 100000,
  usage_limit_total: 100,
  usage_limit_per_user: 1,
  start_date: new Date("2000-01-01"),
  end_date: new Date("2099-12-31"),
  status: "active",
};

const activePercentVoucher = {
  ...activeFixedVoucher,
  id: 2,
  code: "SALE10",
  type: "PERCENT",
  discount_value: 10,
  max_discount_amount: 30000,
};

describe("vouchers.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("validateVoucher", () => {
    it("báo lỗi nếu voucher không tồn tại", async () => {
      vouchersRepository.findByCode.mockResolvedValue(null);

      await expect(
        vouchersService.validateVoucher(5, {
          code: "NOTFOUND",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Không tìm thấy voucher");
    });

    it("báo lỗi nếu voucher inactive", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        status: "inactive",
      });

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Voucher hiện không khả dụng");
    });

    it("báo lỗi nếu voucher chưa tới ngày bắt đầu", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        start_date: new Date("2999-01-01"),
        end_date: new Date("2999-12-31"),
      });

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Voucher không còn trong thời gian hiệu lực");
    });

    it("báo lỗi nếu voucher đã hết hạn", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        start_date: new Date("2000-01-01"),
        end_date: new Date("2000-12-31"),
      });

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Voucher không còn trong thời gian hiệu lực");
    });

    it("báo lỗi nếu đơn chưa đạt giá trị tối thiểu", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        min_order_value: 300000,
      });

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Chưa đạt giá trị đơn tối thiểu để áp voucher");
    });

    it("báo lỗi nếu voucher không áp dụng cho owner này", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        owner_id: 99,
      });

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Voucher không áp dụng cho owner này");
    });

    it("báo lỗi nếu voucher đã hết lượt sử dụng toàn hệ thống", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        usage_limit_total: 2,
        usage_limit_per_user: 0,
      });

      vouchersRepository.countVoucherUsageTotal.mockResolvedValue(2);

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Voucher đã hết lượt sử dụng");
    });

    it("báo lỗi nếu user đã dùng hết lượt áp dụng voucher", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        usage_limit_total: 0,
        usage_limit_per_user: 1,
      });

      vouchersRepository.countVoucherUsageByUser.mockResolvedValue(1);

      await expect(
        vouchersService.validateVoucher(5, {
          code: "SUMMER10",
          order_amount: 200000,
          owner_id: 10,
        }),
      ).rejects.toThrow("Bạn đã dùng hết lượt áp dụng voucher này");
    });

    it("tính đúng voucher FIXED và không giảm quá order_amount", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        discount_value: 300000,
        min_order_value: 0,
        usage_limit_total: 0,
        usage_limit_per_user: 0,
      });

      const result = await vouchersService.validateVoucher(5, {
        code: "SUMMER10",
        order_amount: 200000,
        owner_id: 10,
      });

      expect(result.order_amount).toBe(200000);
      expect(result.discount_amount).toBe(200000);
      expect(result.final_amount).toBe(0);
    });

    it("tính đúng voucher PERCENT có max_discount_amount", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activePercentVoucher,
        min_order_value: 0,
        usage_limit_total: 0,
        usage_limit_per_user: 0,
      });

      const result = await vouchersService.validateVoucher(5, {
        code: "SALE10",
        order_amount: 500000,
        owner_id: 10,
      });

      // 10% của 500000 = 50000, nhưng max_discount_amount = 30000
      expect(result.discount_amount).toBe(30000);
      expect(result.final_amount).toBe(470000);
    });

    it("tính đúng voucher PERCENT không có max_discount_amount", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activePercentVoucher,
        max_discount_amount: null,
        min_order_value: 0,
        usage_limit_total: 0,
        usage_limit_per_user: 0,
      });

      const result = await vouchersService.validateVoucher(5, {
        code: "SALE10",
        order_amount: 500000,
        owner_id: 10,
      });

      expect(result.discount_amount).toBe(50000);
      expect(result.final_amount).toBe(450000);
    });

    it("cho phép voucher public owner_id null áp dụng cho mọi owner", async () => {
      vouchersRepository.findByCode.mockResolvedValue({
        ...activeFixedVoucher,
        owner_id: null,
        min_order_value: 0,
        usage_limit_total: 0,
        usage_limit_per_user: 0,
      });

      const result = await vouchersService.validateVoucher(5, {
        code: "SUMMER10",
        order_amount: 200000,
        owner_id: 10,
      });

      expect(result.discount_amount).toBe(50000);
      expect(result.final_amount).toBe(150000);
    });
  });

  describe("list/query voucher", () => {
    it("getAvailableVouchers gọi repository đúng ownerId", async () => {
      vouchersRepository.findAvailablePublicOrOwnerVouchers.mockResolvedValue([
        activeFixedVoucher,
      ]);

      const result = await vouchersService.getAvailableVouchers(10);

      expect(vouchersRepository.findAvailablePublicOrOwnerVouchers).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
    });

    it("getOwnerVouchers gọi repository đúng ownerId", async () => {
      vouchersRepository.findOwnerVouchers.mockResolvedValue([activeFixedVoucher]);

      const result = await vouchersService.getOwnerVouchers(10);

      expect(vouchersRepository.findOwnerVouchers).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
    });

    it("getOwnerVoucherDetail báo lỗi nếu không tìm thấy voucher", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue(null);

      await expect(vouchersService.getOwnerVoucherDetail(10, 999)).rejects.toThrow(
        "Không tìm thấy voucher",
      );
    });

    it("getOwnerVoucherDetail trả voucher nếu tồn tại", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue(activeFixedVoucher);

      const result = await vouchersService.getOwnerVoucherDetail(10, 1);

      expect(vouchersRepository.findOwnerVoucherById).toHaveBeenCalledWith(10, 1);
      expect(result.id).toBe(1);
    });
  });

  describe("owner voucher mutation", () => {
    it("createOwnerVoucher báo lỗi nếu code đã tồn tại", async () => {
      vouchersRepository.findByCode.mockResolvedValue(activeFixedVoucher);

      await expect(
        vouchersService.createOwnerVoucher(10, 5, {
          code: "SUMMER10",
        }),
      ).rejects.toThrow("Code voucher đã tồn tại");

      expect(vouchersRepository.createOwnerVoucher).not.toHaveBeenCalled();
    });

    it("createOwnerVoucher tạo voucher nếu code chưa tồn tại", async () => {
      vouchersRepository.findByCode.mockResolvedValue(null);
      vouchersRepository.createOwnerVoucher.mockResolvedValue({
        ...activeFixedVoucher,
        id: 3,
      });

      const payload = {
        code: "NEW10",
        type: "FIXED",
        discount_value: 10000,
      };

      const result = await vouchersService.createOwnerVoucher(10, 5, payload);

      expect(vouchersRepository.createOwnerVoucher).toHaveBeenCalledWith(
        10,
        5,
        payload,
      );
      expect(result.id).toBe(3);
    });

    it("updateOwnerVoucher báo lỗi nếu voucher không thuộc owner", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue(null);

      await expect(
        vouchersService.updateOwnerVoucher(10, 999, {
          discount_value: 60000,
        }),
      ).rejects.toThrow("Không tìm thấy voucher");
    });

    it("updateOwnerVoucher cập nhật voucher nếu tồn tại", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue(activeFixedVoucher);
      vouchersRepository.updateOwnerVoucher.mockResolvedValue({
        ...activeFixedVoucher,
        discount_value: 60000,
      });

      const result = await vouchersService.updateOwnerVoucher(10, 1, {
        discount_value: 60000,
      });

      expect(vouchersRepository.updateOwnerVoucher).toHaveBeenCalledWith(1, {
        discount_value: 60000,
      });
      expect(result.discount_value).toBe(60000);
    });

    it("updateOwnerVoucherStatus báo lỗi nếu voucher không tồn tại", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue(null);

      await expect(
        vouchersService.updateOwnerVoucherStatus(10, 999, {
          status: "inactive",
        }),
      ).rejects.toThrow("Không tìm thấy voucher");
    });

    it("updateOwnerVoucherStatus báo lỗi nếu status không thay đổi", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue({
        ...activeFixedVoucher,
        status: "active",
      });

      await expect(
        vouchersService.updateOwnerVoucherStatus(10, 1, {
          status: "active",
        }),
      ).rejects.toThrow("Voucher đã ở trạng thái này");
    });

    it("updateOwnerVoucherStatus cập nhật status nếu hợp lệ", async () => {
      vouchersRepository.findOwnerVoucherById.mockResolvedValue({
        ...activeFixedVoucher,
        status: "active",
      });

      vouchersRepository.updateOwnerVoucherStatus.mockResolvedValue({
        ...activeFixedVoucher,
        status: "inactive",
      });

      const result = await vouchersService.updateOwnerVoucherStatus(10, 1, {
        status: "inactive",
      });

      expect(vouchersRepository.updateOwnerVoucherStatus).toHaveBeenCalledWith(
        1,
        "inactive",
      );
      expect(result.status).toBe("inactive");
    });
  });
});