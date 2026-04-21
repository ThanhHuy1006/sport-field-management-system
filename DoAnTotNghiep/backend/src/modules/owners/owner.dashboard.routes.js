import { Router } from "express";
import { ownerController } from "./owner.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get("/dashboard/summary", ownerController.getOwnerDashboardSummary);

router.get(
  "/dashboard/recent-bookings",
  ownerController.getRecentOwnerBookings
);

router.get(
  "/dashboard/recent-notifications",
  ownerController.getRecentOwnerNotifications
);

export default router;