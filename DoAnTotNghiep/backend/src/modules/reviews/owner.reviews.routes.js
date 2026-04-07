import { Router } from "express";
import { reviewsController } from "./reviews.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get("/", requireAuth, requireRole("OWNER", "ADMIN"), reviewsController.getOwnerReviews);
router.post("/:reviewId/reply", requireAuth, requireRole("OWNER", "ADMIN"), reviewsController.replyOwnerReview);
router.patch("/:reviewId/reply", requireAuth, requireRole("OWNER", "ADMIN"), reviewsController.replyOwnerReview);

export default router;