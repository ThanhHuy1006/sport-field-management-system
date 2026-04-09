"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { User, Mail, Lock, Phone, ArrowLeft } from "lucide-react"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Customer registration:", formData)
    window.location.href = "/login"
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary/10 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
            <p className="text-muted-foreground mt-2">Đăng ký để bắt đầu đặt sân thể thao</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* User Type Selection */}

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
              Tạo Tài Khoản
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:text-primary/80 font-medium">
                Đăng nhập tại đây
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Bạn là chủ sân?{" "}
              <Link href="/for-owners" className="text-green-600 hover:text-green-700 font-medium">
                Tìm hiểu thêm về chương trình dành cho chủ sân
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
