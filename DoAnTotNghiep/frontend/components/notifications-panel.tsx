"use client"

import { useState } from "react"
import Link from "next/link"
import type { Notification, NotificationType } from "@/hooks/use-notifications"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  CheckCheck,
  Calendar,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Clock,
  Tag,
  MapPin,
  Star,
  UserPlus,
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
  onMarkAsRead: (id: string) => void
  onMarkAllAsRead: () => void
}

export function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
}: NotificationsPanelProps) {
  const [open, setOpen] = useState(false)

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "reminder":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "booking_approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "booking_rejected":
      case "booking_cancelled":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "payment_confirmed":
        return <DollarSign className="h-4 w-4 text-green-500" />
      case "reschedule_request":
        return <Calendar className="h-4 w-4 text-blue-500" />
      case "promotion":
        return <Tag className="h-4 w-4 text-purple-500" />
      case "slot_available":
        return <MapPin className="h-4 w-4 text-cyan-500" />
      case "new_booking":
        return <UserPlus className="h-4 w-4 text-blue-500" />
      case "review":
        return <Star className="h-4 w-4 text-yellow-500" />
      case "system":
        return <Info className="h-4 w-4 text-gray-500" />
      default:
        return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  const getNotificationBgColor = (type: NotificationType, read: boolean) => {
    if (read) return ""

    switch (type) {
      case "reminder":
        return "bg-amber-500/5"
      case "booking_approved":
      case "payment_confirmed":
        return "bg-green-500/5"
      case "booking_rejected":
      case "booking_cancelled":
        return "bg-red-500/5"
      case "reschedule_request":
      case "new_booking":
        return "bg-blue-500/5"
      case "promotion":
        return "bg-purple-500/5"
      case "slot_available":
        return "bg-cyan-500/5"
      case "review":
        return "bg-yellow-500/5"
      default:
        return "bg-muted/50"
    }
  }

  // Chỉ hiển thị 5 thông báo mới nhất
  const displayedNotifications = notifications.slice(0, 5)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative hover:bg-accent">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 min-w-[20px] flex items-center justify-center p-0 px-1 text-[10px] font-bold border-2 border-background"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[380px] p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Thông báo</h2>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllAsRead}
                className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
              >
                <CheckCheck className="h-3 w-3 mr-1" />
                Đánh dấu đã đọc
              </Button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="max-h-[400px] overflow-y-auto">
          {displayedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <Bell className="h-10 w-10 text-muted-foreground mb-3 opacity-40" />
              <p className="text-sm text-muted-foreground">Không có thông báo nào</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {displayedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => onMarkAsRead(notification.id)}
                  className={`px-4 py-3 cursor-pointer transition-colors hover:bg-accent ${getNotificationBgColor(notification.type, notification.read)}`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5 p-2 rounded-full bg-muted">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3
                          className={`text-sm text-foreground line-clamp-1 ${!notification.read ? "font-semibold" : "font-medium"}`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && <div className="flex-shrink-0 h-2 w-2 rounded-full bg-primary mt-1.5" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground/70 mt-1.5">{formatTimeAgo(notification.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm text-primary hover:text-primary/80"
              asChild
            >
              <Link href="/notifications" onClick={() => setOpen(false)}>
                Xem tất cả thông báo
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
