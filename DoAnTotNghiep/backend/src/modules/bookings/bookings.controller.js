import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { bookingsService } from "./bookings.service.js";
import {
  toBookingListItem,
  toBookingDetail,
  toOwnerBookingListItem,
  toOwnerBookingDetail,
} from "./bookings.mapper.js";

export const bookingsController = {
  checkAvailability: asyncHandler(async (req, res) => {
    const result = await bookingsService.checkAvailability(req.body);
    return successResponse(res, result, "Kiểm tra khả dụng thành công");
  }),

  createBooking: asyncHandler(async (req, res) => {
    const booking = await bookingsService.createBooking(req.user.id, req.body);
    return successResponse(res, booking, "Tạo booking thành công", 201);
  }),

  getMyBookings: asyncHandler(async (req, res) => {
    const items = await bookingsService.getMyBookings(req.user.id);
    return successResponse(
      res,
      items.map(toBookingListItem),
      "Lấy danh sách booking thành công"
    );
  }),

  getMyBookingDetail: asyncHandler(async (req, res) => {
    const item = await bookingsService.getMyBookingDetail(
      req.user.id,
      req.params.bookingId
    );
    return successResponse(
      res,
      toBookingDetail(item),
      "Lấy chi tiết booking thành công"
    );
  }),

  cancelMyBooking: asyncHandler(async (req, res) => {
    const item = await bookingsService.cancelMyBooking(
      req.user.id,
      req.params.bookingId
    );
    return successResponse(res, item, "Hủy booking thành công");
  }),

  getMyBookingCheckInQr: asyncHandler(async (req, res) => {
    const data = await bookingsService.getMyBookingCheckInQr(
      req.user.id,
      req.params.bookingId
    );
    return successResponse(res, data, "Lấy mã check-in QR thành công");
  }),

  getOwnerBookings: asyncHandler(async (req, res) => {
    const items = await bookingsService.getOwnerBookings(req.user.id);
    return successResponse(
      res,
      items.map(toOwnerBookingListItem),
      "Lấy danh sách booking của owner thành công"
    );
  }),

  getOwnerBookingDetail: asyncHandler(async (req, res) => {
    const item = await bookingsService.getOwnerBookingDetail(
      req.user.id,
      req.params.bookingId
    );
    return successResponse(
      res,
      toOwnerBookingDetail(item),
      "Lấy chi tiết booking của owner thành công"
    );
  }),

  approveOwnerBooking: asyncHandler(async (req, res) => {
    const item = await bookingsService.approveOwnerBooking(
      req.user.id,
      req.params.bookingId
    );
    return successResponse(res, item, "Duyệt booking thành công");
  }),

  rejectOwnerBooking: asyncHandler(async (req, res) => {
    const item = await bookingsService.rejectOwnerBooking(
      req.user.id,
      req.params.bookingId,
      req.body
    );
    return successResponse(res, item, "Từ chối booking thành công");
  }),

  checkInOwnerBooking: asyncHandler(async (req, res) => {
    const item = await bookingsService.checkInOwnerBooking(
      req.user.id,
      req.params.bookingId,
      req.body
    );
    return successResponse(res, item, "Check-in booking thành công");
  }),

  scanOwnerBookingQr: asyncHandler(async (req, res) => {
    const item = await bookingsService.scanOwnerBookingQr(
      req.user.id,
      req.body
    );
    return successResponse(res, item, "Quét QR check-in thành công");
  }),

  completeOwnerBooking: asyncHandler(async (req, res) => {
    const item = await bookingsService.completeOwnerBooking(
      req.user.id,
      req.params.bookingId,
      req.body
    );
    return successResponse(res, item, "Hoàn tất booking thành công");
  }),
};