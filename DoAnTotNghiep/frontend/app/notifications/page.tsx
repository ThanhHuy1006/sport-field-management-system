"use client"

import { useState } from "react"
import Link from "next/link"
import { useNotifications, type NotificationType } from "@/hooks/use-notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Trash2,
  Settings,
  ArrowLeft,
  Filter,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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
  return new Date(date).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const getNotificationIcon = (type: NotificationType) => {
  switch (type) {
    case "reminder":
      return <Clock className="h-5 w-5 text-amber-500" />
    case "booking_approved":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "booking_rejected":
    case "booking_cancelled":
      return <AlertCircle className="h-5 w-5 text-red-500" />
    case "payment_confirmed":
      return <DollarSign className="h-5 w-5 text-green-500" />
    case "reschedule_request":
      return <Calendar className="h-5 w-5 text-blue-500" />
    case "promotion":
      return <Tag className="h-5 w-5 text-purple-500" />
    case "slot_available":
      return <MapPin className="h-5 w-5 text-cyan-500" />
    case "new_booking":
      return <UserPlus className="h-5 w-5 text-blue-500" />
    case "review":
      return <Star className="h-5 w-5 text-yellow-500" />
    case "system":
      return <Info className="h-5 w-5 text-gray-500" />
    default:
      return <Bell className="h-5 w-5 text-gray-500" />
  }
}

const getNotificationTypeLabel = (type: NotificationType) => {
  switch (type) {
    case "reminder":
      return "Nhắc nhở"
    case "booking_approved":
      return "Đã duyệt"
    case "booking_rejected":
      return "Từ chối"
    case "booking_cancelled":
      return "Đã hủy"
    case "payment_confirmed":
      return "Thanh toán"
    case "reschedule_request":
      return "Đổi lịch"
    case "promotion":
      return "Khuyến mãi"
    case "slot_available":
      return "Slot trống"
    case "new_booking":
      return "Đơn mới"
    case "review":
      return "Đánh giá"
    case "system":
      return "Hệ thống"
    default:
      return "Khác"
  }
}

const getTypeBadgeColor = (type: NotificationType) => {
  switch (type) {
    case "reminder":
      return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
    case "booking_approved":
    case "payment_confirmed":
      return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
    case "booking_rejected":
    case "booking_cancelled":
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    case "reschedule_request":
    case "new_booking":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
    case "promotion":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    case "slot_available":
      return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400"
    case "review":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
  }
}

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, deleteNotification, clearAll, unreadCount } = useNotifications()
  const [activeTab, setActiveTab] = useState("all")
  const [filterType, setFilterType] = useState<NotificationType | "all">("all")

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "unread" && n.read) return false
    if (filterType !== "all" && n.type !== filterType) return false
    return true
  })

  const notificationTypes: NotificationType[] = [
    "reminder",
    "booking_approved",
    "booking_rejected",
    "payment_confirmed",
    "reschedule_request",
    "promotion",
    "slot_available",
    "new_booking",
    "review",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Thông báo</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} thông báo chưa đọc` : "Không có thông báo mới"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/notifications/settings">
                <Settings className="h-4 w-4 mr-2" />
                Cài đặt
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10">
                  <Bell className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{notifications.length}</p>
                  <p className="text-xs text-muted-foreground">Tổng thông báo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-blue-500/10">
                  <Clock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{unreadCount}</p>
                  <p className="text-xs text-muted-foreground">Chưa đọc</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-purple-500/10">
                  <Tag className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {notifications.filter((n) => n.type === "promotion").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Khuyến mãi</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-amber-500/10">
                  <Calendar className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {notifications.filter((n) => n.type === "reminder").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Nhắc nhở</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
                <TabsList>
                  <TabsTrigger value="all">Tất cả</TabsTrigger>
                  <TabsTrigger value="unread" className="relative">
                    Chưa đọc
                    {unreadCount > 0 && (
                      <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">
                        {unreadCount}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      {filterType === "all" ? "Tất cả loại" : getNotificationTypeLabel(filterType)}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType("all")}>Tất cả loại</DropdownMenuItem>
                    {notificationTypes.map((type) => (
                      <DropdownMenuItem key={type} onClick={() => setFilterType(type)}>
                        {getNotificationTypeLabel(type)}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    <CheckCheck className="h-4 w-4 mr-2" />
                    Đánh dấu đã đọc
                  </Button>
                )}

                {notifications.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Xóa tất cả
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Bell className="h-12 w-12 text-muted-foreground mb-4 opacity-40" />
                <p className="text-muted-foreground">Không có thông báo nào</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 transition-colors hover:bg-accent cursor-pointer ${!notification.read ? "bg-primary/5" : ""}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 p-2.5 rounded-full bg-muted">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3
                                className={`text-sm text-foreground ${!notification.read ? "font-semibold" : "font-medium"}`}
                              >
                                {notification.title}
                              </h3>
                              {!notification.read && <div className="h-2 w-2 rounded-full bg-primary" />}
                            </div>
                            <p className="text-sm text-muted-foreground">{notification.message}</p>

                            {/* Extra data */}
                            {notification.data?.voucherCode && (
                              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-md">
                                <Tag className="h-3.5 w-3.5 text-primary" />
                                <span className="text-sm font-mono font-semibold text-primary">
                                  {notification.data.voucherCode}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center gap-3 mt-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getTypeBadgeColor(notification.type)}`}
                              >
                                {getNotificationTypeLabel(notification.type)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {notification.link && (
                          <div className="mt-3">
                            <Button variant="outline" size="sm" asChild>
                              <Link href={notification.link}>Xem chi tiết</Link>
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
