import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { ownerBookingsService } from "./owner.bookings.service.js";

function mapOwnerBooking(item) {
  if (!item) return null;

  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    notes: item.notes,
    total_price: item.total_price,
    checked_in_at: item.checked_in_at || null,
    checked_in_by: item.checked_in_by || null,
    checkin_method: item.checkin_method || null,
    created_at: item.created_at,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
        }
      : null,
    user: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
          phone: item.users.phone,
        }
      : null,
    status_history: (item.booking_status_history || []).map((h) => ({
      id: h.id,
      from_status: h.from_status,
      to_status: h.to_status,
      changed_at: h.changed_at,
      reason: h.reason ?? h.note ?? null,
    })),
  };
}

export const ownerBookingsController = {
  getOwnerBookings: asyncHandler(async (req, res) => {
    const items = await ownerBookingsService.getOwnerBookings(req.user.id);

    return successResponse(
      res,
      items.map(mapOwnerBooking),
      "Lấy danh sách booking của owner thành công"
    );
  }),

  getOwnerBookingDetail: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const item = await ownerBookingsService.getOwnerBookingDetail(
      req.user.id,
      bookingId
    );

    return successResponse(
      res,
      mapOwnerBooking(item),
      "Lấy chi tiết booking của owner thành công"
    );
  }),

  approveOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const item = await ownerBookingsService.approveOwnerBooking(
      req.user.id,
      bookingId
    );

    return successResponse(res, mapOwnerBooking(item), "Duyệt booking thành công");
  }),

  rejectOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.rejectOwnerBooking(
      req.user.id,
      bookingId,
      payload
    );

    return successResponse(res, mapOwnerBooking(item), "Từ chối booking thành công");
  }),

  checkInOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.checkInOwnerBooking(
      req.user.id,
      bookingId,
      payload
    );

    return successResponse(res, mapOwnerBooking(item), "Check-in booking thành công");
  }),

  scanOwnerBookingQr: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;
    const item = await ownerBookingsService.scanOwnerBookingQr(
      req.user.id,
      payload
    );

    return successResponse(res, mapOwnerBooking(item), "Quét QR check-in thành công");
  }),

  completeOwnerBooking: asyncHandler(async (req, res) => {
    const { bookingId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerBookingsService.completeOwnerBooking(
      req.user.id,
      bookingId,
      payload
    );

    return successResponse(res, mapOwnerBooking(item), "Hoàn tất booking thành công");
  }),
};