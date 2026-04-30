"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  Star,
  TicketPercent,
  User,
  Users,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  approveOwnerBooking,
  getOwnerDashboardSummary,
  getRecentOwnerBookings,
  getRecentOwnerNotifications,
  rejectOwnerBooking,
  type OwnerDashboardBooking,
  type OwnerDashboardSummary,
  type OwnerNotification,
} from "@/features/owners/services/owner-dashboard"

const emptySummary: OwnerDashboardSummary = {
  total_fields: 0,
  pending_bookings: 0,
  total_bookings_this_month: 0,
  total_revenue_this_month: 0,
}

function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value || 0)

  if (!Number.isFinite(amount)) return "0 VND"

  return `${amount.toLocaleString("vi-VN")} VND`
}

function formatShortCurrency(value: string | number | null | undefined) {
  const amount = Number(value || 0)

  if (!Number.isFinite(amount)) return "0"

  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toFixed(1)}B`
  }

  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`
  }

  if (amount >= 1_000) {
    return `${Math.round(amount / 1_000)}K`
  }

  return amount.toString()
}

function formatDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "--"

  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "--:--"

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getDurationHours(start: string, end: string) {
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return 0
  }

  const diffMs = endDate.getTime() - startDate.getTime()

  return Math.max(diffMs / (1000 * 60 * 60), 0)
}

function getCustomerName(booking: OwnerDashboardBooking) {
  return (
    booking.contact_name ||
    booking.users?.name ||
    booking.contact_phone ||
    "Khách hàng"
  )
}

function getCustomerPhone(booking: OwnerDashboardBooking) {
  return booking.contact_phone || booking.users?.phone || "Chưa có SĐT"
}

function getFieldName(booking: OwnerDashboardBooking) {
  return booking.fields?.field_name || `Sân #${booking.field_id}`
}

function getFieldAddress(booking: OwnerDashboardBooking) {
  return booking.fields?.address || "Chưa có địa chỉ"
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING_CONFIRM":
      return "Chờ duyệt"
    case "APPROVED":
      return "Đã duyệt"
    case "AWAITING_PAYMENT":
      return "Chờ thanh toán"
    case "PAID":
      return "Đã thanh toán"
    case "CHECKED_IN":
      return "Đã check-in"
    case "COMPLETED":
      return "Hoàn thành"
    case "REJECTED":
      return "Đã từ chối"
    case "CANCELLED":
      return "Đã hủy"
    case "PAY_FAILED":
      return "Thanh toán lỗi"
    case "PAYMENT_EXPIRED":
      return "Hết hạn thanh toán"
    default:
      return status
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case "PENDING_CONFIRM":
      return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900"
    case "APPROVED":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900"
    case "AWAITING_PAYMENT":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-900"
    case "PAID":
    case "CHECKED_IN":
    case "COMPLETED":
      return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
    case "REJECTED":
    case "CANCELLED":
    case "PAY_FAILED":
    case "PAYMENT_EXPIRED":
      return "bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-900"
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900"
  }
}

function getNotificationTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function OwnerDashboard() {
  const [summary, setSummary] = useState<OwnerDashboardSummary>(emptySummary)
  const [recentBookings, setRecentBookings] = useState<OwnerDashboardBooking[]>([])
  const [notifications, setNotifications] = useState<OwnerNotification[]>([])
  const [selectedBooking, setSelectedBooking] =
    useState<OwnerDashboardBooking | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [error, setError] = useState("")

  async function fetchDashboard() {
    try {
      setIsLoading(true)
      setError("")

      const [summaryResult, bookingsResult, notificationsResult] =
        await Promise.all([
          getOwnerDashboardSummary(),
          getRecentOwnerBookings(),
          getRecentOwnerNotifications(),
        ])

      setSummary(summaryResult.data || emptySummary)
      setRecentBookings(bookingsResult.data || [])
      setNotifications(notificationsResult.data || [])
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu dashboard owner",
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboard()
  }, [])

  const pendingBookings = useMemo(
    () =>
      recentBookings.filter(
        (booking) => booking.status === "PENDING_CONFIRM",
      ),
    [recentBookings],
  )

  const expectedRevenue = useMemo(
    () =>
      recentBookings
        .filter((booking) =>
          ["APPROVED", "AWAITING_PAYMENT", "PAID", "CHECKED_IN", "COMPLETED"].includes(
            booking.status,
          ),
        )
        .reduce((sum, booking) => sum + Number(booking.total_price || 0), 0),
    [recentBookings],
  )

  const todayBookings = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10)

    return recentBookings.filter((booking) => {
      const date = new Date(booking.start_datetime)

      if (Number.isNaN(date.getTime())) return false

      return date.toISOString().slice(0, 10) === today
    })
  }, [recentBookings])

  const displayBookings =
    todayBookings.length > 0 ? todayBookings : recentBookings

  const handleViewDetail = (booking: OwnerDashboardBooking) => {
    setSelectedBooking(booking)
    setShowDetailDialog(true)
  }

  const handleApproveBooking = async (bookingId: number) => {
    try {
      setActionLoadingId(bookingId)
      setError("")

      await approveOwnerBooking(bookingId)

      setShowDetailDialog(false)
      setSelectedBooking(null)
      await fetchDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Duyệt booking thất bại")
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleRejectBooking = async (bookingId: number) => {
    try {
      setActionLoadingId(bookingId)
      setError("")

      await rejectOwnerBooking(bookingId, "Rejected from owner dashboard")

      setShowDetailDialog(false)
      setSelectedBooking(null)
      await fetchDashboard()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Từ chối booking thất bại")
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              Trang chủ / Dashboard
            </p>
            <h1 className="text-3xl font-bold">Bảng Điều Khiển Chủ Sân</h1>
            <p className="text-muted-foreground mt-1">
              Tổng quan hoạt động kinh doanh và đơn đặt sân của bạn
            </p>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4 text-sm text-red-600">
              {error}
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Đang tải dữ liệu dashboard...
            </CardContent>
          </Card>
        ) : (
          <>
            {pendingBookings.length > 0 && (
              <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                    <AlertCircle className="w-5 h-5" />
                    Có {pendingBookings.length} đơn đặt sân chờ duyệt
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingBookings.slice(0, 2).map((booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg bg-background p-3 border border-orange-100 dark:border-orange-900"
                    >
                      <div>
                        <p className="font-medium">
                          {getCustomerName(booking)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {getFieldName(booking)} •{" "}
                          {formatDate(booking.start_datetime)} •{" "}
                          {formatTime(booking.start_datetime)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-green-600">
                          {formatCurrency(booking.total_price)}
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleViewDetail(booking)}
                        >
                          Xem Ngay
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/owner/reports" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <Badge variant="outline" className="text-green-600">
                        Tháng này
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mt-3">
                      {formatShortCurrency(summary.total_revenue_this_month)} VND
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tổng Doanh Thu
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/owner/bookings" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <Badge variant="outline" className="text-blue-600">
                        Tháng này
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mt-3">
                      {summary.total_bookings_this_month}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tổng Đặt Sân
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/owner/fields" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-purple-600" />
                      </div>
                      <Badge variant="outline" className="text-purple-600">
                        Đang quản lý
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mt-3">
                      {summary.total_fields}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Sân Hoạt Động
                    </p>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/owner/bookings" className="block">
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-orange-600" />
                      </div>
                      <Badge variant="outline" className="text-orange-600">
                        Cần xử lý
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold mt-3">
                      {summary.pending_bookings}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Đơn Chờ Duyệt
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {todayBookings.length > 0
                        ? "Lịch Hôm Nay"
                        : "Đơn Đặt Sân Gần Đây"}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date().toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  <Link href="/owner/schedule">
                    <Button variant="outline" size="sm">
                      Xem Toàn Bộ Lịch
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardHeader>

                <CardContent className="space-y-3">
                  {displayBookings.length === 0 ? (
                    <div className="text-center py-10 text-muted-foreground">
                      Không có đặt sân nào
                    </div>
                  ) : (
                    displayBookings.map((booking) => {
                      const duration = getDurationHours(
                        booking.start_datetime,
                        booking.end_datetime,
                      )

                      return (
                        <div
                          key={booking.id}
                          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 rounded-lg border border-border p-4 hover:bg-muted/40 transition"
                        >
                          <div className="flex gap-4">
                            <div className="text-center min-w-[72px]">
                              <p className="text-lg font-bold">
                                {formatTime(booking.start_datetime)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatTime(booking.end_datetime)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {duration > 0 ? `${duration.toFixed(0)}h` : "--"}
                              </p>
                            </div>

                            <div className="space-y-1">
                              <p className="font-semibold">
                                {getFieldName(booking)}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <User className="w-4 h-4" />
                                {getCustomerName(booking)}
                              </p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {getCustomerPhone(booking)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(booking.start_datetime)}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                            <Badge className={getStatusColor(booking.status)}>
                              {getStatusLabel(booking.status)}
                            </Badge>

                            <p className="font-semibold text-green-600 min-w-[120px] text-right">
                              {formatCurrency(booking.total_price)}
                            </p>

                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetail(booking)}
                              >
                                Chi Tiết
                              </Button>

                              {booking.status === "PENDING_CONFIRM" && (
                                <Button
                                  size="sm"
                                  disabled={actionLoadingId === booking.id}
                                  onClick={() => handleApproveBooking(booking.id)}
                                >
                                  Duyệt Ngay
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}

                  {displayBookings.length > 0 && (
                    <div className="grid grid-cols-3 gap-4 border-t border-border pt-4 mt-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Tổng đơn hiển thị
                        </p>
                        <p className="text-xl font-bold">
                          {displayBookings.length}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Doanh thu dự kiến
                        </p>
                        <p className="text-xl font-bold text-green-600">
                          {formatShortCurrency(expectedRevenue)} VND
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-muted-foreground">
                          Chờ duyệt
                        </p>
                        <p className="text-xl font-bold text-orange-600">
                          {pendingBookings.length}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Thông Báo Gần Đây</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Chưa có thông báo mới.
                      </p>
                    ) : (
                      notifications.map((item) => (
                        <div
                          key={item.id}
                          className="rounded-lg border border-border p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-medium text-sm">{item.title}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.message}
                              </p>
                            </div>

                            {!item.is_read && (
                              <span className="w-2 h-2 rounded-full bg-primary mt-1" />
                            )}
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            {getNotificationTime(item.created_at)}
                          </p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Thao Tác Nhanh</CardTitle>
                  </CardHeader>

                  <CardContent className="grid gap-3">
                    <Link href="/owner/fields">
                      <Button variant="outline" className="w-full justify-start">
                        <MapPin className="w-4 h-4 mr-2" />
                        Quản Lý Sân
                      </Button>
                    </Link>

                    <Link href="/owner/bookings">
                      <Button variant="outline" className="w-full justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Quản Lý Đặt Sân
                      </Button>
                    </Link>

                    <Link href="/owner/reports">
                      <Button variant="outline" className="w-full justify-start">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Báo Cáo & Thống Kê
                      </Button>
                    </Link>

                    <Link href="/owner/vouchers">
                      <Button variant="outline" className="w-full justify-start">
                        <TicketPercent className="w-4 h-4 mr-2" />
                        Voucher
                      </Button>
                    </Link>

                    <Link href="/owner/reviews">
                      <Button variant="outline" className="w-full justify-start">
                        <Star className="w-4 h-4 mr-2" />
                        Đánh Giá
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="sm:max-w-[540px]">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đặt Sân</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về đơn đặt sân
            </DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <h3 className="font-semibold">
                  {getFieldName(selectedBooking)}
                </h3>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {getFieldAddress(selectedBooking)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatTime(selectedBooking.start_datetime)} -{" "}
                  {formatTime(selectedBooking.end_datetime)} (
                  {getDurationHours(
                    selectedBooking.start_datetime,
                    selectedBooking.end_datetime,
                  ).toFixed(0)}
                  h)
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(selectedBooking.start_datetime)}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Thông tin khách hàng</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {getCustomerName(selectedBooking)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    {getCustomerPhone(selectedBooking)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Tổng tiền</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(selectedBooking.total_price)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <span className="text-muted-foreground">Trạng thái</span>
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {getStatusLabel(selectedBooking.status)}
                </Badge>
              </div>

              {selectedBooking.requested_payment_method && (
                <div className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-muted-foreground">Thanh toán</span>
                  <span className="font-medium">
                    {selectedBooking.requested_payment_method === "BANK_TRANSFER"
                      ? "Chuyển khoản"
                      : "Tại sân"}
                  </span>
                </div>
              )}

              {selectedBooking.notes && (
                <div className="rounded-lg border border-border p-3">
                  <p className="text-sm text-muted-foreground mb-1">Ghi chú</p>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedBooking?.status === "PENDING_CONFIRM" ? (
              <div className="flex w-full gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  disabled={actionLoadingId === selectedBooking.id}
                  onClick={() => handleRejectBooking(selectedBooking.id)}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ Chối
                </Button>

                <Button
                  className="flex-1"
                  disabled={actionLoadingId === selectedBooking.id}
                  onClick={() => handleApproveBooking(selectedBooking.id)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Duyệt Đơn
                </Button>
              </div>
            ) : (
              <Button
                className="w-full"
                onClick={() => setShowDetailDialog(false)}
              >
                Đóng
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}