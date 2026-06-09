import { Router } from "express";
import { favoritesController } from "./favorites.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import { APP_ROLES } from "../../config/constant.js";
import {
  validateParams,
  validateQuery,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateFavoriteFieldIdParams,
  validateFavoriteListQuery,
} from "./favorites.validator.js";

const router = Router();

router.use(requireAuth, requireRole(APP_ROLES.USER));

router.get(
  "/my",
  validateQuery(validateFavoriteListQuery),
  favoritesController.getMyFavorites,
);

router.get(
  "/check/:fieldId",
  validateParams(validateFavoriteFieldIdParams),
  favoritesController.checkFavorite,
);

router.post(
  "/:fieldId",
  validateParams(validateFavoriteFieldIdParams),
  favoritesController.addFavorite,
);

router.delete(
  "/:fieldId",
  validateParams(validateFavoriteFieldIdParams),
  favoritesController.removeFavorite,
);

export default router;
