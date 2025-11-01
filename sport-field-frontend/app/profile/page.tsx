"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { User, LogOut, Settings, Heart, Clock, ArrowLeft } from "lucide-react"

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 123 456 789",
    address: "123 Đường Thể Thao, Quận 1, TP.HCM",
    city: "Thành phố Hồ Chí Minh",
    country: "Việt Nam",
    joinDate: "2024-06-15",
  })

  const [editData, setEditData] = useState(profileData)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = () => {
    setProfileData(editData)
    setIsEditing(false)
  }

  const stats = [
    { label: "Tổng Đặt Sân", value: "24" },
    { label: "Sắp Tới", value: "3" },
    { label: "Hoàn Thành", value: "21" },
    { label: "Yêu Thích", value: "8" },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Hồ Sơ Của Tôi</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                <Link href="/profile">
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-primary text-white font-medium">
                    <User className="w-4 h-4 inline mr-2" />
                    Hồ Sơ
                  </button>
                </Link>
                <Link href="/bookings">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Clock className="w-4 h-4 inline mr-2" />
                    Lịch Đặt Sân
                  </button>
                </Link>
                <Link href="/wishlist">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Heart className="w-4 h-4 inline mr-2" />
                    Yêu Thích
                  </button>
                </Link>
                <Link href="/settings">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Settings className="w-4 h-4 inline mr-2" />
                    Cài Đặt
                  </button>
                </Link>
                <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Đăng Xuất
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>

            {/* Profile Information */}
            <Card className="p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Thông Tin Cá Nhân</h2>
                {!isEditing && (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Chỉnh Sửa
                  </Button>
                )}
              </div>

              {!isEditing ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm text-muted-foreground">Họ Tên</label>
                      <p className="text-lg font-medium text-foreground">{profileData.fullName}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-lg font-medium text-foreground">{profileData.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Số Điện Thoại</label>
                      <p className="text-lg font-medium text-foreground">{profileData.phone}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Quốc Gia</label>
                      <p className="text-lg font-medium text-foreground">{profileData.country}</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">Địa Chỉ</label>
                      <p className="text-lg font-medium text-foreground">{profileData.address}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Thành Viên Từ</label>
                      <p className="text-lg font-medium text-foreground">
                        {new Date(profileData.joinDate).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Họ Tên</label>
                      <Input name="fullName" value={editData.fullName} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                      <Input type="email" name="email" value={editData.email} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Số Điện Thoại</label>
                      <Input name="phone" value={editData.phone} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Quốc Gia</label>
                      <Input name="country" value={editData.country} onChange={handleChange} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ</label>
                      <Input name="address" value={editData.address} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button onClick={handleSave} className="flex-1">
                      Lưu Thay Đổi
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditData(profileData)
                        setIsEditing(false)
                      }}
                      className="flex-1"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Payment Methods */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Phương Thức Thanh Toán</h2>
                <Button>Thêm Phương Thức</Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Thẻ Visa</p>
                    <p className="text-sm text-muted-foreground">**** **** **** 4242</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                      Xóa
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Chuyển Khoản Ngân Hàng</p>
                    <p className="text-sm text-muted-foreground">Vietcombank - Tài khoản kết thúc 5678</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
