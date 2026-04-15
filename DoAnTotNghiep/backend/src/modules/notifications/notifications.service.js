import { notificationsRepository } from "./notifications.repository.js";
import {
  validateNotificationId,
  validateBroadcastPayload,
} from "./notifications.validator.js";

export const notificationsService = {
  async getMyNotifications(userId) {
    return notificationsRepository.findMyNotifications(userId);
  },

  async markAsRead(userId, notificationId) {
    const id = validateNotificationId(notificationId);

    const item = await notificationsRepository.findMyNotificationById(userId, id);
    if (!item) {
      throw new Error("Không tìm thấy notification");
    }

    if (item.is_read) {
      return item;
    }

    return notificationsRepository.markAsRead(id);
  },

  async markAllAsRead(userId) {
    await notificationsRepository.markAllAsRead(userId);
    return true;
  },

  async deleteMyNotification(userId, notificationId) {
    const id = validateNotificationId(notificationId);

    const item = await notificationsRepository.findMyNotificationById(userId, id);
    if (!item) {
      throw new Error("Không tìm thấy notification");
    }

    return notificationsRepository.deleteMyNotification(id);
  },

  async broadcastNotification(payload) {
    const valid = validateBroadcastPayload(payload);

    const users = await notificationsRepository.findAllActiveUsers();
    if (!users.length) {
      throw new Error("Không có user active để gửi thông báo");
    }

    await notificationsRepository.createManyNotifications(users, valid);

    return {
      sent_count: users.length,
      ...valid,
    };
  },
};