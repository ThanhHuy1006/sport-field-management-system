import { Router } from "express";
import { schedulesController } from "../schedules/schedules.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateFieldIdParams,
  validateBlackoutDateIdParams,
  validateOperatingHoursPayload,
  validateBlackoutDatePayload,
  validateBlackoutPreviewPayload,
} from "../schedules/schedules.validator.js";

const router = Router();
console.log("✅ owner.schedules.routes.js loaded");

const requireOwnerOrAdmin = [
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  requireApprovedOwner(),
];

router.get(
  "/fields/:fieldId/operating-hours",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  schedulesController.getOwnerOperatingHours
);

router.put(
  "/fields/:fieldId/operating-hours",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  validateBody(validateOperatingHoursPayload),
  schedulesController.upsertOwnerOperatingHours
);

router.get(
  "/fields/:fieldId/blackout-dates",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  schedulesController.getOwnerBlackoutDates,
);

router.post(
  "/fields/:fieldId/blackout-dates/preview",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  validateBody(validateBlackoutPreviewPayload),
  schedulesController.previewBlackoutDate,
);

router.post(
  "/fields/:fieldId/blackout-dates",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  validateBody(validateBlackoutDatePayload),
  schedulesController.createBlackoutDate
);

// Alias cho frontend tab "Lịch đóng sân" nếu đang gọi /closures.
router.get(
  "/fields/:fieldId/closures",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  schedulesController.getOwnerBlackoutDates,
);

router.post(
  "/fields/:fieldId/closures/preview",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  validateBody(validateBlackoutPreviewPayload),
  schedulesController.previewBlackoutDate,
);

router.post(
  "/fields/:fieldId/closures",
  ...requireOwnerOrAdmin,
  validateParams(validateFieldIdParams),
  validateBody(validateBlackoutDatePayload),
  schedulesController.createBlackoutDate,
);

router.delete(
  "/blackout-dates/:blackoutDateId",
  ...requireOwnerOrAdmin,
  validateParams(validateBlackoutDateIdParams),
  schedulesController.deleteBlackoutDate
);

router.delete(
  "/closures/:blackoutDateId",
  ...requireOwnerOrAdmin,
  validateParams(validateBlackoutDateIdParams),
  schedulesController.deleteBlackoutDate,
);

export default router;
