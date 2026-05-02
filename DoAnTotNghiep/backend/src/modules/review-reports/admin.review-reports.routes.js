import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../core/middlewares/validate.middleware.js";
import { reviewReportsController } from "./review-reports.controller.js";
import {
  validateAdminReviewReportQuery,
  validateReviewReportIdParams,
  validateUpdateReviewReportStatusPayload,
} from "./review-reports.validator.js";

const router = Router();

router.use(requireAuth, requireRole("ADMIN"));

router.get(
  "/",
  validateQuery(validateAdminReviewReportQuery),
  reviewReportsController.getAdminReviewReports,
);

router.get(
  "/:reportId",
  validateParams(validateReviewReportIdParams),
  reviewReportsController.getAdminReviewReportDetail,
);

router.patch(
  "/:reportId/status",
  validateParams(validateReviewReportIdParams),
  validateBody(validateUpdateReviewReportStatusPayload),
  reviewReportsController.updateAdminReviewReportStatus,
);

export default router;