import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateReplyReviewPayload,
  validateReviewIdParams,
} from "./reviews.validator.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get("/", reviewsController.getOwnerReviews);

router.post(
  "/:reviewId/reply",
  validateParams(validateReviewIdParams),
  validateBody(validateReplyReviewPayload),
  reviewsController.replyOwnerReview
);

router.patch(
  "/:reviewId/reply",
  validateParams(validateReviewIdParams),
  validateBody(validateReplyReviewPayload),
  reviewsController.replyOwnerReview
);

export default router;