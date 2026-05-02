import { notificationsRepository } from "./notifications.repository.js";
import {
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";

export const notificationsService = {
  async getMyNotifications(userId) {
    return notificationsRepository.findMyNotifications(userId);
  },

  async getMyUnreadCount(userId) {
    const count = await notificationsRepository.countMyUnreadNotifications(
      userId
    );

    return {
      unread_count: count,
    };
  },

  async createNotification(payload) {
    if (!payload?.user_id) {
      return null;
    }

    if (!payload?.title || !payload?.body) {
      throw new ValidationError("title và body là bắt buộc");
    }

    return notificationsRepository.createNotification({
      user_id: Number(payload.user_id),
      title: payload.title,
      body: payload.body,
      type: payload.type || "SYSTEM",
    });
  },

  async markAsRead(userId, notificationId) {
    const item = await notificationsRepository.findMyNotificationById(
      userId,
      notificationId
    );

    if (!item) {
      throw new NotFoundError("Không tìm thấy notification");
    }

    if (item.is_read) {
      return item;
    }

    return notificationsRepository.markAsRead(notificationId);
  },

  async markAllAsRead(userId) {
    await notificationsRepository.markAllAsRead(userId);
    return true;
  },

  async deleteMyNotification(userId, notificationId) {
    const item = await notificationsRepository.findMyNotificationById(
      userId,
      notificationId
    );

    if (!item) {
      throw new NotFoundError("Không tìm thấy notification");
    }

    return notificationsRepository.deleteMyNotification(notificationId);
  },

  async broadcastNotification(payload) {
    const users = await notificationsRepository.findAllActiveUsers();

    if (!users.length) {
      throw new ValidationError("Không có user active để gửi thông báo");
    }

    await notificationsRepository.createManyNotifications(users, payload);

    return {
      sent_count: users.length,
      ...payload,
    };
  },
};