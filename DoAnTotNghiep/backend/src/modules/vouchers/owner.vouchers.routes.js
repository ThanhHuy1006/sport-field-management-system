import { Router } from "express";
import { vouchersController } from "./vouchers.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  requireRole,
  requireApprovedOwner,
} from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateVoucherIdParams,
  validateCreateVoucherPayload,
  validateUpdateVoucherPayload,
  validateVoucherStatusPayload,
} from "./vouchers.validator.js";

const router = Router();

router.use(requireAuth, requireRole("OWNER"), requireApprovedOwner());

router.get("/", vouchersController.getOwnerVouchers);

router.post(
  "/",
  validateBody(validateCreateVoucherPayload),
  vouchersController.createOwnerVoucher
);

router.get(
  "/:voucherId",
  validateParams(validateVoucherIdParams),
  vouchersController.getOwnerVoucherDetail
);

router.patch(
  "/:voucherId",
  validateParams(validateVoucherIdParams),
  validateBody(validateUpdateVoucherPayload),
  vouchersController.updateOwnerVoucher
);

router.patch(
  "/:voucherId/status",
  validateParams(validateVoucherIdParams),
  validateBody(validateVoucherStatusPayload),
  vouchersController.updateOwnerVoucherStatus
);

export default router;