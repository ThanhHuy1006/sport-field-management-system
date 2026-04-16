import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse, createdResponse } from "../../core/utils/response.js";
import {
  toOwnerRegistrationResponse,
  toOwnerProfileResponse,
  toOwnerDashboardSummary,
} from "./owner.mapper.js";
import { ownerService } from "./owner.service.js";

export const ownerController = {
  createOwnerRegistration: asyncHandler(async (req, res) => {
    const item = await ownerService.createOwnerRegistration(req.user.id, req.body);
    return createdResponse(
      res,
      toOwnerRegistrationResponse(item),
      "Gửi đăng ký owner thành công"
    );
  }),

  getMyOwnerRegistration: asyncHandler(async (req, res) => {
    const item = await ownerService.getMyOwnerRegistration(req.user.id);
    return successResponse(
      res,
      toOwnerRegistrationResponse(item),
      "Lấy hồ sơ owner thành công"
    );
  }),

  updateMyOwnerRegistration: asyncHandler(async (req, res) => {
    const item = await ownerService.updateMyOwnerRegistration(req.user.id, req.body);
    return successResponse(
      res,
      toOwnerRegistrationResponse(item),
      "Cập nhật hồ sơ owner thành công"
    );
  }),

  getMyOwnerProfile: asyncHandler(async (req, res) => {
    const result = await ownerService.getMyOwnerProfile(req.user.id);
    return successResponse(
      res,
      toOwnerProfileResponse(result),
      "Lấy owner profile thành công"
    );
  }),

  updateMyOwnerProfile: asyncHandler(async (req, res) => {
    const result = await ownerService.updateMyOwnerProfile(req.user.id, req.body);
    return successResponse(
      res,
      toOwnerProfileResponse(result),
      "Cập nhật owner profile thành công"
    );
  }),

  getOwnerDashboardSummary: asyncHandler(async (req, res) => {
    const data = await ownerService.getOwnerDashboardSummary(req.user.id);
    return successResponse(
      res,
      toOwnerDashboardSummary(data),
      "Lấy dashboard summary thành công"
    );
  }),

  getRecentOwnerBookings: asyncHandler(async (req, res) => {
    const items = await ownerService.getRecentOwnerBookings(req.user.id);
    return successResponse(res, items, "Lấy recent bookings thành công");
  }),

  getRecentOwnerNotifications: asyncHandler(async (req, res) => {
    const items = await ownerService.getRecentOwnerNotifications(req.user.id);
    return successResponse(res, items, "Lấy recent notifications thành công");
  }),
};