import {
  successResponse,
  createdResponse,
} from "../../core/utils/response.js";
import { schedulesService } from "./schedules.service.js";
import {
  toAvailabilityResponse,
  toOperatingHourResponse,
} from "./schedules.mapper.js";

export const schedulesController = {
  async getPublicAvailability(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const query = req.validated?.query ?? req.query;

      const result = await schedulesService.getPublicAvailability(fieldId, query);

      return successResponse(
        res,
        toAvailabilityResponse(result),
        "Lấy lịch trống thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getOwnerOperatingHours(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;

      const items = await schedulesService.getOwnerOperatingHours(
        fieldId,
        req.user
      );

      return successResponse(
        res,
        items.map(toOperatingHourResponse),
        "Lấy giờ hoạt động thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async upsertOwnerOperatingHours(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const item = await schedulesService.upsertOwnerOperatingHours(
        fieldId,
        payload,
        req.user
      );

      return successResponse(
        res,
        toOperatingHourResponse(item),
        "Cập nhật giờ hoạt động thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async createBlackoutDate(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const item = await schedulesService.createBlackoutDate(
        fieldId,
        payload,
        req.user
      );

      return createdResponse(res, item, "Tạo ngày khóa thành công");
    } catch (error) {
      next(error);
    }
  },

  async deleteBlackoutDate(req, res, next) {
    try {
      const { blackoutDateId } = req.validated?.params ?? req.params;

      await schedulesService.deleteBlackoutDate(blackoutDateId, req.user);

      return successResponse(res, null, "Xóa ngày khóa thành công");
    } catch (error) {
      next(error);
    }
  },
};