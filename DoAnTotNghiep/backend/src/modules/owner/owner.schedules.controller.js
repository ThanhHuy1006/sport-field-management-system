import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { ownerSchedulesService } from "./owner.schedules.service.js";

export const ownerSchedulesController = {
  getOperatingHours: asyncHandler(async (req, res) => {
    const items = await ownerSchedulesService.getOperatingHours(req.user.id, req.params);
    return successResponse(res, items, "Lấy operating hours thành công");
  }),

  replaceOperatingHours: asyncHandler(async (req, res) => {
    const items = await ownerSchedulesService.replaceOperatingHours(
      req.user.id,
      req.params,
      req.body
    );
    return successResponse(res, items, "Cập nhật operating hours thành công");
  }),

  getBlackoutDates: asyncHandler(async (req, res) => {
    const items = await ownerSchedulesService.getBlackoutDates(req.user.id, req.params);
    return successResponse(res, items, "Lấy blackout dates thành công");
  }),

  createBlackoutDate: asyncHandler(async (req, res) => {
    const item = await ownerSchedulesService.createBlackoutDate(
      req.user.id,
      req.params,
      req.body
    );
    return successResponse(res, item, "Tạo blackout date thành công", 201);
  }),

  deleteBlackoutDate: asyncHandler(async (req, res) => {
    const item = await ownerSchedulesService.deleteBlackoutDate(req.user.id, req.params);
    return successResponse(res, item, "Xóa blackout date thành công");
  }),
};