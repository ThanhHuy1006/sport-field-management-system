import { Router } from "express";
import { reportsController } from "./reports.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import { validateQuery } from "../../core/middlewares/validate.middleware.js";
import { validateReportQuery } from "./reports.validator.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get(
  "/",
  validateQuery(validateReportQuery),
  reportsController.getAdminReports
);

export default router;