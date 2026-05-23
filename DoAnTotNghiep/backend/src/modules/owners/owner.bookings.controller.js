import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { ownerBookingsService } from "./owner.bookings.service.js";
import { mapOwnerBooking, mapOwnerBookings } from "./owner.bookings.mapper.js";
export const ownerBookingsController = {
  getOwnerBookings: asyncHandler(async (req, res) => {
    const items = await ownerBookingsService.getOwnerBookings(req.user.id);

    return successResponse(
      res,
      mapOwnerBookings(items),
      "Lấy danh sách booking của owner thành công",
    );
  }),

  getOwnerBookingDetail: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const item = await ownerBookingsService.getOwnerBookingDetail(
      req.user.id,
      bookingId,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Lấy chi tiết booking của owner thành công",
    );
  }),

  approveOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const item = await ownerBookingsService.approveOwnerBooking(
      req.user.id,
      bookingId,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Duyệt booking thành công",
    );
  }),

  rejectOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.rejectOwnerBooking(
      req.user.id,
      bookingId,
      payload,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Từ chối booking thành công",
    );
  }),

  checkInOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.checkInOwnerBooking(
      req.user.id,
      bookingId,
      payload,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Check-in booking thành công",
    );
  }),
  verifyOwnerBookingQr: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.verifyOwnerBookingQr(
      req.user.id,
      payload,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Xác thực QR booking thành công",
    );
  }),

  scanOwnerBookingQr: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;
    const item = await ownerBookingsService.scanOwnerBookingQr(
      req.user.id,
      payload,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Quét QR check-in thành công",
    );
  }),

  completeOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.completeOwnerBooking(
      req.user.id,
      bookingId,
      payload,
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Hoàn tất booking thành công",
    );
  }),
};
