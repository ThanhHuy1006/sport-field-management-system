import { Router } from "express";
import { fieldsController } from "./fields.controller.js";
import {
  validateQuery,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validatePublicFieldQuery,
  validateFieldIdParams,
  validatePublicFieldReviewsQuery,
} from "./fields.validator.js";

const router = Router();

//lấy danh sách sân
router.get(
  "/",
  validateQuery(validatePublicFieldQuery),
  fieldsController.getPublicFields
);
//lấy thông tin chủ sân theo ID
router.get(
  "/:fieldId/owner-info",
  validateParams(validateFieldIdParams),
  fieldsController.getPublicFieldOwnerInfo
);
//Lấy reviews sân theo ID
router.get(
  "/:fieldId/reviews",
  validateParams(validateFieldIdParams),
  validateQuery(validatePublicFieldReviewsQuery),
  fieldsController.getPublicFieldReviews
);
//Lấy danh sách hình ảnh sân theo ID 

router.get(
  "/:fieldId/images",
  validateParams(validateFieldIdParams),
  fieldsController.getPublicFieldImages
);
//Xem chi tiết sân theo ID 
router.get(
  "/:fieldId",
  validateParams(validateFieldIdParams),
  fieldsController.getPublicFieldDetail
);

export default router;