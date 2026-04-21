import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import { ownerFieldsController } from "./owner.fields.controller.js";
import {
  validateFieldIdParam,
  validateCreateOwnerFieldPayload,
  validateUpdateOwnerFieldPayload,
  validateOwnerFieldStatusPayload,
} from "./owner.fields.validator.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get("/fields", ownerFieldsController.getOwnerFields);

router.post(
  "/fields",
  validateBody(validateCreateOwnerFieldPayload),
  ownerFieldsController.createOwnerField
);

router.get(
  "/fields/:fieldId",
  validateParams(validateFieldIdParam),
  ownerFieldsController.getOwnerFieldDetail
);

router.patch(
  "/fields/:fieldId",
  validateParams(validateFieldIdParam),
  validateBody(validateUpdateOwnerFieldPayload),
  ownerFieldsController.updateOwnerField
);

router.patch(
  "/fields/:fieldId/status",
  validateParams(validateFieldIdParam),
  validateBody(validateOwnerFieldStatusPayload),
  ownerFieldsController.updateOwnerFieldStatus
);

export default router;