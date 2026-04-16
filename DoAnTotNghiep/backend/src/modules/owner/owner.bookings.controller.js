import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { ownerBookingsService } from "./owner.bookings.service.js";

export const ownerBookingsController = {
  getOwnerBookings: asyncHandler(async (req, res) => {
    const items = await ownerBookingsService.getOwnerBookings(req.user.id, req.query);
    return successResponse(res, items, "Lấy danh sách booking của owner thành công");
  }),

  getOwnerBookingDetail: asyncHandler(async (req, res) => {
    const item = await ownerBookingsService.getOwnerBookingDetail(req.user.id, req.params);
    return successResponse(res, item, "Lấy chi tiết booking của owner thành công");
  }),

  approveOwnerBooking: asyncHandler(async (req, res) => {
    const item = await ownerBookingsService.approveOwnerBooking(req.user.id, req.params);
    return successResponse(res, item, "Duyệt booking thành công");
  }),

  rejectOwnerBooking: asyncHandler(async (req, res) => {
    const item = await ownerBookingsService.rejectOwnerBooking(
      req.user.id,
      req.params,
      req.body
    );
    return successResponse(res, item, "Từ chối booking thành công");
  }),

  checkInOwnerBooking: asyncHandler(async (req, res) => {
    const item = await ownerBookingsService.checkInOwnerBooking(
      req.user.id,
      req.params,
      req.body
    );
    return successResponse(res, item, "Check-in booking thành công");
  }),

  scanOwnerBookingQr: asyncHandler(async (req, res) => {
    const item = await ownerBookingsService.scanOwnerBookingQr(
      req.user.id,
      req.body
    );
    return successResponse(res, item, "Quét QR check-in thành công");
  }),

  completeOwnerBooking: asyncHandler(async (req, res) => {
    const item = await ownerBookingsService.completeOwnerBooking(
      req.user.id,
      req.params,
      req.body
    );
    return successResponse(res, item, "Hoàn tất booking thành công");
  }),
};