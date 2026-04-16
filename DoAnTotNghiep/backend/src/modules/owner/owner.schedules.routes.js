import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import { ownerSchedulesController } from "./owner.schedules.controller.js";
import {
  validateOperatingHoursPayload,
  validateCreateBlackoutPayload,
} from "./owner.schedules.validator.js";

const router = Router();

router.use(requireAuth, requireApprovedOwner());

router.get(
  "/fields/:fieldId/operating-hours",
  ownerSchedulesController.getOperatingHours
);

router.put(
  "/fields/:fieldId/operating-hours",
  validateBody(validateOperatingHoursPayload),
  ownerSchedulesController.replaceOperatingHours
);

router.get(
  "/fields/:fieldId/blackout-dates",
  ownerSchedulesController.getBlackoutDates
);

router.post(
  "/fields/:fieldId/blackout-dates",
  validateBody(validateCreateBlackoutPayload),
  ownerSchedulesController.createBlackoutDate
);

router.delete(
  "/blackout-dates/:blackoutDateId",
  ownerSchedulesController.deleteBlackoutDate
);

export default router;