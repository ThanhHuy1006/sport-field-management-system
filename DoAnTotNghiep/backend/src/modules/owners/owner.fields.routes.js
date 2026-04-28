import { Router } from "express";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { uploadFieldImagesMiddleware } from "../uploads/uploads.middleware.js";
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
  validateFieldImageParams,
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
router.post(
  "/fields/:fieldId/images",
  validateParams(validateFieldIdParam),
  uploadFieldImagesMiddleware,
  ownerFieldsController.uploadOwnerFieldImages
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
router.patch(
  "/fields/:fieldId/images/:imageId/primary",
  validateParams(validateFieldImageParams),
  ownerFieldsController.setOwnerFieldPrimaryImage
);
router.delete(
  "/fields/:fieldId/images/:imageId",
  validateParams(validateFieldImageParams),
  ownerFieldsController.deleteOwnerFieldImage
);

export default router;