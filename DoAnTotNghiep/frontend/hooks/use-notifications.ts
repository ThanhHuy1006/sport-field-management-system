"use client"

import { useState } from "react"

export type NotificationType =
  | "reminder" // Nhắc nhở trước giờ đặt
  | "booking_approved" // Đơn được duyệt
  | "booking_rejected" // Đơn bị từ chối
  | "booking_cancelled" // Đơn bị hủy
  | "payment_confirmed" // Thanh toán xác nhận
  | "reschedule_request" // Yêu cầu đổi lịch
  | "promotion" // Khuyến mãi
  | "slot_available" // Slot trống (sân yêu thích)
  | "new_booking" // Đơn mới (cho owner)
  | "review" // Đánh giá mới
  | "system" // Thông báo hệ thống

export type Notification = {
  id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: Date
  link?: string
  data?: {
    bookingId?: number
    bookingRef?: string
    fieldId?: number
    fieldName?: string
    oldDate?: string
    oldTime?: string
    newDate?: string
    newTime?: string
    discount?: number
    voucherCode?: string
    customerName?: string
    rating?: number
  }
}

// Mock notifications cho customer
const customerNotifications: Notification[] = [
  {
    id: "c1",
    title: "Nhắc nhở: Sắp đến giờ đặt sân",
    message: "Bạn có lịch đặt sân Bóng Đá Mini 1 vào lúc 18:00 hôm nay. Hãy đến đúng giờ nhé!",
    type: "reminder",
    read: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 phút trước
    link: "/bookings",
    data: {
      bookingRef: "BK-2025-001250",
      fieldName: "Sân Bóng Đá Mini 1",
    },
  },
  {
    id: "c2",
    title: "Đơn đặt sân đã được duyệt",
    message: "Chủ sân đã xác nhận đơn đặt sân Tennis Pro của bạn vào 15/01. Vui lòng hoàn tất thanh toán.",
    type: "booking_approved",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    link: "/bookings",
    data: {
      bookingRef: "BK-2025-001249",
      fieldName: "Sân Tennis Pro",
    },
  },
  {
    id: "c3",
    title: "Khuyến mãi cuối tuần!",
    message: "Giảm 20% cho tất cả sân bóng đá vào Thứ 7 và Chủ Nhật. Sử dụng mã WEEKEND20",
    type: "promotion",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
    data: {
      discount: 20,
      voucherCode: "WEEKEND20",
    },
  },
  {
    id: "c4",
    title: "Sân yêu thích có slot trống",
    message: "Sân Cầu Lông A vừa có slot trống vào 19:00 ngày mai. Đặt ngay trước khi hết!",
    type: "slot_available",
    read: false,
    createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
    link: "/booking/3",
    data: {
      fieldId: 3,
      fieldName: "Sân Cầu Lông A",
    },
  },
  {
    id: "c5",
    title: "Thanh toán thành công",
    message: "Thanh toán 400.000đ cho Sân Bóng Rổ Arena đã được xác nhận.",
    type: "payment_confirmed",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    link: "/bookings",
    data: {
      bookingRef: "BK-2025-001248",
      fieldName: "Sân Bóng Rổ Arena",
    },
  },
  {
    id: "c6",
    title: "Yêu cầu đổi lịch được duyệt",
    message: "Chủ sân đã đồng ý đổi lịch từ 18/01 sang 20/01 cho Sân Tennis Elite.",
    type: "reschedule_request",
    read: true,
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
    link: "/bookings",
    data: {
      bookingRef: "BK-2025-001245",
      fieldName: "Sân Tennis Elite",
      oldDate: "2025-01-18",
      newDate: "2025-01-20",
    },
  },
  {
    id: "c7",
    title: "Đơn đặt sân bị từ chối",
    message: "Rất tiếc, đơn đặt sân Volleyball Court đã bị từ chối. Lý do: Sân đang bảo trì.",
    type: "booking_rejected",
    read: true,
    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
    link: "/bookings",
    data: {
      bookingRef: "BK-2025-001240",
      fieldName: "Volleyball Court",
    },
  },
  {
    id: "c8",
    title: "Flash Sale hôm nay!",
    message: "Chỉ trong hôm nay: Giảm 30% tất cả sân cầu lông từ 6:00-8:00 sáng. Mã: MORNING30",
    type: "promotion",
    read: true,
    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
    data: {
      discount: 30,
      voucherCode: "MORNING30",
    },
  },
]

// Mock notifications cho owner
const ownerNotifications: Notification[] = [
  {
    id: "o1",
    title: "Đơn đặt sân mới",
    message: "Nguyễn Văn A vừa đặt Sân Bóng Đá Mini 1 vào 18:00 ngày 12/01. Vui lòng xác nhận.",
    type: "new_booking",
    read: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000),
    link: "/owner/schedule",
    data: {
      bookingRef: "BK-2025-001251",
      fieldName: "Sân Bóng Đá Mini 1",
      customerName: "Nguyễn Văn A",
    },
  },
  {
    id: "o2",
    title: "Đơn đặt sân mới",
    message: "Trần Thị B vừa đặt Sân Tennis Pro vào 08:00 ngày 13/01.",
    type: "new_booking",
    read: false,
    createdAt: new Date(Date.now() - 45 * 60 * 1000),
    link: "/owner/schedule",
    data: {
      bookingRef: "BK-2025-001252",
      fieldName: "Sân Tennis Pro",
      customerName: "Trần Thị B",
    },
  },
  {
    id: "o3",
    title: "Yêu cầu đổi lịch",
    message: "Lê Văn C yêu cầu đổi lịch từ 14/01 sang 16/01 cho Sân Cầu Lông A.",
    type: "reschedule_request",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    link: "/owner/schedule",
    data: {
      bookingRef: "BK-2025-001248",
      fieldName: "Sân Cầu Lông A",
      customerName: "Lê Văn C",
      oldDate: "2025-01-14",
      newDate: "2025-01-16",
    },
  },
  {
    id: "o4",
    title: "Đánh giá mới",
    message: "Khách hàng Phạm Thị D đã đánh giá 5 sao cho Sân Bóng Đá Mini 2.",
    type: "review",
    read: true,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    link: "/owner/fields",
    data: {
      fieldName: "Sân Bóng Đá Mini 2",
      customerName: "Phạm Thị D",
      rating: 5,
    },
  },
  {
    id: "o5",
    title: "Nhắc nhở: Có đơn chờ duyệt",
    message: "Bạn có 3 đơn đặt sân đang chờ duyệt. Hãy xác nhận sớm để không làm khách chờ lâu.",
    type: "reminder",
    read: true,
    createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    link: "/owner/schedule",
  },
  {
    id: "o6",
    title: "Thanh toán đã nhận",
    message: "Đã nhận thanh toán 500.000đ từ Hoàng Văn E cho đơn BK-2025-001240.",
    type: "payment_confirmed",
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    data: {
      bookingRef: "BK-2025-001240",
      customerName: "Hoàng Văn E",
    },
  },
]

export function useNotifications(userRole: "customer" | "owner" | "admin" = "customer") {
  const initialNotifications = userRole === "owner" ? ownerNotifications : customerNotifications

  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    unreadCount,
  }
}
