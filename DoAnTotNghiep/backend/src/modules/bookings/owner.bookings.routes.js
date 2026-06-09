import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";
import { ownerBookingsController } from "../owners/owner.bookings.controller.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateBookingIdParams,
  validateRejectBookingPayload,
  validateManualCheckInPayload,
  validateCheckInQrPayload,
  validateCompleteBookingPayload,
  validateBookingListQuery,
  validateRescheduleRequestIdParams,
  validateOwnerCancelBookingPayload,
  validateRejectRescheduleRequestPayload,
  validateRescheduleRequestListQuery,
} from "./bookings.validator.js";

const router = Router();
// console.log("✅ owner.schedules.routes.js loaded");

router.use(requireAuth, requireApprovedOwner());

router.get(
  "/",
  validateQuery(validateBookingListQuery),
  bookingsController.getOwnerBookings,
);
router.get(
  "/reschedule-requests",
  validateQuery(validateRescheduleRequestListQuery),
  bookingsController.getOwnerRescheduleRequests,
);

router.patch(
  "/reschedule-requests/:requestId/approve",
  validateParams(validateRescheduleRequestIdParams),
  bookingsController.approveOwnerRescheduleRequest,
);

router.patch(
  "/reschedule-requests/:requestId/reject",
  validateParams(validateRescheduleRequestIdParams),
  validateBody(validateRejectRescheduleRequestPayload),
  bookingsController.rejectOwnerRescheduleRequest,
);

router.get(
  "/:bookingId",
  validateParams(validateBookingIdParams),
  bookingsController.getOwnerBookingDetail,
);

router.patch(
  "/:bookingId/approve",
  validateParams(validateBookingIdParams),
  bookingsController.approveOwnerBooking,
);

router.patch(
  "/:bookingId/reject",
  validateParams(validateBookingIdParams),
  validateBody(validateRejectBookingPayload),
  bookingsController.rejectOwnerBooking,
);
router.patch(
  "/:bookingId/cancel",
  validateParams(validateBookingIdParams),
  validateBody(validateOwnerCancelBookingPayload),
  bookingsController.cancelOwnerBooking,
);

router.patch(
  "/:bookingId/check-in",
  validateParams(validateBookingIdParams),
  validateBody(validateManualCheckInPayload),
  bookingsController.checkInOwnerBooking,
);
router.post(
  "/check-in/verify",
  validateBody(validateCheckInQrPayload),
  ownerBookingsController.verifyOwnerBookingQr,
);

router.post(
  "/check-in/scan",
  validateBody(validateCheckInQrPayload),
  bookingsController.scanOwnerBookingQr,
);

router.patch(
  "/:bookingId/complete",
  validateParams(validateBookingIdParams),
  validateBody(validateCompleteBookingPayload),
  bookingsController.completeOwnerBooking,
);

export default router;
