import prisma from "../../config/prisma.js";

export const notificationsRepository = {
  findMyNotifications(userId) {
    return prisma.notifications.findMany({
      where: {
        user_id: userId,
      },
      orderBy: { created_at: "desc" },
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

  markAsRead(notificationId) {
    return prisma.notifications.update({
      where: { id: notificationId },
      data: {
        is_read: true,
        read_at: new Date(),
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
        read_at: new Date(),
      },
    });
  },

  deleteMyNotification(notificationId) {
    return prisma.notifications.delete({
      where: { id: notificationId },
    });
  },

  findAllActiveUsers() {
    return prisma.users.findMany({
      where: {
        status: "active",
      },
      select: { id: true },
    });
  },

  createManyNotifications(userIds, payload) {
    return prisma.notifications.createMany({
      data: userIds.map((user) => ({
        user_id: user.id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        data: payload.data ? JSON.stringify(payload.data) : null,
        is_read: false,
      })),
    });
  },
};