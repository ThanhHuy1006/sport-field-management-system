import { Router } from "express";
import { ownerController } from "./owner.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import { validateOwnerProfileUpdatePayload } from "./owner.validator.js";

const router = Router();

router.get(
  "/profile/me",
  requireAuth,
  requireRole("OWNER"),
  requireApprovedOwner(),
  ownerController.getMyOwnerProfile
);

router.patch(
  "/profile/me",
  requireAuth,
  requireRole("OWNER"),
  requireApprovedOwner(),
  validateBody(validateOwnerProfileUpdatePayload),
  ownerController.updateMyOwnerProfile
);

export default router;