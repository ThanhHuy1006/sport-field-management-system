"use client"

import type React from "react"
import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera } from "lucide-react"
import { getImageUrl } from "@/lib/image-url"
import {
  getMyOwnerProfile,
  updateMyOwnerProfile,
  uploadOwnerAvatar,
  type OwnerProfileData,
} from "@/features/owners/services/owner-profile.service"

type ProfileViewModel = {
  fullName: string
  email: string
  phone: string
  businessName: string
  taxCode: string
  businessAddress: string
  ownerStatus: string
  joinDate: string
  avatar: string
}

const EMPTY_PROFILE: ProfileViewModel = {
  fullName: "",
  email: "",
  phone: "",
  businessName: "",
  taxCode: "",
  businessAddress: "",
  ownerStatus: "",
  joinDate: "",
  avatar: "",
}

function mapOwnerProfileToViewModel(data: OwnerProfileData): ProfileViewModel {
  return {
    fullName: data.name || "",
    email: data.email || "",
    phone: data.phone || "",
    businessName: data.owner_profile?.business_name || "",
    taxCode: data.owner_profile?.tax_code || "",
    businessAddress: data.owner_profile?.address || "",
    ownerStatus: data.owner_profile?.status || "",
    joinDate: data.owner_profile?.created_at || data.created_at || "",
    avatar: data.avatar_url || "",
  }
}

function getOwnerStatusLabel(status: string) {
  switch (status) {
    case "approved":
      return "Đã duyệt"
    case "pending":
      return "Chờ duyệt"
    case "rejected":
      return "Bị từ chối"
    default:
      return "Chưa xác định"
  }
}

export default function OwnerProfilePage() {
  const avatarInputRef = useRef<HTMLInputElement | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [profileData, setProfileData] = useState<ProfileViewModel>(EMPTY_PROFILE)
  const [editData, setEditData] = useState<ProfileViewModel>(EMPTY_PROFILE)

  const avatarSrc = useMemo(() => {
    return profileData.avatar ? getImageUrl(profileData.avatar) : "/placeholder.svg"
  }, [profileData.avatar])

  const getInitials = (name: string) => {
    const safeName = name || "Owner"

    return safeName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const fetchProfile = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await getMyOwnerProfile()
      const mappedProfile = mapOwnerProfileToViewModel(res.data)

      setProfileData(mappedProfile)
      setEditData(mappedProfile)
    } catch (err) {
      console.error(err)
      setError("Không thể tải hồ sơ chủ sân")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const res = await updateMyOwnerProfile({
        name: editData.fullName,
        phone: editData.phone,
      })

      const mappedProfile = mapOwnerProfileToViewModel(res.data)

      setProfileData(mappedProfile)
      setEditData(mappedProfile)
      setIsEditing(false)
    } catch (err) {
      console.error(err)
      setError("Cập nhật hồ sơ thất bại")
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarClick = () => {
    avatarInputRef.current?.click()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]

    if (!file) return

    setUploadingAvatar(true)
    setError(null)

    try {
      const uploaded = await uploadOwnerAvatar(file)

      const updated = await updateMyOwnerProfile({
        avatar_url: uploaded.data.url,
      })

      const mappedProfile = mapOwnerProfileToViewModel(updated.data)

      setProfileData(mappedProfile)
      setEditData(mappedProfile)
    } catch (err) {
      console.error(err)
      setError("Upload ảnh đại diện thất bại")
    } finally {
      setUploadingAvatar(false)
      e.target.value = ""
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <header className="bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <h1 className="text-xl font-bold">Hồ Sơ Chủ Sân</h1>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8">
            <p className="text-muted-foreground">Đang tải hồ sơ...</p>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/owner/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Hồ sơ</span>
          </div>
          <h1 className="text-xl font-bold">Hồ Sơ Chủ Sân</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <Card className="p-4 mb-6 border-destructive/40 bg-destructive/5">
            <p className="text-sm text-destructive">{error}</p>
          </Card>
        )}

        <Card className="p-8 mb-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <Avatar className="h-32 w-32">
                <AvatarImage src={avatarSrc} alt={profileData.fullName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {getInitials(profileData.fullName)}
                </AvatarFallback>
              </Avatar>

              <input
                ref={avatarInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />

              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 shadow-lg hover:bg-primary/90 transition disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
              </button>
            </div>

            <h2 className="text-2xl font-bold mt-4">
              {profileData.fullName || "Chủ sân"}
            </h2>
            <p className="text-muted-foreground">
              {profileData.businessName || "Chưa có tên doanh nghiệp"}
            </p>

            <div className="mt-3 rounded-full border px-3 py-1 text-sm text-muted-foreground">
              Trạng thái hồ sơ:{" "}
              <span className="font-medium text-foreground">
                {getOwnerStatusLabel(profileData.ownerStatus)}
              </span>
            </div>
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
                  <p className="text-lg font-medium text-foreground">
                    {profileData.fullName || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Email</label>
                  <p className="text-lg font-medium text-foreground">
                    {profileData.email || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Số Điện Thoại</label>
                  <p className="text-lg font-medium text-foreground">
                    {profileData.phone || "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="text-sm text-muted-foreground">Thành Viên Từ</label>
                  <p className="text-lg font-medium text-foreground">
                    {profileData.joinDate
                      ? new Date(profileData.joinDate).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="border-t border-border pt-6 mt-6">
                <h3 className="text-xl font-bold mb-4">Thông Tin Doanh Nghiệp</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-muted-foreground">Tên Doanh Nghiệp</label>
                    <p className="text-lg font-medium text-foreground">
                      {profileData.businessName || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Mã Số Thuế</label>
                    <p className="text-lg font-medium text-foreground">
                      {profileData.taxCode || "Chưa cập nhật"}
                    </p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-sm text-muted-foreground">Địa Chỉ Doanh Nghiệp</label>
                    <p className="text-lg font-medium text-foreground">
                      {profileData.businessAddress || "Chưa cập nhật"}
                    </p>
                  </div>
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
                  <Input name="fullName" value={editData.fullName} onChange={handleChange} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <Input type="email" value={editData.email} disabled />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Số Điện Thoại
                  </label>
                  <Input name="phone" value={editData.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h3 className="text-lg font-bold mb-4">Thông Tin Doanh Nghiệp</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Tên Doanh Nghiệp
                    </label>
                    <Input value={editData.businessName} disabled />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Mã Số Thuế
                    </label>
                    <Input value={editData.taxCode} disabled />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Địa Chỉ Doanh Nghiệp
                    </label>
                    <Input value={editData.businessAddress} disabled />
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mt-3">
                  Thông tin doanh nghiệp đã được admin duyệt nên không chỉnh sửa trực tiếp tại đây.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setEditData(profileData)
                    setIsEditing(false)
                  }}
                  className="flex-1"
                  disabled={saving}
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </main>
  )
}