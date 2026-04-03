import { successResponse } from "../../core/utils/response.js";
import { schedulesService } from "./schedules.service.js";
import {
  toAvailabilityResponse,
  toOperatingHourResponse,
} from "./schedules.mapper.js";

export const schedulesController = {
  async getPublicAvailability(req, res, next) {
    try {
      const result = await schedulesService.getPublicAvailability(
        req.params.fieldId,
        req.query
      );

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
      const items = await schedulesService.getOwnerOperatingHours(
        req.params.fieldId,
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
      const item = await schedulesService.upsertOwnerOperatingHours(
        req.params.fieldId,
        req.body,
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
      const item = await schedulesService.createBlackoutDate(
        req.params.fieldId,
        req.body,
        req.user
      );

      return successResponse(res, item, "Tạo ngày khóa thành công", 201);
    } catch (error) {
      next(error);
    }
  },

  async deleteBlackoutDate(req, res, next) {
    try {
      await schedulesService.deleteBlackoutDate(
        req.params.blackoutDateId,
        req.user
      );

      return successResponse(res, null, "Xóa ngày khóa thành công");
    } catch (error) {
      next(error);
    }
  },
};