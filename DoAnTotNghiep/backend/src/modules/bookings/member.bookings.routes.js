import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/check-availability", requireAuth, bookingsController.checkAvailability);
router.post("/", requireAuth, bookingsController.createBooking);
router.get("/my", requireAuth, bookingsController.getMyBookings);
router.get("/my/:bookingId", requireAuth, bookingsController.getMyBookingDetail);
router.patch("/my/:bookingId/cancel", requireAuth, bookingsController.cancelMyBooking);
router.get("/my/:bookingId/check-in-qr", requireAuth, bookingsController.getMyBookingCheckInQr);

export default router;