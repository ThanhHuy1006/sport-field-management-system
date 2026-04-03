import { Router } from "express";
import { paymentsController } from "./payments.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/create", requireAuth, paymentsController.createPayment);
router.get("/by-booking/:bookingId", requireAuth, paymentsController.getPaymentByBooking);
router.get("/:paymentId", requireAuth, paymentsController.getPaymentDetail);
router.post("/:paymentId/simulate-success", requireAuth, paymentsController.simulateSuccess);
router.post("/:paymentId/simulate-failed", requireAuth, paymentsController.simulateFailed);

export default router;