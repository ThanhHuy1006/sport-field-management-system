//todo
import { Router } from "express";
import { usersController } from "./users.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { validateBody } from "../../core/middlewares/validate.middleware.js";
import { validateUpdateMePayload } from "./users.validator.js";

const router = Router();

router.use(requireAuth);

router.get("/me", usersController.getMe);

router.patch(
  "/me",
  validateBody(validateUpdateMePayload),
  usersController.updateMe
);

export default router;