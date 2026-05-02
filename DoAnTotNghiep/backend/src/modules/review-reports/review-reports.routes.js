import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import { reviewReportsController } from "./review-reports.controller.js";
import { validateCreateReviewReportPayload } from "./review-reports.validator.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateBody(validateCreateReviewReportPayload),
  reviewReportsController.createReviewReport,
);

export default router;