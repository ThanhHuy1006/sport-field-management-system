import { vouchersRepository } from "./vouchers.repository.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";

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
    const voucher = await vouchersRepository.findByCode(payload.code);

    if (!voucher) {
      throw new NotFoundError("Không tìm thấy voucher");
    }

    const today = new Date();

    if (voucher.status !== "active") {
      throw new ForbiddenError("Voucher hiện không khả dụng");
    }

    if (voucher.start_date > today || voucher.end_date < today) {
      throw new ForbiddenError("Voucher không còn trong thời gian hiệu lực");
    }

    if (
      voucher.min_order_value !== null &&
      Number(payload.order_amount) < Number(voucher.min_order_value)
    ) {
      throw new ValidationError("Chưa đạt giá trị đơn tối thiểu để áp voucher");
    }

    if (payload.owner_id && voucher.owner_id && voucher.owner_id !== payload.owner_id) {
      throw new ForbiddenError("Voucher không áp dụng cho owner này");
    }

    if (
      voucher.usage_limit_total !== null &&
      voucher.usage_limit_total !== undefined &&
      Number(voucher.usage_limit_total) > 0
    ) {
      const totalUsed = await vouchersRepository.countVoucherUsageTotal(voucher.id);

      if (totalUsed >= Number(voucher.usage_limit_total)) {
        throw new ForbiddenError("Voucher đã hết lượt sử dụng");
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
        throw new ForbiddenError("Bạn đã dùng hết lượt áp dụng voucher này");
      }
    }

    const discount_amount = calcDiscount(voucher, Number(payload.order_amount));
    const final_amount = Math.max(Number(payload.order_amount) - discount_amount, 0);

    return {
      voucher,
      order_amount: Number(payload.order_amount),
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
    const voucher = await vouchersRepository.findOwnerVoucherById(ownerId, voucherId);

    if (!voucher) {
      throw new NotFoundError("Không tìm thấy voucher");
    }

    return voucher;
  },

  async createOwnerVoucher(ownerId, createdBy, payload) {
    const existed = await vouchersRepository.findByCode(payload.code);

    if (existed) {
      throw new ConflictError("Code voucher đã tồn tại");
    }

    return vouchersRepository.createOwnerVoucher(ownerId, createdBy, payload);
  },

  async updateOwnerVoucher(ownerId, voucherId, payload) {
    const voucher = await vouchersRepository.findOwnerVoucherById(ownerId, voucherId);

    if (!voucher) {
      throw new NotFoundError("Không tìm thấy voucher");
    }

    return vouchersRepository.updateOwnerVoucher(voucherId, payload);
  },

  async updateOwnerVoucherStatus(ownerId, voucherId, payload) {
    const voucher = await vouchersRepository.findOwnerVoucherById(ownerId, voucherId);

    if (!voucher) {
      throw new NotFoundError("Không tìm thấy voucher");
    }

    if (voucher.status === payload.status) {
      throw new ConflictError("Voucher đã ở trạng thái này");
    }

    return vouchersRepository.updateOwnerVoucherStatus(voucherId, payload.status);
  },
};