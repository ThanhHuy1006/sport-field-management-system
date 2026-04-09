"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Bell, Lock, Eye, Trash2 } from "lucide-react"

export default function SettingsPage() {
  const [notifications, setNotifications] = useState({
    bookingConfirmation: true,
    bookingReminder: true,
    promotions: false,
    reviews: true,
  })

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Cài Đặt</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Notification Settings */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Cài Đặt Thông Báo</h2>
          </div>

          <div className="space-y-4">
            {[
              {
                key: "bookingConfirmation",
                label: "Xác Nhận Đặt Sân",
                description: "Nhận thông báo khi đặt sân được xác nhận",
              },
              {
                key: "bookingReminder",
                label: "Nhắc Nhở Đặt Sân",
                description: "Nhận nhắc nhở trước khi đến giờ đặt sân",
              },
              {
                key: "promotions",
                label: "Khuyến Mãi & Ưu Đãi",
                description: "Nhận email khuyến mãi và ưu đãi đặc biệt",
              },
              { key: "reviews", label: "Yêu Cầu Đánh Giá", description: "Được yêu cầu đánh giá sân đã đặt" },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition"
              >
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() => handleNotificationChange(item.key as keyof typeof notifications)}
                  className="w-5 h-5"
                />
              </label>
            ))}
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Bảo Mật</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Đổi Mật Khẩu</p>
                <p className="text-sm text-muted-foreground">Cập nhật mật khẩu thường xuyên để bảo mật</p>
              </div>
              <Button variant="outline">Đổi</Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Xác Thực Hai Yếu Tố</p>
                <p className="text-sm text-muted-foreground">Thêm lớp bảo mật cho tài khoản</p>
              </div>
              <Button variant="outline">Bật</Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <p className="font-medium text-foreground">Phiên Đăng Nhập</p>
                <p className="text-sm text-muted-foreground">Quản lý các phiên đăng nhập đang hoạt động</p>
              </div>
              <Button variant="outline">Xem</Button>
            </div>
          </div>
        </Card>

        {/* Privacy Settings */}
        <Card className="p-8 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Quyền Riêng Tư</h2>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
              <div>
                <p className="font-medium text-foreground">Hồ Sơ Công Khai</p>
                <p className="text-sm text-muted-foreground">Cho phép người khác xem hồ sơ và đánh giá của bạn</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>

            <label className="flex items-center justify-between p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition">
              <div>
                <p className="font-medium text-foreground">Hiển Thị Lịch Sử Đặt Sân</p>
                <p className="text-sm text-muted-foreground">Hiển thị lịch sử đặt sân trên hồ sơ của bạn</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5" />
            </label>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="p-8 border-destructive/50 bg-destructive/5">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-destructive" />
            <h2 className="text-2xl font-bold text-destructive">Vùng Nguy Hiểm</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <p className="font-medium text-foreground">Xóa Tài Khoản</p>
                <p className="text-sm text-muted-foreground">Xóa vĩnh viễn tài khoản và tất cả dữ liệu</p>
              </div>
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10 bg-transparent"
              >
                Xóa
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </main>
  )
}
