import {
  successResponse,
  createdResponse,
} from "../../core/utils/response.js";
import { vouchersService } from "./vouchers.service.js";
import {
  toVoucherResponse,
  toVoucherValidationResponse,
} from "./vouchers.mapper.js";

export const vouchersController = {
  async validateVoucher(req, res, next) {
    try {
      const payload = req.validated?.body ?? req.body;
      const result = await vouchersService.validateVoucher(req.user.id, payload);

      return successResponse(
        res,
        toVoucherValidationResponse(result),
        "Validate voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getAvailableVouchers(req, res, next) {
    try {
      const query = req.validated?.query ?? req.query;
      const items = await vouchersService.getAvailableVouchers(query.owner_id);

      return successResponse(
        res,
        items.map(toVoucherResponse),
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
        items.map(toVoucherResponse),
        "Lấy danh sách voucher của owner thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getOwnerVoucherDetail(req, res, next) {
    try {
      const { voucherId } = req.validated?.params ?? req.params;

      const item = await vouchersService.getOwnerVoucherDetail(
        req.user.id,
        voucherId
      );

      return successResponse(
        res,
        toVoucherResponse(item),
        "Lấy chi tiết voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async createOwnerVoucher(req, res, next) {
    try {
      const payload = req.validated?.body ?? req.body;

      const item = await vouchersService.createOwnerVoucher(
        req.user.id,
        req.user.id,
        payload
      );

      return createdResponse(
        res,
        toVoucherResponse(item),
        "Tạo voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async updateOwnerVoucher(req, res, next) {
    try {
      const { voucherId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const item = await vouchersService.updateOwnerVoucher(
        req.user.id,
        voucherId,
        payload
      );

      return successResponse(
        res,
        toVoucherResponse(item),
        "Cập nhật voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async updateOwnerVoucherStatus(req, res, next) {
    try {
      const { voucherId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const item = await vouchersService.updateOwnerVoucherStatus(
        req.user.id,
        voucherId,
        payload
      );

      return successResponse(
        res,
        toVoucherResponse(item),
        "Cập nhật trạng thái voucher thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};