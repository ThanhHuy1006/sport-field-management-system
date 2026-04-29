import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import { adminController } from "./admin.controller.js";
import {
  validateAdminUserIdParams,
  validateAdminFieldIdParams,
  validateAdminBookingIdParams,
  validateUserStatusPayload,
  validateRejectOwnerRegistrationPayload,
  validateRejectFieldPayload,
} from "./admin.validator.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get("/dashboard/summary", adminController.getAdminDashboardSummary);

router.get("/users", adminController.getUsers);

router.get(
  "/users/:userId",
  validateParams(validateAdminUserIdParams),
  adminController.getUserDetail
);

router.patch(
  "/users/:userId/status",
  validateParams(validateAdminUserIdParams),
  validateBody(validateUserStatusPayload),
  adminController.updateUserStatus
);

router.get("/owner-registrations", adminController.getOwnerRegistrations);

router.get(
  "/owner-registrations/:userId",
  validateParams(validateAdminUserIdParams),
  adminController.getOwnerRegistrationDetail
);

router.patch(
  "/owner-registrations/:userId/approve",
  validateParams(validateAdminUserIdParams),
  adminController.approveOwnerRegistration
);

router.patch(
  "/owner-registrations/:userId/reject",
  validateParams(validateAdminUserIdParams),
  validateBody(validateRejectOwnerRegistrationPayload),
  adminController.rejectOwnerRegistration
);

router.get("/fields", adminController.getAdminFields);

router.patch(
  "/fields/:fieldId/approve",
  validateParams(validateAdminFieldIdParams),
  adminController.approveField
);

router.patch(
  "/fields/:fieldId/reject",
  validateParams(validateAdminFieldIdParams),
  validateBody(validateRejectFieldPayload),
  adminController.rejectField
);

router.get("/bookings", adminController.getAdminBookings);

router.get(
  "/bookings/:bookingId",
  validateParams(validateAdminBookingIdParams),
  adminController.getAdminBookingDetail
);

export default router;