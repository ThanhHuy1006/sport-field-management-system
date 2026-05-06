// src/modules/notifications/__tests__/notifications.service.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../notifications.repository.js", () => ({
  notificationsRepository: {
    findMyNotifications: vi.fn(),
    countMyUnreadNotifications: vi.fn(),
    createNotification: vi.fn(),
    findMyNotificationById: vi.fn(),
    markAsRead: vi.fn(),
    markAllAsRead: vi.fn(),
    deleteMyNotification: vi.fn(),
    findAllActiveUsers: vi.fn(),
    createManyNotifications: vi.fn(),
  },
}));

import { notificationsService } from "../notifications.service.js";
import { notificationsRepository } from "../notifications.repository.js";

describe("notifications.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getMyNotifications", () => {
    it("trả về danh sách thông báo của user", async () => {
      notificationsRepository.findMyNotifications.mockResolvedValue([
        {
          id: 1,
          user_id: 5,
          title: "Thông báo 1",
        },
        {
          id: 2,
          user_id: 5,
          title: "Thông báo 2",
        },
      ]);

      const result = await notificationsService.getMyNotifications(5);

      expect(notificationsRepository.findMyNotifications).toHaveBeenCalledWith(
        5,
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("getMyUnreadCount", () => {
    it("trả về số lượng thông báo chưa đọc", async () => {
      notificationsRepository.countMyUnreadNotifications.mockResolvedValue(3);

      const result = await notificationsService.getMyUnreadCount(5);

      expect(
        notificationsRepository.countMyUnreadNotifications,
      ).toHaveBeenCalledWith(5);

      expect(result).toEqual({
        unread_count: 3,
      });
    });
  });

  describe("createNotification", () => {
    it("trả null nếu không có user_id", async () => {
      const result = await notificationsService.createNotification({
        title: "Thông báo",
        body: "Nội dung thông báo",
        type: "SYSTEM",
      });

      expect(result).toBeNull();
      expect(notificationsRepository.createNotification).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu thiếu title", async () => {
      await expect(
        notificationsService.createNotification({
          user_id: 5,
          body: "Nội dung thông báo",
          type: "SYSTEM",
        }),
      ).rejects.toThrow("title và body là bắt buộc");

      expect(notificationsRepository.createNotification).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu thiếu body", async () => {
      await expect(
        notificationsService.createNotification({
          user_id: 5,
          title: "Thông báo",
          type: "SYSTEM",
        }),
      ).rejects.toThrow("title và body là bắt buộc");

      expect(notificationsRepository.createNotification).not.toHaveBeenCalled();
    });

    it("tạo notification với type truyền vào", async () => {
      notificationsRepository.createNotification.mockResolvedValue({
        id: 1,
        user_id: 5,
        title: "Đặt sân thành công",
        body: "Booking của bạn đã được tạo",
        type: "BOOKING",
      });

      const result = await notificationsService.createNotification({
        user_id: "5",
        title: "Đặt sân thành công",
        body: "Booking của bạn đã được tạo",
        type: "BOOKING",
      });

      expect(notificationsRepository.createNotification).toHaveBeenCalledWith({
        user_id: 5,
        title: "Đặt sân thành công",
        body: "Booking của bạn đã được tạo",
        type: "BOOKING",
      });

      expect(result.id).toBe(1);
      expect(result.type).toBe("BOOKING");
    });

    it("mặc định type là SYSTEM nếu không truyền type", async () => {
      notificationsRepository.createNotification.mockResolvedValue({
        id: 1,
        user_id: 5,
        title: "Thông báo",
        body: "Nội dung",
        type: "SYSTEM",
      });

      const result = await notificationsService.createNotification({
        user_id: 5,
        title: "Thông báo",
        body: "Nội dung",
      });

      expect(notificationsRepository.createNotification).toHaveBeenCalledWith({
        user_id: 5,
        title: "Thông báo",
        body: "Nội dung",
        type: "SYSTEM",
      });

      expect(result.type).toBe("SYSTEM");
    });
  });

  describe("markAsRead", () => {
    it("báo lỗi nếu không tìm thấy notification của user", async () => {
      notificationsRepository.findMyNotificationById.mockResolvedValue(null);

      await expect(notificationsService.markAsRead(5, 999)).rejects.toThrow(
        "Không tìm thấy notification",
      );

      expect(notificationsRepository.markAsRead).not.toHaveBeenCalled();
    });

    it("trả về item hiện tại nếu notification đã đọc", async () => {
      notificationsRepository.findMyNotificationById.mockResolvedValue({
        id: 1,
        user_id: 5,
        is_read: true,
      });

      const result = await notificationsService.markAsRead(5, 1);

      expect(notificationsRepository.findMyNotificationById).toHaveBeenCalledWith(
        5,
        1,
      );

      expect(notificationsRepository.markAsRead).not.toHaveBeenCalled();

      expect(result).toEqual({
        id: 1,
        user_id: 5,
        is_read: true,
      });
    });

    it("đánh dấu notification chưa đọc thành đã đọc", async () => {
      notificationsRepository.findMyNotificationById.mockResolvedValue({
        id: 1,
        user_id: 5,
        is_read: false,
      });

      notificationsRepository.markAsRead.mockResolvedValue({
        id: 1,
        user_id: 5,
        is_read: true,
      });

      const result = await notificationsService.markAsRead(5, 1);

      expect(notificationsRepository.markAsRead).toHaveBeenCalledWith(1);
      expect(result.is_read).toBe(true);
    });
  });

  describe("markAllAsRead", () => {
    it("đánh dấu tất cả notification của user là đã đọc", async () => {
      notificationsRepository.markAllAsRead.mockResolvedValue({
        count: 3,
      });

      const result = await notificationsService.markAllAsRead(5);

      expect(notificationsRepository.markAllAsRead).toHaveBeenCalledWith(5);
      expect(result).toBe(true);
    });
  });

  describe("deleteMyNotification", () => {
    it("báo lỗi nếu không tìm thấy notification khi xóa", async () => {
      notificationsRepository.findMyNotificationById.mockResolvedValue(null);

      await expect(
        notificationsService.deleteMyNotification(5, 999),
      ).rejects.toThrow("Không tìm thấy notification");

      expect(notificationsRepository.deleteMyNotification).not.toHaveBeenCalled();
    });

    it("xóa notification của user thành công", async () => {
      notificationsRepository.findMyNotificationById.mockResolvedValue({
        id: 1,
        user_id: 5,
      });

      notificationsRepository.deleteMyNotification.mockResolvedValue({
        id: 1,
        user_id: 5,
        deleted: true,
      });

      const result = await notificationsService.deleteMyNotification(5, 1);

      expect(notificationsRepository.findMyNotificationById).toHaveBeenCalledWith(
        5,
        1,
      );

      expect(notificationsRepository.deleteMyNotification).toHaveBeenCalledWith(
        1,
      );

      expect(result.deleted).toBe(true);
    });
  });

  describe("broadcastNotification", () => {
    it("báo lỗi nếu không có user active để gửi thông báo", async () => {
      notificationsRepository.findAllActiveUsers.mockResolvedValue([]);

      await expect(
        notificationsService.broadcastNotification({
          title: "Thông báo",
          body: "Nội dung",
          type: "SYSTEM",
        }),
      ).rejects.toThrow("Không có user active để gửi thông báo");

      expect(
        notificationsRepository.createManyNotifications,
      ).not.toHaveBeenCalled();
    });

    it("gửi broadcast notification cho tất cả user active", async () => {
      const users = [
        {
          id: 1,
          email: "user1@gmail.com",
        },
        {
          id: 2,
          email: "user2@gmail.com",
        },
      ];

      const payload = {
        title: "Thông báo hệ thống",
        body: "Hệ thống bảo trì lúc 22h",
        type: "SYSTEM",
      };

      notificationsRepository.findAllActiveUsers.mockResolvedValue(users);
      notificationsRepository.createManyNotifications.mockResolvedValue({
        count: 2,
      });

      const result = await notificationsService.broadcastNotification(payload);

      expect(notificationsRepository.findAllActiveUsers).toHaveBeenCalled();

      expect(
        notificationsRepository.createManyNotifications,
      ).toHaveBeenCalledWith(users, payload);

      expect(result).toEqual({
        sent_count: 2,
        title: "Thông báo hệ thống",
        body: "Hệ thống bảo trì lúc 22h",
        type: "SYSTEM",
      });
    });
  });
});