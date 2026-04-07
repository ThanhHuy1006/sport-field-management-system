import { Router } from "express";
import { vouchersController } from "./vouchers.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get("/", requireAuth, requireRole("OWNER", "ADMIN"), vouchersController.getOwnerVouchers);
router.post("/", requireAuth, requireRole("OWNER", "ADMIN"), vouchersController.createOwnerVoucher);
router.get("/:voucherId", requireAuth, requireRole("OWNER", "ADMIN"), vouchersController.getOwnerVoucherDetail);
router.patch("/:voucherId", requireAuth, requireRole("OWNER", "ADMIN"), vouchersController.updateOwnerVoucher);
router.patch("/:voucherId/status", requireAuth, requireRole("OWNER", "ADMIN"), vouchersController.updateOwnerVoucherStatus);

export default router;