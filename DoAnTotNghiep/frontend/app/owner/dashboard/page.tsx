"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Calendar, DollarSign, Clock, AlertCircle, ArrowLeft, ArrowRight, User, Star, TicketPercent } from 'lucide-react'

const revenueData = [
  { month: "T1", revenue: 12000000, bookings: 24 },
  { month: "T2", revenue: 15000000, bookings: 30 },
  { month: "T3", revenue: 18000000, bookings: 36 },
  { month: "T4", revenue: 16000000, bookings: 32 },
  { month: "T5", revenue: 20000000, bookings: 40 },
  { month: "T6", revenue: 22000000, bookings: 44 },
]

const bookingTrend = [
  { day: "T2", bookings: 8 },
  { day: "T3", bookings: 12 },
  { day: "T4", bookings: 10 },
  { day: "T5", bookings: 14 },
  { day: "T6", bookings: 18 },
  { day: "T7", bookings: 22 },
  { day: "CN", bookings: 16 },
]

export default function OwnerDashboard() {
  const stats = [
    { label: "Tổng Doanh Thu", value: "132,000,000 VND", icon: DollarSign, color: "text-green-600" },
    { label: "Tổng Đặt Sân", value: "206", icon: Calendar, color: "text-blue-600" },
    { label: "Sân Hoạt Động", value: "3", icon: TrendingUp, color: "text-purple-600" },
    { label: "Tổng Khách Hàng", value: "145", icon: Users, color: "text-orange-600" },
  ]

  const pendingBookings = [
    {
      id: 1,
      customerName: "Nguyễn Văn A",
      fieldName: "Sân Bóng Đá",
      date: "20/01/2025",
      time: "18:00",
      price: 1000000,
    },
    {
      id: 2,
      customerName: "Trần Thị B",
      fieldName: "Sân Bóng Rổ",
      date: "21/01/2025",
      time: "14:00",
      price: 400000,
    },
  ]

  const todaysSchedule = [
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
  ]

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

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Bảng Điều Khiển Chủ Sân</h1>
          <Link href="/owner/settings">
            <Button variant="outline" size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Cài Đặt
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {/* Pending Bookings Alert */}
        {pendingBookings.length > 0 && (
          <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <CardTitle className="text-orange-900 dark:text-orange-100">
                    Có {pendingBookings.length} đơn đặt sân chờ duyệt
                  </CardTitle>
                </div>
                <Button asChild size="sm" className="bg-orange-600 hover:bg-orange-700">
                  <Link href="/owner/bookings?filter=pending">
                    Xem Ngay
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingBookings.slice(0, 2).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 bg-white dark:bg-gray-900 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{booking.customerName}</p>
                        <p className="text-xs text-muted-foreground">
                          {booking.fieldName} • {booking.date} • {booking.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {booking.price.toLocaleString()} VND
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" />
                    +12% từ tháng trước
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Today's Schedule Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
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
                    {isCurrentBooking(booking.time) && (
                      <div className="absolute -left-1 top-1/2 -translate-y-1/2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-4">
                      {/* Time Section */}
                      <div className="flex items-center gap-3 min-w-[120px]">
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

                      {/* Field & Customer Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">{booking.fieldName}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <User className="w-3 h-3" />
                                <span>{booking.customerName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <span>📱 {booking.phone}</span>
                              </div>
                            </div>
                          </div>
                          <Badge className={getStatusColor(booking.status)} variant="outline">
                            {getStatusLabel(booking.status)}
                          </Badge>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center justify-between mt-3 pt-3 border-t">
                          <p className="font-semibold text-green-600">{booking.price.toLocaleString()} VND</p>

                          {booking.status === "pending" && (
                            <div className="flex items-center gap-2">
                              <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
                                Xem Chi Tiết
                              </Button>
                              <Button size="sm" className="h-7 text-xs bg-green-600 hover:bg-green-700">
                                Duyệt Ngay
                              </Button>
                            </div>
                          )}

                          {booking.status === "confirmed" && (
                            <Button size="sm" variant="outline" className="h-7 text-xs bg-transparent">
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

            {/* Summary Footer */}
            {todaysSchedule.length > 0 && (
              <div className="mt-6 pt-4 border-t flex items-center justify-between">
                <div className="flex items-center gap-6">
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
              </div>
            )}
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Xu Hướng Doanh Thu</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${(Number(value) / 1000000).toFixed(1)}M VND`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Doanh Thu" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Bookings Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Đặt Sân Theo Tuần</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" name="Đặt Sân" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/owner/fields">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Quản Lý Sân</h3>
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">Thêm, sửa hoặc xóa sân thể thao của bạn</p>
              <Button variant="outline" className="w-full bg-transparent">
                Xem Sân
              </Button>
            </Card>
          </Link>

          <Link href="/owner/bookings">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Quản Lý Đặt Sân</h3>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">Xem và quản lý đơn đặt sân của khách hàng</p>
              <Button variant="outline" className="w-full bg-transparent">
                Xem Đặt Sân
              </Button>
            </Card>
          </Link>

          <Link href="/owner/vouchers">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Quản Lý Voucher</h3>
                <TicketPercent className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-muted-foreground mb-4">Tạo mã giảm giá để thu hút khách hàng</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">3 đang dùng</Badge>
                <Badge variant="secondary" className="text-xs">291 lượt</Badge>
              </div>
            </Card>
          </Link>

          <Link href="/owner/reviews">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Đánh Giá</h3>
                <Star className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-muted-foreground mb-4">Xem và phản hồi đánh giá khách hàng</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold">4.8</span>
                </div>
                <Badge variant="destructive" className="text-xs">2 mới</Badge>
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
