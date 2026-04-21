import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import { ownerBookingsController } from "./owner.bookings.controller.js";
import {
  validateBookingIdParam,
  validateRejectBookingPayload,
  validateManualCheckInPayload,
  validateCheckInQrPayload,
  validateCompleteBookingPayload,
} from "./owner.bookings.validator.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get("/", ownerBookingsController.getOwnerBookings);

router.get(
  "/:bookingId",
  validateParams(validateBookingIdParam),
  ownerBookingsController.getOwnerBookingDetail
);

router.patch(
  "/:bookingId/approve",
  validateParams(validateBookingIdParam),
  ownerBookingsController.approveOwnerBooking
);

router.patch(
  "/:bookingId/reject",
  validateParams(validateBookingIdParam),
  validateBody(validateRejectBookingPayload),
  ownerBookingsController.rejectOwnerBooking
);

router.patch(
  "/:bookingId/check-in",
  validateParams(validateBookingIdParam),
  validateBody(validateManualCheckInPayload),
  ownerBookingsController.checkInOwnerBooking
);

router.post(
  "/check-in/scan",
  validateBody(validateCheckInQrPayload),
  ownerBookingsController.scanOwnerBookingQr
);

router.patch(
  "/:bookingId/complete",
  validateParams(validateBookingIdParam),
  validateBody(validateCompleteBookingPayload),
  ownerBookingsController.completeOwnerBooking
);

export default router;