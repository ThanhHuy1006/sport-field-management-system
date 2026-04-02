import { Router } from "express";
import { fieldsController } from "./fields.controller.js";

const router = Router();

router.get("/", fieldsController.getPublicFields);
router.get("/:fieldId", fieldsController.getPublicFieldDetail);
router.get("/:fieldId/images", fieldsController.getPublicFieldImages);

export default router;