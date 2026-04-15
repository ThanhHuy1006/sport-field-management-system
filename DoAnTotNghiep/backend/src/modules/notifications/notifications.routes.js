import { Router } from "express";
import { notificationsController } from "./notifications.controller.js";
import { requireAuth } from "../../core/middlewares/auth.middleware.js";
import { requireRole } from "../../core/middlewares/role.middleware.js";

const router = Router();

router.get("/me", requireAuth, notificationsController.getMyNotifications);
router.patch("/:notificationId/read", requireAuth, notificationsController.markAsRead);
router.patch("/read-all", requireAuth, notificationsController.markAllAsRead);
router.delete("/:notificationId", requireAuth, notificationsController.deleteMyNotification);

router.post(
  "/admin/broadcast",
  requireAuth,
  requireRole("ADMIN"),
  notificationsController.broadcastNotification
);

export default router;