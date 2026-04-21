import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import { ownerSchedulesController } from "./owner.schedules.controller.js";
import {
  validateFieldIdParam,
  validateBlackoutDateIdParam,
  validateOwnerOperatingHoursPayload,
  validateOwnerBlackoutDatePayload,
} from "./owner.schedules.validator.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get(
  "/fields/:fieldId/operating-hours",
  validateParams(validateFieldIdParam),
  ownerSchedulesController.getOwnerOperatingHours
);

router.put(
  "/fields/:fieldId/operating-hours",
  validateParams(validateFieldIdParam),
  validateBody(validateOwnerOperatingHoursPayload),
  ownerSchedulesController.upsertOwnerOperatingHours
);

router.post(
  "/fields/:fieldId/blackout-dates",
  validateParams(validateFieldIdParam),
  validateBody(validateOwnerBlackoutDatePayload),
  ownerSchedulesController.createBlackoutDate
);

router.delete(
  "/blackout-dates/:blackoutDateId",
  validateParams(validateBlackoutDateIdParam),
  ownerSchedulesController.deleteBlackoutDate
);

export default router;