import { vouchersRepository } from "./vouchers.repository.js";
import {
  validateVoucherCodePayload,
  validateCreateVoucherPayload,
  validateUpdateVoucherPayload,
  validateVoucherStatusPayload,
} from "./vouchers.validator.js";

function calcDiscount(voucher, orderAmount) {
  if (voucher.type === "FIXED") {
    return Math.min(Number(voucher.discount_value), orderAmount);
  }

  if (voucher.type === "PERCENT") {
    let discount = (orderAmount * Number(voucher.discount_value)) / 100;

    if (
      voucher.max_discount_amount !== null &&
      voucher.max_discount_amount !== undefined
    ) {
      discount = Math.min(discount, Number(voucher.max_discount_amount));
    }

    return discount;
  }

  return 0;
}

export const vouchersService = {
  async validateVoucher(userId, payload) {
    const valid = validateVoucherCodePayload(payload);

    const voucher = await vouchersRepository.findByCode(valid.code);
    if (!voucher) {
      throw new Error("Không tìm thấy voucher");
    }

    const today = new Date();

    if (voucher.status !== "active") {
      throw new Error("Voucher hiện không khả dụng");
    }

    if (voucher.start_date > today || voucher.end_date < today) {
      throw new Error("Voucher không còn trong thời gian hiệu lực");
    }

    if (
      voucher.min_order_value !== null &&
      Number(valid.order_amount) < Number(voucher.min_order_value)
    ) {
      throw new Error("Chưa đạt giá trị đơn tối thiểu để áp voucher");
    }

    if (valid.owner_id && voucher.owner_id && voucher.owner_id !== valid.owner_id) {
      throw new Error("Voucher không áp dụng cho owner này");
    }

    if (
      voucher.usage_limit_total !== null &&
      voucher.usage_limit_total !== undefined &&
      Number(voucher.usage_limit_total) > 0
    ) {
      const totalUsed = await vouchersRepository.countVoucherUsageTotal(voucher.id);
      if (totalUsed >= Number(voucher.usage_limit_total)) {
        throw new Error("Voucher đã hết lượt sử dụng");
      }
    }

    if (
      voucher.usage_limit_per_user !== null &&
      voucher.usage_limit_per_user !== undefined &&
      Number(voucher.usage_limit_per_user) > 0
    ) {
      const usedByUser = await vouchersRepository.countVoucherUsageByUser(
        voucher.id,
        userId
      );
      if (usedByUser >= Number(voucher.usage_limit_per_user)) {
        throw new Error("Bạn đã dùng hết lượt áp dụng voucher này");
      }
    }

    const discount_amount = calcDiscount(voucher, Number(valid.order_amount));
    const final_amount = Math.max(Number(valid.order_amount) - discount_amount, 0);

    return {
      voucher,
      order_amount: Number(valid.order_amount),
      discount_amount,
      final_amount,
    };
  },

  async getAvailableVouchers(ownerId = null) {
    return vouchersRepository.findAvailablePublicOrOwnerVouchers(ownerId);
  },

  async getOwnerVouchers(ownerId) {
    return vouchersRepository.findOwnerVouchers(ownerId);
  },

  async getOwnerVoucherDetail(ownerId, voucherId) {
    const id = Number(voucherId);
    if (Number.isNaN(id)) throw new Error("voucherId không hợp lệ");

    const voucher = await vouchersRepository.findOwnerVoucherById(ownerId, id);
    if (!voucher) throw new Error("Không tìm thấy voucher");

    return voucher;
  },

  async createOwnerVoucher(ownerId, createdBy, payload) {
    const valid = validateCreateVoucherPayload(payload);

    const existed = await vouchersRepository.findByCode(valid.code);
    if (existed) {
      throw new Error("Code voucher đã tồn tại");
    }

    return vouchersRepository.createOwnerVoucher(ownerId, createdBy, valid);
  },

  async updateOwnerVoucher(ownerId, voucherId, payload) {
    const id = Number(voucherId);
    if (Number.isNaN(id)) throw new Error("voucherId không hợp lệ");

    const voucher = await vouchersRepository.findOwnerVoucherById(ownerId, id);
    if (!voucher) throw new Error("Không tìm thấy voucher");

    const valid = validateUpdateVoucherPayload(payload);

    return vouchersRepository.updateOwnerVoucher(id, valid);
  },

  async updateOwnerVoucherStatus(ownerId, voucherId, payload) {
    const id = Number(voucherId);
    if (Number.isNaN(id)) throw new Error("voucherId không hợp lệ");

    const voucher = await vouchersRepository.findOwnerVoucherById(ownerId, id);
    if (!voucher) throw new Error("Không tìm thấy voucher");

    const valid = validateVoucherStatusPayload(payload);

    return vouchersRepository.updateOwnerVoucherStatus(id, valid.status);
  },
};