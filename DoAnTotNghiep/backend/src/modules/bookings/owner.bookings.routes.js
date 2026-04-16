import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.use(requireAuth, requireApprovedOwner());

router.get("/", bookingsController.getOwnerBookings);
router.get("/:bookingId", bookingsController.getOwnerBookingDetail);
router.patch("/:bookingId/approve", bookingsController.approveOwnerBooking);
router.patch("/:bookingId/reject", bookingsController.rejectOwnerBooking);
router.patch("/:bookingId/check-in", bookingsController.checkInOwnerBooking);
router.post("/check-in/scan", bookingsController.scanOwnerBookingQr);
router.patch("/:bookingId/complete", bookingsController.completeOwnerBooking);

export default router;