import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateBookingIdParams,
  validateCheckAvailabilityPayload,
  validateCreateBookingPayload,
} from "./bookings.validator.js";

const router = Router();

router.post(
  "/check-availability",
  requireAuth,
  validateBody(validateCheckAvailabilityPayload),
  bookingsController.checkAvailability
);

router.post(
  "/",
  requireAuth,
  validateBody(validateCreateBookingPayload),
  bookingsController.createBooking
);

router.get("/my", requireAuth, bookingsController.getMyBookings);

router.get(
  "/my/:bookingId",
  requireAuth,
  validateParams(validateBookingIdParams),
  bookingsController.getMyBookingDetail
);

router.patch(
  "/my/:bookingId/cancel",
  requireAuth,
  validateParams(validateBookingIdParams),
  bookingsController.cancelMyBooking
);

router.get(
  "/my/:bookingId/check-in-qr",
  requireAuth,
  validateParams(validateBookingIdParams),
  bookingsController.getMyBookingCheckInQr
);

export default router;