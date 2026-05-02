import { Router } from "express";
import { notificationsController } from "./notifications.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";
import {
  validateBody,
  validateParams,
} from "../../core/middlewares/validate.middleware.js";
import {
  validateNotificationIdParams,
  validateBroadcastPayload,
} from "./notifications.validator.js";

const router = Router();

router.get("/me", requireAuth, notificationsController.getMyNotifications);

router.get(
  "/unread-count",
  requireAuth,
  notificationsController.getMyUnreadCount
);

router.patch("/read-all", requireAuth, notificationsController.markAllAsRead);

router.patch(
  "/:notificationId/read",
  requireAuth,
  validateParams(validateNotificationIdParams),
  notificationsController.markAsRead
);

router.delete(
  "/:notificationId",
  requireAuth,
  validateParams(validateNotificationIdParams),
  notificationsController.deleteMyNotification
);

router.post(
  "/admin/broadcast",
  requireAuth,
  requireRole("ADMIN"),
  validateBody(validateBroadcastPayload),
  notificationsController.broadcastNotification
);

export default router;