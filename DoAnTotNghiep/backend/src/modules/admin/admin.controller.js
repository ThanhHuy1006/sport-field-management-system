import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { adminService } from "./admin.service.js";

export const adminController = {
  getUsers: asyncHandler(async (req, res) => {
    const items = await adminService.getUsers();
    return successResponse(res, items, "Lấy danh sách users thành công");
  }),

  getUserDetail: asyncHandler(async (req, res) => {
    const item = await adminService.getUserDetail(req.params.userId);
    return successResponse(res, item, "Lấy chi tiết user thành công");
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const item = await adminService.updateUserStatus(req.params.userId, req.body);
    return successResponse(res, item, "Cập nhật trạng thái user thành công");
  }),

  getOwnerRegistrations: asyncHandler(async (req, res) => {
    const items = await adminService.getOwnerRegistrations();
    return successResponse(res, items, "Lấy danh sách hồ sơ owner thành công");
  }),

  getOwnerRegistrationDetail: asyncHandler(async (req, res) => {
    const item = await adminService.getOwnerRegistrationDetail(req.params.userId);
    return successResponse(res, item, "Lấy chi tiết hồ sơ owner thành công");
  }),

  approveOwnerRegistration: asyncHandler(async (req, res) => {
    const item = await adminService.approveOwnerRegistration(
      req.user.id,
      req.params.userId
    );
    return successResponse(res, item, "Duyệt hồ sơ owner thành công");
  }),

  rejectOwnerRegistration: asyncHandler(async (req, res) => {
    const item = await adminService.rejectOwnerRegistration(
      req.user.id,
      req.params.userId,
      req.body
    );
    return successResponse(res, item, "Từ chối hồ sơ owner thành công");
  }),

  getAdminFields: asyncHandler(async (req, res) => {
    const items = await adminService.getAdminFields();
    return successResponse(res, items, "Lấy danh sách sân thành công");
  }),

  approveField: asyncHandler(async (req, res) => {
    const item = await adminService.approveField(req.params.fieldId);
    return successResponse(res, item, "Duyệt sân thành công");
  }),

  rejectField: asyncHandler(async (req, res) => {
    const item = await adminService.rejectField(req.params.fieldId);
    return successResponse(res, item, "Từ chối sân thành công");
  }),

  getAdminBookings: asyncHandler(async (req, res) => {
    const items = await adminService.getAdminBookings();
    return successResponse(res, items, "Lấy danh sách booking thành công");
  }),

  getAdminBookingDetail: asyncHandler(async (req, res) => {
    const item = await adminService.getAdminBookingDetail(req.params.bookingId);
    return successResponse(res, item, "Lấy chi tiết booking thành công");
  }),
};