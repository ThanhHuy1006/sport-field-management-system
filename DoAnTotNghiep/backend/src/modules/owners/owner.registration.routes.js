import { Router } from "express";
import { ownerController } from "./owner.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import {
  validateOwnerRegistrationPayload,
  validateOwnerRegistrationUpdatePayload,
} from "./owner.validator.js";

const router = Router();

router.post(
  "/registration",
  requireAuth,
  validateBody(validateOwnerRegistrationPayload),
  ownerController.createOwnerRegistration
);

router.get(
  "/registration/me",
  requireAuth,
  ownerController.getMyOwnerRegistration
);

router.patch(
  "/registration/me",
  requireAuth,
  validateBody(validateOwnerRegistrationUpdatePayload),
  ownerController.updateMyOwnerRegistration
);

export default router;