"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { apiRequest } from "@/lib/api-client"
import { getStoredAccessToken, getStoredUser } from "@/features/auth/lib/auth-storage"

export type NotificationType = "BOOKING" | "PAYMENT" | "SYSTEM" | "PROMO" | string | null

export type Notification = {
  id: number
  user_id: number
  title: string
  message: string
  type: NotificationType
  read: boolean
  createdAt: Date
  link: string
}

type BackendNotification = {
  id: number
  user_id: number
  title: string | null
  body: string | null
  type: NotificationType
  is_read: boolean
  created_at: string
}

type NotificationsResponse = {
  success: boolean
  message: string
  data: BackendNotification[]
}

type MarkAsReadResponse = {
  success: boolean
  message: string
  data: BackendNotification
}

type MarkAllAsReadResponse = {
  success: boolean
  message: string
  data: unknown
}

function getNotificationTargetUrl(type: NotificationType, role?: string | null) {
  const normalizedRole = String(role || "").toUpperCase()

  if (normalizedRole === "OWNER") {
    switch (type) {
      case "BOOKING":
      case "PAYMENT":
        return "/owner/bookings"
      case "PROMO":
        return "/owner/vouchers"
      case "SYSTEM":
      default:
        return "/owner/dashboard"
    }
  }

  if (normalizedRole === "ADMIN") {
    switch (type) {
      case "BOOKING":
      case "PAYMENT":
        return "/admin/bookings"
      case "SYSTEM":
      default:
        return "/admin/dashboard"
    }
  }

  switch (type) {
    case "BOOKING":
    case "PAYMENT":
      return "/bookings"
    case "PROMO":
      return "/browse"
    case "SYSTEM":
    default:
      return "/notifications"
  }
}

function mapNotification(item: BackendNotification, role?: string | null): Notification {
  return {
    id: item.id,
    user_id: item.user_id,
    title: item.title || "Thông báo",
    message: item.body || "",
    type: item.type,
    read: Boolean(item.is_read),
    createdAt: item.created_at ? new Date(item.created_at) : new Date(),
    link: getNotificationTargetUrl(item.type, role),
  }
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const unreadCount = useMemo(
    () => notifications.filter((item) => !item.read).length,
    [notifications],
  )

  const fetchNotifications = useCallback(async () => {
    const token = getStoredAccessToken()
    const user = getStoredUser()

    if (!token || !user) {
      setNotifications([])
      return
    }

    try {
      setIsLoading(true)

      const result = await apiRequest<NotificationsResponse>("/notifications/me", {
        method: "GET",
        requireAuth: true,
      })

      setNotifications((result.data || []).map((item) => mapNotification(item, user.role)))
    } catch (error) {
      console.error("[FETCH_NOTIFICATIONS_ERROR]", error)
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  const markAsRead = useCallback(async (id: number) => {
    try {
      setNotifications((prev) =>
        prev.map((item) => (item.id === id ? { ...item, read: true } : item)),
      )

      await apiRequest<MarkAsReadResponse>(`/notifications/${id}/read`, {
        method: "PATCH",
        requireAuth: true,
      })
    } catch (error) {
      console.error("[MARK_NOTIFICATION_READ_ERROR]", error)
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })))

      await apiRequest<MarkAllAsReadResponse>("/notifications/read-all", {
        method: "PATCH",
        requireAuth: true,
      })
    } catch (error) {
      console.error("[MARK_ALL_NOTIFICATIONS_READ_ERROR]", error)
      await fetchNotifications()
    }
  }, [fetchNotifications])

  const deleteNotification = useCallback((id: number) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  useEffect(() => {
    fetchNotifications()

    const handleSync = () => {
      fetchNotifications()
    }

    window.addEventListener("storage", handleSync)
    window.addEventListener("focus", handleSync)

    const interval = window.setInterval(() => {
      fetchNotifications()
    }, 30000)

    return () => {
      window.removeEventListener("storage", handleSync)
      window.removeEventListener("focus", handleSync)
      window.clearInterval(interval)
    }
  }, [fetchNotifications])

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
  }
}