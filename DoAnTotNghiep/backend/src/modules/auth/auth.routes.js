import { Router } from "express";
import { authController } from "./auth.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import {
  validateRegisterPayload,
  validateLoginPayload,
  validateChangePasswordPayload,
} from "./auth.validator.js";

const router = Router();

router.post("/register", validateBody(validateRegisterPayload), authController.register);
router.post("/login", validateBody(validateLoginPayload), authController.login);
router.get("/me", requireAuth, authController.me);
router.patch(
  "/change-password",
  requireAuth,
  validateBody(validateChangePasswordPayload),
  authController.changePassword
);

export default router;