"use client"

import { useState } from "react"
import Link from "next/link"
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
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Clock,
  AlertCircle,
  ArrowRight,
  User,
  Star,
  TicketPercent,
  Phone,
  MapPin,
  CheckCircle,
  XCircle,
  BarChart3,
} from "lucide-react"

export default function OwnerDashboard() {
  const [selectedBooking, setSelectedBooking] = useState<(typeof todaysSchedule)[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [todaysSchedule, setTodayBookings] = useState([
    {
      id: 1,
      time: "08:00",
      endTime: "09:00",
      fieldName: "Sân Bóng Đá Thảo Điền",
      customerName: "Nguyễn Văn A",
      phone: "0909123456",
      status: "confirmed",
      price: 1000000,
      duration: 1,
    },
    {
      id: 2,
      time: "10:00",
      endTime: "12:00",
      fieldName: "Sân Bóng Rổ Quận 7",
      customerName: "Trần Thị B",
      phone: "0912345678",
      status: "confirmed",
      price: 800000,
      duration: 2,
    },
    {
      id: 3,
      time: "14:00",
      endTime: "15:00",
      fieldName: "Sân Tennis Bình Thạnh",
      customerName: "Lê Văn C",
      phone: "0923456789",
      status: "pending",
      price: 600000,
      duration: 1,
    },
    {
      id: 4,
      time: "16:00",
      endTime: "18:00",
      fieldName: "Sân Bóng Đá Thảo Điền",
      customerName: "Phạm Thị D",
      phone: "0934567890",
      status: "confirmed",
      price: 2000000,
      duration: 2,
    },
    {
      id: 5,
      time: "19:00",
      endTime: "20:00",
      fieldName: "Sân Bóng Rổ Quận 7",
      customerName: "Hoàng Văn E",
      phone: "0945678901",
      status: "pending",
      price: 400000,
      duration: 1,
    },
  ])

  const currentTime = new Date()
  const currentHour = currentTime.getHours()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-900"
      case "pending":
        return "bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-900"
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-900"
      default:
        return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-950 dark:text-gray-400 dark:border-gray-900"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ duyệt"
      case "completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  const isCurrentBooking = (time: string) => {
    const bookingHour = Number.parseInt(time.split(":")[0])
    return currentHour === bookingHour
  }

  const handleViewDetail = (booking: (typeof todaysSchedule)[0]) => {
    setSelectedBooking(booking)
    setShowDetailDialog(true)
  }

  const handleApproveBooking = (bookingId: number) => {
    setTodayBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "confirmed" as const } : b)))
    setShowDetailDialog(false)
  }

  const handleRejectBooking = (bookingId: number) => {
    setTodayBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: "cancelled" as const } : b)))
    setShowDetailDialog(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link href="/" className="hover:text-primary">
                Trang chủ
              </Link>
              <span>/</span>
              <span className="text-foreground">Dashboard</span>
            </div>
            <h1 className="text-2xl font-bold">Bảng Điều Khiển Chủ Sân</h1>
            <p className="text-sm text-muted-foreground mt-1">Tổng quan hoạt động kinh doanh của bạn</p>
          </div>
          <Link href="/owner/settings">
            <Button variant="outline" size="sm">
              Cài Đặt
            </Button>
          </Link>
        </div>

        {/* Pending Bookings Alert */}
        {todaysSchedule.filter((b) => b.status === "pending").length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  <CardTitle className="text-orange-900 dark:text-orange-100">
                    Có {todaysSchedule.filter((b) => b.status === "pending").length} đơn đặt sân chờ duyệt
                  </CardTitle>
                </div>
                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/owner/schedule?status=pending">
                    Xem Ngay
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todaysSchedule
                  .filter((b) => b.status === "pending")
                  .slice(0, 2)
                  .map((booking) => (
                    <div
                      key={booking.id}
                      className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg border border-orange-100 dark:border-orange-900/50"
                    >
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-orange-500 dark:text-orange-400" />
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{booking.customerName}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-300">
                            {booking.fieldName} •{" "}
                            {new Date().toLocaleDateString("vi-VN", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}{" "}
                            • {booking.time}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-orange-600 dark:text-orange-400 border-orange-600 dark:border-orange-400 bg-orange-50 dark:bg-orange-950/50"
                      >
                        {booking.price.toLocaleString()} VND
                      </Badge>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid - Added clickable links to stats cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/owner/reports">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Doanh Thu</CardTitle>
                <DollarSign className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">132,000,000 VND</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +12% từ tháng trước
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/owner/schedule">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Đặt Sân</CardTitle>
                <Calendar className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">206</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +8% từ tháng trước
                </p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/owner/fields">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Sân Hoạt Động</CardTitle>
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground mt-1">Tất cả đang hoạt động</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/owner/reports?tab=customers">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Khách Hàng</CardTitle>
                <Users className="w-5 h-5 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl lg:text-2xl font-bold">145</div>
                <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3" />
                  +15% từ tháng trước
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Today's Schedule */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <CardTitle className="text-xl">Lịch Hôm Nay</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {new Date().toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/owner/schedule">
                  Xem Toàn Bộ Lịch
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {todaysSchedule.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Không có đặt sân nào hôm nay</p>
              </div>
            ) : (
              <div className="space-y-3">
                {todaysSchedule.map((booking) => (
                  <div
                    key={booking.id}
                    className={`relative p-4 rounded-lg border-2 transition-all ${
                      isCurrentBooking(booking.time)
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-lg"
                        : "border-border bg-card hover:shadow-md"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Clock
                          className={`w-5 h-5 ${isCurrentBooking(booking.time) ? "text-blue-600" : "text-muted-foreground"}`}
                        />
                        <div>
                          <p className={`font-bold ${isCurrentBooking(booking.time) ? "text-blue-600" : ""}`}>
                            {booking.time}
                          </p>
                          <p className="text-xs text-muted-foreground">{booking.duration}h</p>
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-sm">{booking.fieldName}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {booking.customerName}
                              </span>
                              <span>{booking.phone}</span>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)} variant="outline">
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <p className="font-semibold text-green-600">{booking.price.toLocaleString()} VND</p>
                          {booking.status === "pending" ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs bg-transparent"
                                onClick={() => handleViewDetail(booking)}
                              >
                                Xem Chi Tiết
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                onClick={() => handleApproveBooking(booking.id)}
                              >
                                Duyệt Ngay
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs bg-transparent"
                              onClick={() => handleViewDetail(booking)}
                            >
                              Chi Tiết
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {todaysSchedule.length > 0 && (
              <div className="mt-6 pt-4 border-t flex flex-wrap items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng đặt sân</p>
                  <p className="text-2xl font-bold">{todaysSchedule.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Doanh thu dự kiến</p>
                  <p className="text-2xl font-bold text-green-600">
                    {todaysSchedule
                      .filter((b) => b.status === "confirmed")
                      .reduce((sum, b) => sum + b.price, 0)
                      .toLocaleString()}{" "}
                    VND
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {todaysSchedule.filter((b) => b.status === "pending").length}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions - Added Reports link, reorganized grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/owner/fields" className="block h-full">
            <Card className="p-4 lg:p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm lg:text-base font-bold">Quản Lý Sân</h3>
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground mb-3 flex-1">
                Thêm, sửa, xóa sân và thiết lập giá
              </p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Xem Sân
              </Button>
            </Card>
          </Link>

          <Link href="/owner/schedule" className="block h-full">
            <Card className="p-4 lg:p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm lg:text-base font-bold">Quản Lý Đặt Sân</h3>
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground mb-3 flex-1">Xem lịch và duyệt đơn đặt sân</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Xem Lịch
              </Button>
            </Card>
          </Link>

          <Link href="/owner/reports" className="block h-full">
            <Card className="p-4 lg:p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm lg:text-base font-bold">Báo Cáo & Thống Kê</h3>
                <BarChart3 className="w-4 h-4 text-primary" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground mb-3 flex-1">Phân tích doanh thu, khách hàng</p>
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                Xem Báo Cáo
              </Button>
            </Card>
          </Link>

          <Link href="/owner/vouchers" className="block h-full">
            <Card className="p-4 lg:p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm lg:text-base font-bold">Voucher</h3>
                <TicketPercent className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground mb-3 flex-1">Tạo mã giảm giá</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  3 đang dùng
                </Badge>
              </div>
            </Card>
          </Link>

          <Link href="/owner/reviews" className="block h-full">
            <Card className="p-4 lg:p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm lg:text-base font-bold">Đánh Giá</h3>
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <p className="text-xs lg:text-sm text-muted-foreground mb-3 flex-1">Xem và phản hồi đánh giá</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">4.8</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  2 mới
                </Badge>
              </div>
            </Card>
          </Link>
        </div>

        {/* Booking Detail Dialog */}
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Chi Tiết Đặt Sân</DialogTitle>
              <DialogDescription>Thông tin chi tiết về đơn đặt sân</DialogDescription>
            </DialogHeader>
            {selectedBooking && (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{selectedBooking.fieldName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {selectedBooking.time} - {selectedBooking.endTime} ({selectedBooking.duration}h)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {new Date().toLocaleDateString("vi-VN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-3">
                  <h4 className="font-medium">Thông tin khách hàng</h4>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedBooking.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <span className="font-medium">Tổng tiền</span>
                  <span className="text-xl font-bold text-green-600">{selectedBooking.price.toLocaleString()} VND</span>
                </div>

                <Badge className={`${getStatusColor(selectedBooking.status)} w-full justify-center py-2`}>
                  {getStatusLabel(selectedBooking.status)}
                </Badge>
              </div>
            )}
            <DialogFooter>
              {selectedBooking?.status === "pending" ? (
                <div className="flex gap-2 w-full">
                  <Button
                    variant="outline"
                    className="flex-1 bg-transparent"
                    onClick={() => handleRejectBooking(selectedBooking.id)}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Từ Chối
                  </Button>
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApproveBooking(selectedBooking.id)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Duyệt Đơn
                  </Button>
                </div>
              ) : (
                <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="w-full">
                  Đóng
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  )
}
