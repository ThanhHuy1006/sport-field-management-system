import { Router } from "express";
import { paymentsController } from "./payments.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateBookingIdParams,
  validatePaymentIdParams,
  validateCreatePaymentPayload,
} from "./payments.validator.js";

const router = Router();

router.post(
  "/create",
  requireAuth,
  validateBody(validateCreatePaymentPayload),
  paymentsController.createPayment
);

router.get(
  "/by-booking/:bookingId",
  requireAuth,
  validateParams(validateBookingIdParams),
  paymentsController.getPaymentByBooking
);

router.get(
  "/:paymentId",
  requireAuth,
  validateParams(validatePaymentIdParams),
  paymentsController.getPaymentDetail
);

router.post(
  "/:paymentId/simulate-success",
  requireAuth,
  validateParams(validatePaymentIdParams),
  paymentsController.simulateSuccess
);

router.post(
  "/:paymentId/simulate-failed",
  requireAuth,
  validateParams(validatePaymentIdParams),
  paymentsController.simulateFailed
);

export default router;