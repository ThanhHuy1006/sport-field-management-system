import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { validateParams } from "../../core/middlewares/validate.middleware.js";
import { validateFieldReviewParams } from "./reviews.validator.js";

const router = Router();

router.get(
  "/:fieldId/reviews",
  validateParams(validateFieldReviewParams),
  reviewsController.getPublicFieldReviews
);

export default router;