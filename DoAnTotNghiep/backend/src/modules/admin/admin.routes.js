import { Router } from "express";
import { adminController } from "./admin.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/users", adminController.getUsers);
router.get("/users/:userId", adminController.getUserDetail);
router.patch("/users/:userId/status", adminController.updateUserStatus);

router.get("/owner-registrations", adminController.getOwnerRegistrations);
router.get("/owner-registrations/:userId", adminController.getOwnerRegistrationDetail);
router.patch("/owner-registrations/:userId/approve", adminController.approveOwnerRegistration);
router.patch("/owner-registrations/:userId/reject", adminController.rejectOwnerRegistration);

router.get("/fields", adminController.getAdminFields);
router.patch("/fields/:fieldId/approve", adminController.approveField);
router.patch("/fields/:fieldId/reject", adminController.rejectField);

router.get("/bookings", adminController.getAdminBookings);
router.get("/bookings/:bookingId", adminController.getAdminBookingDetail);

export default router;