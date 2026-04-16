import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireApprovedOwner } from "../../core/middlewares/role.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import { ownerFieldsController } from "./owner.fields.controller.js";
import {
  validateCreateOwnerFieldPayload,
  validateUpdateOwnerFieldPayload,
  validateOwnerFieldStatusPayload,
} from "./owner.fields.validator.js";

const router = Router();

router.use(requireAuth, requireApprovedOwner());

router.get("/fields", ownerFieldsController.getOwnerFields);

router.post(
  "/fields",
  validateBody(validateCreateOwnerFieldPayload),
  ownerFieldsController.createOwnerField
);

router.get("/fields/:fieldId", ownerFieldsController.getOwnerFieldDetail);

router.patch(
  "/fields/:fieldId",
  validateBody(validateUpdateOwnerFieldPayload),
  ownerFieldsController.updateOwnerField
);

router.patch(
  "/fields/:fieldId/status",
  validateBody(validateOwnerFieldStatusPayload),
  ownerFieldsController.updateOwnerFieldStatus
);

export default router;