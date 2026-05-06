// src/modules/notifications/__tests__/notifications.mapper.test.js

import { describe, it, expect } from "vitest";
import { toNotificationResponse } from "../notifications.mapper.js";

describe("notifications.mapper", () => {
  it("map đúng notification response", () => {
    const notification = {
      id: 1,
      user_id: 5,
      type: "BOOKING",
      title: "Đặt sân thành công",
      body: "Booking của bạn đã được tạo",
      is_read: false,
      created_at: new Date("2099-06-01T10:00:00"),
    };

    const result = toNotificationResponse(notification);

    expect(result).toEqual({
      id: 1,
      user_id: 5,
      type: "BOOKING",
      title: "Đặt sân thành công",
      body: "Booking của bạn đã được tạo",
      is_read: false,
      created_at: new Date("2099-06-01T10:00:00"),
    });
  });

  it("trả null nếu item là null", () => {
    expect(toNotificationResponse(null)).toBeNull();
  });

  it("ép is_read về boolean nếu dữ liệu là 0", () => {
    const result = toNotificationResponse({
      id: 1,
      user_id: 5,
      type: "SYSTEM",
      title: "Thông báo",
      body: "Nội dung",
      is_read: 0,
      created_at: new Date("2099-06-01T10:00:00"),
    });

    expect(result.is_read).toBe(false);
  });

  it("ép is_read về boolean nếu dữ liệu là 1", () => {
    const result = toNotificationResponse({
      id: 1,
      user_id: 5,
      type: "SYSTEM",
      title: "Thông báo",
      body: "Nội dung",
      is_read: 1,
      created_at: new Date("2099-06-01T10:00:00"),
    });

    expect(result.is_read).toBe(true);
  });

  it("map đúng notification đã đọc", () => {
    const result = toNotificationResponse({
      id: 2,
      user_id: 5,
      type: "PAYMENT",
      title: "Thanh toán thành công",
      body: "Bạn đã thanh toán thành công",
      is_read: true,
      created_at: new Date("2099-06-02T10:00:00"),
    });

    expect(result.type).toBe("PAYMENT");
    expect(result.is_read).toBe(true);
    expect(result.title).toBe("Thanh toán thành công");
  });
});