import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";
import { validateBody, validateQuery } from "../../core/middlewares/validate.middleware.js";
import { ownerBookingsController } from "./owner.bookings.controller.js";
import {
  validateOwnerBookingsQuery,
  validateRejectOwnerBookingPayload,
  validateCompleteOwnerBookingPayload,
  validateManualCheckInPayload,
  validateCheckInQrPayload,
} from "./owner.bookings.validator.js";

const router = Router();

router.use(requireAuth, requireApprovedOwner());

router.get(
  "/bookings",
  validateQuery(validateOwnerBookingsQuery),
  ownerBookingsController.getOwnerBookings
);

router.get(
  "/bookings/:bookingId",
  ownerBookingsController.getOwnerBookingDetail
);

router.patch(
  "/bookings/:bookingId/approve",
  ownerBookingsController.approveOwnerBooking
);

router.patch(
  "/bookings/:bookingId/reject",
  validateBody(validateRejectOwnerBookingPayload),
  ownerBookingsController.rejectOwnerBooking
);

router.patch(
  "/bookings/:bookingId/check-in",
  validateBody(validateManualCheckInPayload),
  ownerBookingsController.checkInOwnerBooking
);

router.post(
  "/bookings/check-in/scan",
  validateBody(validateCheckInQrPayload),
  ownerBookingsController.scanOwnerBookingQr
);

router.patch(
  "/bookings/:bookingId/complete",
  validateBody(validateCompleteOwnerBookingPayload),
  ownerBookingsController.completeOwnerBooking
);

export default router;