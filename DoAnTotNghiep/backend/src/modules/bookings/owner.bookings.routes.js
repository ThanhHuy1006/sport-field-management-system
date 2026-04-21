import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";
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
} from "./bookings.validator.js";

const router = Router();

router.use(requireAuth, requireApprovedOwner());

router.get(
  "/",
  validateQuery(validateBookingListQuery),
  bookingsController.getOwnerBookings
);

router.get(
  "/:bookingId",
  validateParams(validateBookingIdParams),
  bookingsController.getOwnerBookingDetail
);

router.patch(
  "/:bookingId/approve",
  validateParams(validateBookingIdParams),
  bookingsController.approveOwnerBooking
);

router.patch(
  "/:bookingId/reject",
  validateParams(validateBookingIdParams),
  validateBody(validateRejectBookingPayload),
  bookingsController.rejectOwnerBooking
);

router.patch(
  "/:bookingId/check-in",
  validateParams(validateBookingIdParams),
  validateBody(validateManualCheckInPayload),
  bookingsController.checkInOwnerBooking
);

router.post(
  "/check-in/scan",
  validateBody(validateCheckInQrPayload),
  bookingsController.scanOwnerBookingQr
);

router.patch(
  "/:bookingId/complete",
  validateParams(validateBookingIdParams),
  validateBody(validateCompleteBookingPayload),
  bookingsController.completeOwnerBooking
);

export default router;