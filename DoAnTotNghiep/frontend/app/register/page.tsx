"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { User, Mail, Lock, Phone, ArrowLeft, Building2, FileText, Upload, Award as IdCard } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "customer",
    agreeTerms: false,
    businessName: "",
    taxCode: "",
    businessAddress: "",
    businessPhone: "",
    businessLicense: null as File | null,
    idCardFront: null as File | null,
    idCardBack: null as File | null,
  })

  const [filePreview, setFilePreview] = useState({
    businessLicense: "",
    idCardFront: "",
    idCardBack: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({ ...prev, [fieldName]: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setFilePreview((prev) => ({ ...prev, [fieldName]: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.userType === "owner") {
      console.log("Field Owner registration submitted - Status: pending_approval")
      // In real app: save to database with status: 'pending_approval'
      // Redirect to pending page
      window.location.href = "/owner/pending"
    } else {
      console.log("Customer registration:", formData)
      // Regular customer registration
      window.location.href = "/login"
    }
  }

  const isFieldOwner = formData.userType === "owner"

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80 mb-8">
          <ArrowLeft className="w-4 h-4" />
          Về Trang Chủ
        </Link>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={64} height={64} className="object-contain" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Tạo Tài Khoản</h1>
            <p className="text-muted-foreground mt-2">Tham gia Hệ Thống Quản Lý Sân Thể Thao HCMUT</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-6">
            {/* User Type Selection */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Tôi là</label>
              <select
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
              >
                <option value="customer">Khách Hàng (Đặt Sân)</option>
                <option value="owner">Chủ Sân (Quản Lý Sân)</option>
              </select>
              {isFieldOwner && (
                <p className="text-sm text-amber-600 dark:text-amber-400 mt-2 flex items-start gap-2">
                  <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Tài khoản chủ sân cần xác nhận từ admin trước khi sử dụng</span>
                </p>
              )}
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground border-b pb-2">Thông Tin Cá Nhân</h3>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Họ và Tên</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="text"
                    name="fullName"
                    placeholder="Nguyễn Văn A"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Số Điện Thoại</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="tel"
                    name="phone"
                    placeholder="+84 123 456 789"
                    value={formData.phone}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Mật Khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Xác Nhận Mật Khẩu</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    name="confirmPassword"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            {isFieldOwner && (
              <div className="space-y-4 border-t pt-6">
                <h3 className="text-lg font-semibold text-foreground border-b pb-2">Thông Tin Doanh Nghiệp</h3>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Tên Doanh Nghiệp / Cơ Sở</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="businessName"
                      placeholder="Công ty TNHH ABC"
                      value={formData.businessName}
                      onChange={handleChange}
                      className="pl-10"
                      required={isFieldOwner}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Mã Số Thuế</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      name="taxCode"
                      placeholder="0123456789"
                      value={formData.taxCode}
                      onChange={handleChange}
                      className="pl-10"
                      required={isFieldOwner}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Kinh Doanh</label>
                  <Input
                    type="text"
                    name="businessAddress"
                    placeholder="268 Lý Thường Kiệt, Phường 14, Quận 10, TP.HCM"
                    value={formData.businessAddress}
                    onChange={handleChange}
                    required={isFieldOwner}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Số Điện Thoại Liên Hệ</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="tel"
                      name="businessPhone"
                      placeholder="+84 123 456 789"
                      value={formData.businessPhone}
                      onChange={handleChange}
                      className="pl-10"
                      required={isFieldOwner}
                    />
                  </div>
                </div>

                <div className="space-y-4 border-t pt-6">
                  <h3 className="text-lg font-semibold text-foreground border-b pb-2">Giấy Tờ Cần Thiết</h3>

                  {/* Business License */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Giấy Phép Kinh Doanh <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "businessLicense")}
                        className="hidden"
                        id="businessLicense"
                        required={isFieldOwner}
                      />
                      <label htmlFor="businessLicense" className="cursor-pointer flex flex-col items-center gap-2">
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formData.businessLicense
                            ? formData.businessLicense.name
                            : "Click để tải lên (PDF, JPG, PNG)"}
                        </span>
                      </label>
                      {filePreview.businessLicense && (
                        <img
                          src={filePreview.businessLicense || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-4 max-h-32 mx-auto rounded"
                        />
                      )}
                    </div>
                  </div>

                  {/* ID Card Front */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CMND/CCCD (Mặt Trước) <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "idCardFront")}
                        className="hidden"
                        id="idCardFront"
                        required={isFieldOwner}
                      />
                      <label htmlFor="idCardFront" className="cursor-pointer flex flex-col items-center gap-2">
                        <IdCard className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formData.idCardFront ? formData.idCardFront.name : "Click để tải lên (JPG, PNG)"}
                        </span>
                      </label>
                      {filePreview.idCardFront && (
                        <img
                          src={filePreview.idCardFront || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-4 max-h-32 mx-auto rounded"
                        />
                      )}
                    </div>
                  </div>

                  {/* ID Card Back */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      CMND/CCCD (Mặt Sau) <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-4 hover:border-primary transition">
                      <input
                        type="file"
                        accept=".jpg,.jpeg,.png"
                        onChange={(e) => handleFileChange(e, "idCardBack")}
                        className="hidden"
                        id="idCardBack"
                        required={isFieldOwner}
                      />
                      <label htmlFor="idCardBack" className="cursor-pointer flex flex-col items-center gap-2">
                        <IdCard className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          {formData.idCardBack ? formData.idCardBack.name : "Click để tải lên (JPG, PNG)"}
                        </span>
                      </label>
                      {filePreview.idCardBack && (
                        <img
                          src={filePreview.idCardBack || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-4 max-h-32 mx-auto rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="agreeTerms"
                checked={formData.agreeTerms}
                onChange={handleChange}
                className="w-4 h-4 rounded border-border mt-1"
                required
              />
              <span className="text-sm text-muted-foreground">
                Tôi đồng ý với{" "}
                <Link href="/terms" className="text-primary hover:text-primary/80">
                  Điều Khoản Dịch Vụ
                </Link>{" "}
                và{" "}
                <Link href="/privacy" className="text-primary hover:text-primary/80">
                  Chính Sách Bảo Mật
                </Link>
              </span>
            </label>

            <Button type="submit" className="w-full">
              {isFieldOwner ? "Gửi Đơn Đăng Ký" : "Tạo Tài Khoản"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Đăng nhập tại đây
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
