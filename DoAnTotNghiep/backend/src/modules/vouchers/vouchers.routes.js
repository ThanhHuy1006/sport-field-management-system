import { Router } from "express";
import { vouchersController } from "./vouchers.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/validate", requireAuth, vouchersController.validateVoucher);
router.get("/available", requireAuth, vouchersController.getAvailableVouchers);

export default router;