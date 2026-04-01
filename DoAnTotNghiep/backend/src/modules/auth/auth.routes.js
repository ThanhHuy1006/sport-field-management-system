import { Router } from "express";
import { authController } from "./auth.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";

const router = Router();

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", requireAuth, authController.me);
router.patch("/change-password", requireAuth, authController.changePassword);

export default router;