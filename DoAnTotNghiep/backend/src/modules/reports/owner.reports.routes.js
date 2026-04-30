import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import { validateQuery } from "../../core/middlewares/validate.middleware.js";
import { validateReportQuery } from "./reports.validator.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get(
  "/",
  validateQuery(validateReportQuery),
  reportsController.getOwnerReports
);

export default router;