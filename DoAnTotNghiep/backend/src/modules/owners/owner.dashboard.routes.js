import { Router } from "express";
import { ownerController } from "./owner.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get(
  "/dashboard/summary",
  requireAuth,
  requireApprovedOwner(),
  ownerController.getOwnerDashboardSummary
);

router.get(
  "/dashboard/recent-bookings",
  requireAuth,
  requireApprovedOwner(),
  ownerController.getRecentOwnerBookings
);

router.get(
  "/dashboard/recent-notifications",
  requireAuth,
  requireApprovedOwner(),
  ownerController.getRecentOwnerNotifications
);

export default router;