import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/", requireAuth, reviewsController.createReview);
router.patch("/:reviewId", requireAuth, reviewsController.updateMyReview);
router.delete("/:reviewId", requireAuth, reviewsController.deleteMyReview);

export default router;