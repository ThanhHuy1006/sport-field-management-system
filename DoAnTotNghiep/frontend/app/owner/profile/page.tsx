"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, Building2, Calendar, ArrowLeft, Camera } from "lucide-react"

export default function OwnerProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "Trần Văn B",
    email: "tranvanb@example.com",
    phone: "+84 987 654 321",
    businessName: "Sân Thể Thao ABC",
    taxCode: "0123456789",
    businessAddress: "456 Đường Lý Thường Kiệt, Quận 10, TP.HCM",
    city: "Thành phố Hồ Chí Minh",
    country: "Việt Nam",
    joinDate: "2024-05-10",
    avatar: "/placeholder.svg",
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
    { label: "Tổng Sân", value: "5" },
    { label: "Đặt Sân Hôm Nay", value: "12" },
    { label: "Doanh Thu Tháng", value: "45.8M" },
    { label: "Đánh Giá TB", value: "4.8" },
  ]

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại Dashboard
          </Link>
          <h1 className="text-xl font-bold">Hồ Sơ Chủ Sân</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                <Link href="/owner/profile">
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-primary text-white font-medium">
                    <User className="w-4 h-4 inline mr-2" />
                    Hồ Sơ
                  </button>
                </Link>
                <Link href="/owner/fields">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Building2 className="w-4 h-4 inline mr-2" />
                    Quản Lý Sân
                  </button>
                </Link>
                <Link href="/owner/bookings">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Đặt Sân
                  </button>
                </Link>
                <Link href="/owner/settings">
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

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </Card>
              ))}
            </div>

            <Card className="p-8 mb-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={profileData.avatar || "/placeholder.svg"} alt={profileData.fullName} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {getInitials(profileData.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <button className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition">
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold mt-4">{profileData.fullName}</h2>
                <p className="text-muted-foreground">{profileData.businessName}</p>
              </div>

              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Thông Tin Cá Nhân</h3>
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
                  </div>

                  <div className="border-t border-border pt-6 mt-6">
                    <h3 className="text-xl font-bold mb-4">Thông Tin Doanh Nghiệp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm text-muted-foreground">Tên Doanh Nghiệp</label>
                        <p className="text-lg font-medium text-foreground">{profileData.businessName}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Mã Số Thuế</label>
                        <p className="text-lg font-medium text-foreground">{profileData.taxCode}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-muted-foreground">Địa Chỉ Doanh Nghiệp</label>
                        <p className="text-lg font-medium text-foreground">{profileData.businessAddress}</p>
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground">Thành Viên Từ</label>
                        <p className="text-lg font-medium text-foreground">
                          {new Date(profileData.joinDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
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
                  </div>

                  <div className="border-t border-border pt-4 mt-4">
                    <h3 className="text-lg font-bold mb-4">Thông Tin Doanh Nghiệp</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Tên Doanh Nghiệp</label>
                        <Input name="businessName" value={editData.businessName} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-2">Mã Số Thuế</label>
                        <Input name="taxCode" value={editData.taxCode} onChange={handleChange} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Doanh Nghiệp</label>
                        <Input name="businessAddress" value={editData.businessAddress} onChange={handleChange} />
                      </div>
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
          </div>
        </div>
      </div>
    </main>
  )
}
