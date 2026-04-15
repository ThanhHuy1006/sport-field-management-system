import { Router } from "express";
import { bookingsController } from "./bookings.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get("/", requireAuth, requireRole("OWNER", "ADMIN"), bookingsController.getOwnerBookings);
router.get("/:bookingId", requireAuth, requireRole("OWNER", "ADMIN"), bookingsController.getOwnerBookingDetail);
router.patch("/:bookingId/approve", requireAuth, requireRole("OWNER", "ADMIN"), bookingsController.approveOwnerBooking);
router.patch("/:bookingId/reject", requireAuth, requireRole("OWNER", "ADMIN"), bookingsController.rejectOwnerBooking);

export default router;