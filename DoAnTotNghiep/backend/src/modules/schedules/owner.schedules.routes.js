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
} from "../schedules/schedules.validator.js";

const router = Router();

router.get(
  "/fields/:fieldId/operating-hours",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  requireApprovedOwner(),
  validateParams(validateFieldIdParams),
  schedulesController.getOwnerOperatingHours
);

router.put(
  "/fields/:fieldId/operating-hours",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  requireApprovedOwner(),
  validateParams(validateFieldIdParams),
  validateBody(validateOperatingHoursPayload),
  schedulesController.upsertOwnerOperatingHours
);

router.post(
  "/fields/:fieldId/blackout-dates",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  requireApprovedOwner(),
  validateParams(validateFieldIdParams),
  validateBody(validateBlackoutDatePayload),
  schedulesController.createBlackoutDate
);

router.delete(
  "/blackout-dates/:blackoutDateId",
  requireAuth,
  requireRole("OWNER", "ADMIN"),
  requireApprovedOwner(),
  validateParams(validateBlackoutDateIdParams),
  schedulesController.deleteBlackoutDate
);

export default router;