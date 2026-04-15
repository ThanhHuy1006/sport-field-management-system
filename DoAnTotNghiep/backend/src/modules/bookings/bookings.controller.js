import { successResponse } from "../../core/utils/response.js";
import { bookingsService } from "./bookings.service.js";
import { toBookingListItem, toBookingDetail } from "./bookings.mapper.js";
import {
  toOwnerBookingListItem,
  toOwnerBookingDetail,
} from "./bookings.mapper.js";

export const bookingsController = {
  async checkAvailability(req, res, next) {
    try {
      const result = await bookingsService.checkAvailability(req.body);
      return successResponse(res, result, "Kiểm tra khả dụng thành công");
    } catch (error) {
      next(error);
    }
  },

  async createBooking(req, res, next) {
    try {
      const booking = await bookingsService.createBooking(req.user.id, req.body);
      return successResponse(res, booking, "Tạo booking thành công", 201);
    } catch (error) {
      next(error);
    }
  },

  async getMyBookings(req, res, next) {
    try {
      const items = await bookingsService.getMyBookings(req.user.id);
      return successResponse(
        res,
        items.map(toBookingListItem),
        "Lấy danh sách booking thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getMyBookingDetail(req, res, next) {
    try {
      const item = await bookingsService.getMyBookingDetail(
        req.user.id,
        req.params.bookingId
      );
      return successResponse(res, toBookingDetail(item), "Lấy chi tiết booking thành công");
    } catch (error) {
      next(error);
    }
  },

  async cancelMyBooking(req, res, next) {
    try {
      const item = await bookingsService.cancelMyBooking(
        req.user.id,
        req.params.bookingId
      );
      return successResponse(res, item, "Hủy booking thành công");
    } catch (error) {
      next(error);
    }
  },
    async getOwnerBookings(req, res, next) {
    try {
      const items = await bookingsService.getOwnerBookings(req.user.id);
      return successResponse(
        res,
        items.map(toOwnerBookingListItem),
        "Lấy danh sách booking của owner thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getOwnerBookingDetail(req, res, next) {
    try {
      const item = await bookingsService.getOwnerBookingDetail(
        req.user.id,
        req.params.bookingId
      );
      return successResponse(
        res,
        toOwnerBookingDetail(item),
        "Lấy chi tiết booking của owner thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async approveOwnerBooking(req, res, next) {
    try {
      const item = await bookingsService.approveOwnerBooking(
        req.user.id,
        req.params.bookingId
      );
      return successResponse(res, item, "Duyệt booking thành công");
    } catch (error) {
      next(error);
    }
  },

  async rejectOwnerBooking(req, res, next) {
    try {
      const item = await bookingsService.rejectOwnerBooking(
        req.user.id,
        req.params.bookingId,
        req.body
      );
      return successResponse(res, item, "Từ chối booking thành công");
    } catch (error) {
      next(error);
    }
  },
};