import { Router } from "express";
import { vouchersController } from "./vouchers.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateQuery,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateVoucherCodePayload,
  validateAvailableVouchersQuery,
} from "./vouchers.validator.js";

const router = Router();

router.post(
  "/validate",
  requireAuth,
  validateBody(validateVoucherCodePayload),
  vouchersController.validateVoucher
);

router.get(
  "/available",
  requireAuth,
  validateQuery(validateAvailableVouchersQuery),
  vouchersController.getAvailableVouchers
);

export default router;