import { asyncHandler } from "../../core/utils/asyncHandler.js";
import {
  successResponse,
  createdResponse,
} from "../../core/utils/response.js";
import {
  toOwnerOperatingHourResponse,
  toOwnerBlackoutDateResponse,
} from "./owner.schedules.mapper.js";
import { ownerSchedulesService } from "./owner.schedules.service.js";

export const ownerSchedulesController = {
  getOwnerOperatingHours: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;

    const items = await ownerSchedulesService.getOwnerOperatingHours(
      req.user.id,
      fieldId
    );

    return successResponse(
      res,
      items.map(toOwnerOperatingHourResponse),
      "Lấy giờ hoạt động thành công"
    );
  }),

  upsertOwnerOperatingHours: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerSchedulesService.upsertOwnerOperatingHours(
      req.user.id,
      fieldId,
      payload
    );

    return successResponse(
      res,
      toOwnerOperatingHourResponse(item),
      "Cập nhật giờ hoạt động thành công"
    );
  }),

  createBlackoutDate: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerSchedulesService.createBlackoutDate(
      req.user.id,
      fieldId,
      payload
    );

    return createdResponse(
      res,
      toOwnerBlackoutDateResponse(item),
      "Tạo ngày khóa thành công"
    );
  }),

  deleteBlackoutDate: asyncHandler(async (req, res) => {
    const { blackoutDateId } = req.validated?.params ?? req.params;

    await ownerSchedulesService.deleteBlackoutDate(
      req.user.id,
      blackoutDateId
    );

    return successResponse(res, null, "Xóa ngày khóa thành công");
  }),
};