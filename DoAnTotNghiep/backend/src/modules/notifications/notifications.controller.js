import { successResponse } from "../../core/utils/response.js";
import { notificationsService } from "./notifications.service.js";
import { toNotificationResponse } from "./notifications.mapper.js";

export const notificationsController = {
  async getMyNotifications(req, res, next) {
    try {
      const items = await notificationsService.getMyNotifications(req.user.id);
      return successResponse(
        res,
        items.map(toNotificationResponse),
        "Lấy notifications thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async markAsRead(req, res, next) {
    try {
      const item = await notificationsService.markAsRead(
        req.user.id,
        req.params.notificationId
      );
      return successResponse(
        res,
        toNotificationResponse(item),
        "Đánh dấu đã đọc thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async markAllAsRead(req, res, next) {
    try {
      await notificationsService.markAllAsRead(req.user.id);
      return successResponse(res, null, "Đánh dấu tất cả đã đọc thành công");
    } catch (error) {
      next(error);
    }
  },

  async deleteMyNotification(req, res, next) {
    try {
      await notificationsService.deleteMyNotification(
        req.user.id,
        req.params.notificationId
      );
      return successResponse(res, null, "Xóa notification thành công");
    } catch (error) {
      next(error);
    }
  },

  async broadcastNotification(req, res, next) {
    try {
      const result = await notificationsService.broadcastNotification(req.body);
      return successResponse(res, result, "Broadcast notification thành công", 201);
    } catch (error) {
      next(error);
    }
  },
};