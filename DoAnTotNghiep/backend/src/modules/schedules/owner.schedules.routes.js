import { Router } from "express";
import { schedulesController } from "./schedules.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get(
  "/fields/:fieldId/operating-hours",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  schedulesController.getOwnerOperatingHours
);

router.put(
  "/fields/:fieldId/operating-hours",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  schedulesController.upsertOwnerOperatingHours
);

router.post(
  "/fields/:fieldId/blackout-dates",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  schedulesController.createBlackoutDate
);

router.delete(
  "/blackout-dates/:blackoutDateId",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  schedulesController.deleteBlackoutDate
);

export default router;