import { successResponse } from "../../core/utils/response.js";
import { vouchersService } from "./vouchers.service.js";

function mapVoucher(item) {
  if (!item) return null;

  return {
    id: item.id,
    owner_id: item.owner_id,
    created_by: item.created_by,
    code: item.code,
    type: item.type,
    discount_value: item.discount_value ? Number(item.discount_value) : null,
    max_discount_amount: item.max_discount_amount
      ? Number(item.max_discount_amount)
      : null,
    min_order_value: item.min_order_value
      ? Number(item.min_order_value)
      : null,
    usage_limit_total: item.usage_limit_total,
    usage_limit_per_user: item.usage_limit_per_user,
    start_date: item.start_date,
    end_date: item.end_date,
    status: item.status,
    created_at: item.created_at,
  };
}

export const vouchersController = {
  async validateVoucher(req, res, next) {
    try {
      const result = await vouchersService.validateVoucher(req.user.id, req.body);

      return successResponse(
        res,
        {
          voucher: mapVoucher(result.voucher),
          order_amount: result.order_amount,
          discount_amount: result.discount_amount,
          final_amount: result.final_amount,
        },
        "Validate voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getAvailableVouchers(req, res, next) {
    try {
      const ownerId = req.query.owner_id ? Number(req.query.owner_id) : null;
      const items = await vouchersService.getAvailableVouchers(ownerId);

      return successResponse(
        res,
        items.map(mapVoucher),
        "Lấy danh sách voucher khả dụng thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getOwnerVouchers(req, res, next) {
    try {
      const items = await vouchersService.getOwnerVouchers(req.user.id);

      return successResponse(
        res,
        items.map(mapVoucher),
        "Lấy danh sách voucher của owner thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getOwnerVoucherDetail(req, res, next) {
    try {
      const item = await vouchersService.getOwnerVoucherDetail(
        req.user.id,
        req.params.voucherId
      );

      return successResponse(res, mapVoucher(item), "Lấy chi tiết voucher thành công");
    } catch (error) {
      next(error);
    }
  },

  async createOwnerVoucher(req, res, next) {
    try {
      const item = await vouchersService.createOwnerVoucher(
        req.user.id,
        req.user.id,
        req.body
      );

      return successResponse(res, mapVoucher(item), "Tạo voucher thành công", 201);
    } catch (error) {
      next(error);
    }
  },

  async updateOwnerVoucher(req, res, next) {
    try {
      const item = await vouchersService.updateOwnerVoucher(
        req.user.id,
        req.params.voucherId,
        req.body
      );

      return successResponse(res, mapVoucher(item), "Cập nhật voucher thành công");
    } catch (error) {
      next(error);
    }
  },

  async updateOwnerVoucherStatus(req, res, next) {
    try {
      const item = await vouchersService.updateOwnerVoucherStatus(
        req.user.id,
        req.params.voucherId,
        req.body
      );

      return successResponse(
        res,
        mapVoucher(item),
        "Cập nhật trạng thái voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};