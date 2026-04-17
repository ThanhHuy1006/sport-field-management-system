import { Router } from "express";
import { fieldsController } from "./fields.controller.js";
import {
  validateQuery,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validatePublicFieldQuery,
  validateFieldIdParams,
} from "./fields.validator.js";

const router = Router();

router.get("/", validateQuery(validatePublicFieldQuery), fieldsController.getPublicFields);
router.get("/:fieldId", validateParams(validateFieldIdParams), fieldsController.getPublicFieldDetail);
router.get("/:fieldId/images", validateParams(validateFieldIdParams), fieldsController.getPublicFieldImages);

export default router;