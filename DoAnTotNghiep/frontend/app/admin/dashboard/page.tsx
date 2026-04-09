"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  CalendarDays,
  Star,
  TrendingUp,
  BarChart3,
} from "lucide-react"

export default function AdminDashboard() {
  const flaggedReviewsCount = 3
  const pendingOwnersCount = 3
  const pendingFieldsCount = 2

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bảng Điều Khiển</h1>
        <p className="text-muted-foreground">Tổng quan hệ thống quản lý sân thể thao</p>
      </div>

      {/* Alerts */}
      <div className="flex flex-col gap-4 mb-8">
        <Link href="/admin/users">
          <Card className="p-4 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition cursor-pointer dark:bg-yellow-950/20 dark:border-yellow-800">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900 dark:text-yellow-300">Chủ sân chờ phê duyệt</p>
                <p className="text-sm text-yellow-800 dark:text-yellow-400">
                  {pendingOwnersCount} chủ sân đang chờ phê duyệt
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-yellow-900 dark:text-yellow-300">
                Xem Ngay
              </Button>
            </div>
          </Card>
        </Link>

        <Link href="/admin/fields">
          <Card className="p-4 bg-blue-50 border-blue-200 hover:bg-blue-100 transition cursor-pointer dark:bg-blue-950/20 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-500" />
              <div className="flex-1">
                <p className="font-medium text-blue-900 dark:text-blue-300">Sân chờ phê duyệt</p>
                <p className="text-sm text-blue-800 dark:text-blue-400">{pendingFieldsCount} sân đang chờ phê duyệt</p>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-900 dark:text-blue-300">
                Xem Ngay
              </Button>
            </div>
          </Card>
        </Link>

        {flaggedReviewsCount > 0 && (
          <Link href="/admin/reviews">
            <Card className="p-4 bg-red-50 border-red-200 hover:bg-red-100 transition cursor-pointer dark:bg-red-950/20 dark:border-red-800">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                <div className="flex-1">
                  <p className="font-medium text-red-900 dark:text-red-300">Đánh Giá Bị Báo Cáo</p>
                  <p className="text-sm text-red-800 dark:text-red-400">
                    {flaggedReviewsCount} đánh giá cần được xem xét
                  </p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-900 dark:text-red-300">
                  Kiểm Tra
                </Button>
              </div>
            </Card>
          </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Link href="/admin/users">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Tổng Người Dùng</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">2,450</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +12% so với tháng trước
            </p>
          </Card>
        </Link>

        <Link href="/admin/fields">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Sân Hoạt Động</h3>
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">156</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +8% so với tháng trước
            </p>
          </Card>
        </Link>

        <Link href="/admin/schedule">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Tổng Đặt Sân</h3>
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">8,234</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +15% so với tháng trước
            </p>
          </Card>
        </Link>

        <Link href="/admin/reports">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Doanh Thu</h3>
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">2.5 tỷ</p>
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> +18% so với tháng trước
            </p>
          </Card>
        </Link>

        <Link href="/admin/reviews">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Đánh Giá TB</h3>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-foreground">4.3</p>
            <p className="text-xs text-muted-foreground mt-1">Trên tổng 1,256 đánh giá</p>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <h2 className="text-lg font-bold mb-4">Truy Cập Nhanh</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Link href="/admin/schedule" className="block h-full">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer border-2 border-primary/20 h-full flex flex-col">
            <CalendarDays className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Quản Lý Đặt Sân</h3>
            <p className="text-sm text-muted-foreground flex-1">Xem lịch và danh sách đặt sân</p>
          </Card>
        </Link>

        <Link href="/admin/users" className="block h-full">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
            <Users className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Quản Lý User</h3>
            <p className="text-sm text-muted-foreground flex-1">Xem, phê duyệt và quản lý user</p>
          </Card>
        </Link>

        <Link href="/admin/fields" className="block h-full">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
            <MapPin className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Quản Lý Sân</h3>
            <p className="text-sm text-muted-foreground flex-1">Phê duyệt và quản lý sân</p>
          </Card>
        </Link>

        <Link href="/admin/reviews" className="block h-full">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
            <Star className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Kiểm Duyệt Review</h3>
            <p className="text-sm text-muted-foreground flex-1">Xử lý đánh giá báo cáo</p>
          </Card>
        </Link>

        <Link href="/admin/reports" className="block h-full">
          <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
            <BarChart3 className="w-8 h-8 text-primary mb-3" />
            <h3 className="font-bold mb-2">Báo Cáo & Thống Kê</h3>
            <p className="text-sm text-muted-foreground flex-1">Xem báo cáo chi tiết</p>
          </Card>
        </Link>
      </div>
    </div>
  )
}
