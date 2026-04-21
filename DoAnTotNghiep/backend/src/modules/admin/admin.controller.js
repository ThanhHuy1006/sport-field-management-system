import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { adminService } from "./admin.service.js";
import {
  toAdminUserResponse,
  toAdminOwnerRegistrationResponse,
  toAdminFieldResponse,
  toAdminBookingResponse,
  toAdminDashboardSummaryResponse,
} from "./admin.mapper.js";

export const adminController = {
  getAdminDashboardSummary: asyncHandler(async (req, res) => {
    const data = await adminService.getAdminDashboardSummary();

    return successResponse(
      res,
      toAdminDashboardSummaryResponse(data),
      "Lấy dashboard admin thành công"
    );
  }),

  getUsers: asyncHandler(async (req, res) => {
    const items = await adminService.getUsers();

    return successResponse(
      res,
      items.map(toAdminUserResponse),
      "Lấy danh sách users thành công"
    );
  }),

  getUserDetail: asyncHandler(async (req, res) => {
    const { userId } = req.validated?.params ?? req.params;
    const item = await adminService.getUserDetail(userId);

    return successResponse(
      res,
      toAdminUserResponse(item),
      "Lấy chi tiết user thành công"
    );
  }),

  updateUserStatus: asyncHandler(async (req, res) => {
    const { userId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await adminService.updateUserStatus(userId, payload);

    return successResponse(
      res,
      toAdminUserResponse(item),
      "Cập nhật trạng thái user thành công"
    );
  }),

  getOwnerRegistrations: asyncHandler(async (req, res) => {
    const items = await adminService.getOwnerRegistrations();

    return successResponse(
      res,
      items.map(toAdminOwnerRegistrationResponse),
      "Lấy danh sách hồ sơ owner thành công"
    );
  }),

  getOwnerRegistrationDetail: asyncHandler(async (req, res) => {
    const { userId } = req.validated?.params ?? req.params;
    const item = await adminService.getOwnerRegistrationDetail(userId);

    return successResponse(
      res,
      toAdminOwnerRegistrationResponse(item),
      "Lấy chi tiết hồ sơ owner thành công"
    );
  }),

  approveOwnerRegistration: asyncHandler(async (req, res) => {
    const { userId } = req.validated?.params ?? req.params;

    const item = await adminService.approveOwnerRegistration(
      req.user.id,
      userId
    );

    return successResponse(
      res,
      toAdminOwnerRegistrationResponse(item),
      "Duyệt hồ sơ owner thành công"
    );
  }),

  rejectOwnerRegistration: asyncHandler(async (req, res) => {
    const { userId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await adminService.rejectOwnerRegistration(
      req.user.id,
      userId,
      payload
    );

    return successResponse(
      res,
      toAdminOwnerRegistrationResponse(item),
      "Từ chối hồ sơ owner thành công"
    );
  }),

  getAdminFields: asyncHandler(async (req, res) => {
    const items = await adminService.getAdminFields();

    return successResponse(
      res,
      items.map(toAdminFieldResponse),
      "Lấy danh sách sân thành công"
    );
  }),

  approveField: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const item = await adminService.approveField(fieldId);

    return successResponse(
      res,
      toAdminFieldResponse(item),
      "Duyệt sân thành công"
    );
  }),

  rejectField: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const item = await adminService.rejectField(fieldId);

    return successResponse(
      res,
      toAdminFieldResponse(item),
      "Từ chối sân thành công"
    );
  }),

  getAdminBookings: asyncHandler(async (req, res) => {
    const items = await adminService.getAdminBookings();

    return successResponse(
      res,
      items.map(toAdminBookingResponse),
      "Lấy danh sách booking thành công"
    );
  }),

  getAdminBookingDetail: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const item = await adminService.getAdminBookingDetail(bookingId);

    return successResponse(
      res,
      toAdminBookingResponse(item),
      "Lấy chi tiết booking thành công"
    );
  }),
};