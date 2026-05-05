"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  User,
  LogOut,
  Settings,
  Heart,
  Clock,
  ArrowLeft,
  Camera,
} from "lucide-react"
import { getMe, updateMe, type Me } from "@/features/users/services/me"
import { uploadAvatar } from "@/features/uploads/services/upload-avatar"
import {
  clearAuthSession,
  getStoredAccessToken,
  getStoredUser,
} from "@/features/auth/lib/auth-storage"

type ProfileData = {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  joinDate: string
  avatar: string
}

const emptyProfile: ProfileData = {
  fullName: "",
  email: "",
  phone: "",
  address: "Chưa cập nhật",
  city: "Thành phố Hồ Chí Minh",
  country: "Việt Nam",
  joinDate: new Date().toISOString(),
  avatar: "/placeholder.svg",
}

function mapMeToProfile(user: Me): ProfileData {
  return {
    fullName: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    address: "Chưa cập nhật",
    city: "Thành phố Hồ Chí Minh",
    country: "Việt Nam",
    joinDate: user.created_at ?? new Date().toISOString(),
    avatar: user.avatar_url || "/placeholder.svg",
  }
}

function getApiOrigin() {
  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"

  return apiBaseUrl.replace(/\/api\/v1\/?$/, "")
}

function toAvatarSrc(url: string | null | undefined) {
  if (!url) return "/placeholder.svg"

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url
  }

  if (url.startsWith("/uploads/")) {
    return `${getApiOrigin()}${url}`
  }

  return url
}

function syncStoredUserProfile(user: Me) {
  if (typeof window === "undefined") return

  const possibleKeys = ["currentUser", "user"]

  for (const key of possibleKeys) {
    const raw = window.localStorage.getItem(key)
    if (!raw) continue

    try {
      const parsed = JSON.parse(raw)

      if (parsed && typeof parsed === "object") {
        window.localStorage.setItem(
          key,
          JSON.stringify({
            ...parsed,
            name: user.name,
            phone: user.phone,
            avatar_url: user.avatar_url,
          }),
        )
      }
    } catch {
      // Bỏ qua nếu localStorage không phải JSON user đơn giản.
    }
  }

  window.dispatchEvent(new Event("auth-changed"))
}

