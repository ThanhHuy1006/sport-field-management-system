"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, LogOut, Settings, Shield, Users, ArrowLeft, Camera } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function AdminProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [profileData, setProfileData] = useState({
    fullName: "Admin HCMUT",
    email: "admin@hcmut.edu.vn",
    phone: "+84 999 999 999",
    role: "Super Admin",
    department: "IT Department",
    employeeId: "ADMIN001",
    city: "Thành phố Hồ Chí Minh",
    country: "Việt Nam",
    joinDate: "2024-01-01",
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
    { label: "Tổng Users", value: "1,234" },
    { label: "Pending Approvals", value: "8" },
    { label: "Active Fields", value: "156" },
    { label: "Today Bookings", value: "89" },
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
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại Dashboard
          </Link>
          <h1 className="text-xl font-bold">Hồ Sơ Quản Trị Viên</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <nav className="space-y-2">
                <Link href="/admin/profile">
                  <button className="w-full text-left px-4 py-2 rounded-lg bg-primary text-white font-medium">
                    <User className="w-4 h-4 inline mr-2" />
                    Hồ Sơ
                  </button>
                </Link>
                <Link href="/admin/users">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Users className="w-4 h-4 inline mr-2" />
                    Quản Lý Users
                  </button>
                </Link>
                <Link href="/admin/approvals">
                  <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Phê Duyệt
                  </button>
                </Link>
                <Link href="/admin/settings">
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
                <Badge variant="secondary" className="mt-2">
                  {profileData.role}
                </Badge>
                <p className="text-muted-foreground mt-1">{profileData.department}</p>
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
                      <label className="text-sm text-muted-foreground">Mã Nhân Viên</label>
                      <p className="text-lg font-medium text-foreground">{profileData.employeeId}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Vai Trò</label>
                      <p className="text-lg font-medium text-foreground">{profileData.role}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Phòng Ban</label>
                      <p className="text-lg font-medium text-foreground">{profileData.department}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Quốc Gia</label>
                      <p className="text-lg font-medium text-foreground">{profileData.country}</p>
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
                      <label className="block text-sm font-medium text-foreground mb-2">Mã Nhân Viên</label>
                      <Input name="employeeId" value={editData.employeeId} onChange={handleChange} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Vai Trò</label>
                      <Input name="role" value={editData.role} onChange={handleChange} disabled />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Phòng Ban</label>
                      <Input name="department" value={editData.department} onChange={handleChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Quốc Gia</label>
                      <Input name="country" value={editData.country} onChange={handleChange} />
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

            <Card className="p-8">
              <h3 className="text-xl font-bold mb-4">Quyền Hạn Quản Trị</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">User Management</p>
                    <p className="text-sm text-muted-foreground">Full access</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Approvals</p>
                    <p className="text-sm text-muted-foreground">Full access</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">System Settings</p>
                    <p className="text-sm text-muted-foreground">Full access</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border border-border rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Analytics</p>
                    <p className="text-sm text-muted-foreground">Read & Write</p>
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
