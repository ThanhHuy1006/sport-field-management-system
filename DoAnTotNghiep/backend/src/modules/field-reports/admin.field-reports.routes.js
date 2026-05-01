import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middlewares/validate.middleware.js";
import { fieldReportsController } from "./field-reports.controller.js";
import {
  validateAdminFieldReportQuery,
  validateFieldReportIdParams,
  validateUpdateFieldReportStatusPayload,
} from "./field-reports.validator.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get(
  "/",
  validateQuery(validateAdminFieldReportQuery),
  fieldReportsController.getAdminFieldReports
);

router.get(
  "/:reportId",
  validateParams(validateFieldReportIdParams),
  fieldReportsController.getAdminFieldReportDetail
);

router.patch(
  "/:reportId/status",
  validateParams(validateFieldReportIdParams),
  validateBody(validateUpdateFieldReportStatusPayload),
  fieldReportsController.updateAdminFieldReportStatus
);

export default router;