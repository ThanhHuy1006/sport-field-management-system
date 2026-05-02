"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { Notification, NotificationType } from "@/hooks/use-notifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertCircle,
  CheckCircle,
  CreditCard,
  Tag,
  Info,
  ChevronRight,
} from "lucide-react"

const formatTimeAgo = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Vừa xong"
  if (minutes < 60) return `${minutes} phút trước`
  if (hours < 24) return `${hours} giờ trước`
  if (days < 7) return `${days} ngày trước`

  return new Date(date).toLocaleDateString("vi-VN")
}

type NotificationsPanelProps = {
  notifications: Notification[]
  unreadCount: number
  onMarkAsRead: (id: number) => void | Promise<void>
  onMarkAllAsRead: () => void | Promise<void>
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "PAYMENT":
        return <CreditCard className="h-4 w-4 text-green-500" />
      case "PROMO":
        return <Tag className="h-4 w-4 text-purple-500" />
      case "SYSTEM":
        return <Info className="h-4 w-4 text-orange-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBgColor = (type: NotificationType, read: boolean) => {
    if (read) return ""

    switch (type) {
      case "BOOKING":
        return "bg-blue-500/5"
      case "PAYMENT":
        return "bg-green-500/5"
      case "PROMO":
        return "bg-purple-500/5"
      case "SYSTEM":
        return "bg-orange-500/5"
      default:
        return "bg-muted/50"
    }
  }

  const getNotificationLabel = (type: NotificationType) => {
    switch (type) {
      case "BOOKING":
        return "Đặt sân"
      case "PAYMENT":
        return "Thanh toán"
      case "PROMO":
        return "Khuyến mãi"
      case "SYSTEM":
        return "Hệ thống"
      default:
        return "Thông báo"
    }
  }

  const handleNotificationClick = async (notification: Notification) => {
    await onMarkAsRead(notification.id)
    setOpen(false)

    if (notification.link) {
      router.push(notification.link)
    }
  }

  const handleMarkAllAsRead = async () => {
    await onMarkAllAsRead()
  }

  const displayedNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
          <Bell className="h-5 w-5" />

          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center border-2 border-background p-0 px-1 text-[10px] font-bold"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-[380px] p-0">
        <div className="sticky top-0 z-10 border-b bg-background p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Thông báo
            </h2>

            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
              >
                <CheckCheck className="mr-1 h-3 w-3" />
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-12">
              <Bell className="mb-3 h-10 w-10 text-muted-foreground opacity-40" />
              <p className="text-sm text-muted-foreground">
                Không có thông báo nào
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayedNotifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => handleNotificationClick(notification)}
                  className={`block w-full px-4 py-3 text-left transition-colors hover:bg-accent ${getNotificationBgColor(
                    notification.type,
                    notification.read,
                  )}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex-shrink-0 rounded-full bg-muted p-2">
                      {getNotificationIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`line-clamp-1 text-sm text-foreground ${
                            !notification.read ? "font-semibold" : "font-medium"
                          }`}
                        >
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />
                        )}
                      </div>

                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground/70">
                          {formatTimeAgo(notification.createdAt)}
                        </p>

                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                          {getNotificationLabel(notification.type)}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm text-primary hover:text-primary/80"
              asChild
            >
              <Link href="/notifications" onClick={() => setOpen(false)}>
                Xem tất cả thông báo
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}