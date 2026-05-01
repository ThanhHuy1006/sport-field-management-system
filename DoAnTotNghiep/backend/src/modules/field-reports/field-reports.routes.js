import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import { uploadFieldReportImagesMiddleware } from "../uploads/uploads.middleware.js";
import { fieldReportsController } from "./field-reports.controller.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  requireRole("USER"),
  uploadFieldReportImagesMiddleware,
  fieldReportsController.createFieldReport
);

export default router;