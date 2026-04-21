import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateCreateReviewPayload,
  validateReviewIdParams,
  validateUpdateReviewPayload,
} from "./reviews.validator.js";

const router = Router();

router.post(
  "/",
  requireAuth,
  validateBody(validateCreateReviewPayload),
  reviewsController.createReview
);

router.patch(
  "/:reviewId",
  requireAuth,
  validateParams(validateReviewIdParams),
  validateBody(validateUpdateReviewPayload),
  reviewsController.updateMyReview
);

router.delete(
  "/:reviewId",
  requireAuth,
  validateParams(validateReviewIdParams),
  reviewsController.deleteMyReview
);

export default router;