export default function ProfilePage() {
  const router = useRouter()
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [authChecked, setAuthChecked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [profileData, setProfileData] = useState<ProfileData>(emptyProfile)
  const [editData, setEditData] = useState<ProfileData>(emptyProfile)

  useEffect(() => {
    const token = getStoredAccessToken()
    const user = getStoredUser()
    const role = String(user?.role ?? "").toUpperCase()

    if (!token || !user) {
      router.replace("/login?redirect=/profile")
      return
    }

    if (role === "OWNER") {
      router.replace("/owner/dashboard")
      return
    }

    if (role === "ADMIN") {
      router.replace("/admin/dashboard")
      return
    }

    if (role !== "USER") {
      router.replace("/browse")
      return
    }

    setAuthChecked(true)
  }, [router])

  useEffect(() => {
    if (!authChecked) return

    let cancelled = false

    async function fetchProfile() {
      try {
        setIsLoading(true)
        setError("")

        const result = await getMe()
        if (cancelled) return

        const mapped = mapMeToProfile(result.data)
        setProfileData(mapped)
        setEditData(mapped)
      } catch (err) {
        if (cancelled) return

        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải thông tin cá nhân",
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchProfile()

    return () => {
      cancelled = true
    }
  }, [authChecked])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError("")
      setMessage("")

      const result = await updateMe({
        name: editData.fullName,
        phone: editData.phone || null,
      })

      syncStoredUserProfile(result.data)

      const mapped = mapMeToProfile(result.data)
      setProfileData(mapped)
      setEditData(mapped)
      setIsEditing(false)
      setMessage("Cập nhật thông tin cá nhân thành công")
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Cập nhật thông tin thất bại",
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleAvatarFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    e.target.value = ""

    if (!file) return

    try {
      setIsUploadingAvatar(true)
      setError("")
      setMessage("")

      const uploadResult = await uploadAvatar(file)
      const avatarUrl = uploadResult.data.file.url
      const updateResult = await updateMe({ avatar_url: avatarUrl })

      syncStoredUserProfile(updateResult.data)

      const mapped = mapMeToProfile(updateResult.data)
      setProfileData(mapped)
      setEditData(mapped)
      setMessage("Cập nhật ảnh đại diện thành công")
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Cập nhật ảnh đại diện thất bại",
      )
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleLogout = () => {
    if (typeof window === "undefined") return

    clearAuthSession()

    window.localStorage.removeItem("refreshToken")
    window.localStorage.removeItem("user")
    window.dispatchEvent(new Event("auth-changed"))

    router.replace("/login")
    router.refresh()
  }

  const stats = [
    { label: "Tổng Đặt Sân", value: "24" },
    { label: "Sắp Tới", value: "3" },
    { label: "Hoàn Thành", value: "21" },
    { label: "Yêu Thích", value: "8" },
  ]

  const getInitials = (name: string) => {
    return (name || "U")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  if (!authChecked) {
    return null
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">
            Đang tải thông tin cá nhân...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
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
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg hover:bg-muted transition text-foreground"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Đăng Xuất
                </button>
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {error && (
              <Card className="p-4 mb-6 border-destructive/40 bg-destructive/5 text-destructive">
                {error}
              </Card>
            )}

            {message && (
              <Card className="p-4 mb-6 border-green-500/40 bg-green-500/5 text-green-700">
                {message}
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, idx) => (
                <Card key={idx} className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </Card>
              ))}
            </div>

            {/* Profile Information */}
            <Card className="p-8 mb-8">
              <div className="flex flex-col items-center mb-8">
                <div className="relative group">
                  <Avatar className="h-32 w-32">
                    <AvatarImage
                      src={toAvatarSrc(profileData.avatar)}
                      alt={profileData.fullName}
                    />
                    <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                      {getInitials(profileData.fullName)}
                    </AvatarFallback>
                  </Avatar>
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    className="hidden"
                    onChange={handleAvatarFileChange}
                  />
                  <button
                    type="button"
                    disabled={isUploadingAvatar}
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition disabled:opacity-60"
                  >
                    <Camera className="h-4 w-4" />
                  </button>
                </div>
                <h2 className="text-2xl font-bold mt-4">
                  {profileData.fullName || "Người dùng"}
                </h2>
                <p className="text-muted-foreground">{profileData.email}</p>
                {isUploadingAvatar && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Đang cập nhật ảnh đại diện...
                  </p>
                )}
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
                      <label className="text-sm text-muted-foreground">
                        Họ Tên
                      </label>
                      <p className="text-lg font-medium text-foreground">
                        {profileData.fullName || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Email
                      </label>
                      <p className="text-lg font-medium text-foreground">
                        {profileData.email}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Số Điện Thoại
                      </label>
                      <p className="text-lg font-medium text-foreground">
                        {profileData.phone || "Chưa cập nhật"}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Quốc Gia
                      </label>
                      <p className="text-lg font-medium text-foreground">
                        {profileData.country}
                      </p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-sm text-muted-foreground">
                        Địa Chỉ
                      </label>
                      <p className="text-lg font-medium text-foreground">
                        {profileData.address}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Thành Viên Từ
                      </label>
                      <p className="text-lg font-medium text-foreground">
                        {new Date(profileData.joinDate).toLocaleDateString(
                          "vi-VN",
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Họ Tên
                      </label>
                      <Input
                        name="fullName"
                        value={editData.fullName}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        name="email"
                        value={editData.email}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Số Điện Thoại
                      </label>
                      <Input
                        name="phone"
                        value={editData.phone}
                        onChange={handleChange}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Quốc Gia
                      </label>
                      <Input
                        name="country"
                        value={editData.country}
                        disabled
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Địa Chỉ
                      </label>
                      <Input
                        name="address"
                        value={editData.address}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditData(profileData)
                        setIsEditing(false)
                        setError("")
                        setMessage("")
                      }}
                      disabled={isSaving}
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
                <h2 className="text-2xl font-bold">
                  Phương Thức Thanh Toán
                </h2>
                <Button>Thêm Phương Thức</Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">Thẻ Visa</p>
                    <p className="text-sm text-muted-foreground">
                      **** **** **** 4242
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive bg-transparent"
                    >
                      Xóa
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div>
                    <p className="font-medium text-foreground">
                      Chuyển Khoản Ngân Hàng
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Vietcombank - Tài khoản kết thúc 5678
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive bg-transparent"
                    >
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