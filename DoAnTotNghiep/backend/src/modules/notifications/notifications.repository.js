import prisma from "../../config/prisma.js";
import { USER_STATUS } from "../../config/constant.js";

export const notificationsRepository = {
  findMyNotifications(userId) {
    return prisma.notifications.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: "desc",
      },
    });
  },

  countMyUnreadNotifications(userId) {
    return prisma.notifications.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  },

  findMyNotificationById(userId, notificationId) {
    return prisma.notifications.findFirst({
      where: {
        id: notificationId,
        user_id: userId,
      },
    });
  },

  createNotification(payload) {
    return prisma.notifications.create({
      data: {
        user_id: payload.user_id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        is_read: false,
      },
    });
  },

  markAsRead(notificationId) {
    return prisma.notifications.update({
      where: {
        id: notificationId,
      },
      data: {
        is_read: true,
      },
    });
  },

  markAllAsRead(userId) {
    return prisma.notifications.updateMany({
      where: {
        user_id: userId,
        is_read: false,
      },
      data: {
        is_read: true,
      },
    });
  },

  deleteMyNotification(notificationId) {
    return prisma.notifications.delete({
      where: {
        id: notificationId,
      },
    });
  },

  findAllActiveUsers() {
    return prisma.users.findMany({
      where: {
        status: USER_STATUS.ACTIVE,
      },
      select: {
        id: true,
      },
    });
  },

  createManyNotifications(userIds, payload) {
    return prisma.notifications.createMany({
      data: userIds.map((user) => ({
        user_id: user.id,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        is_read: false,
      })),
    });
  },
};