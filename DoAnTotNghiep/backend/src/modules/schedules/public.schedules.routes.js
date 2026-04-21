import { Router } from "express";
import { schedulesController } from "./schedules.controller.js";
import {
  validateParams,
  validateQuery,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateFieldIdParams,
  validateAvailabilityQuery,
} from "./schedules.validator.js";

const router = Router();

router.get(
  "/:fieldId/availability",
  validateParams(validateFieldIdParams),
  validateQuery(validateAvailabilityQuery),
  schedulesController.getPublicAvailability
);

export default router;