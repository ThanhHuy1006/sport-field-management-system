"use client"

import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { User, Mail, Lock, Phone, ArrowLeft } from "lucide-react"
import { registerUser } from "@/lib/auth" // ✅ gọi API thật

// Định nghĩa kiểu dữ liệu của form để TypeScript hiểu
interface RegisterForm {
  fullName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
  userType: string
  agreeTerms: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState<RegisterForm>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    userType: "customer",
    agreeTerms: false,
  })

  // ✅ Bắt sự kiện thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev: RegisterForm) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  // ✅ Gọi API đăng ký thật


const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    alert("Mật khẩu không khớp!");
    return;
  }

  try {
    const res = await registerUser(
      formData.email,
      formData.password,
      formData.fullName,
      formData.userType // ✅ gửi đúng kiểu
    );

    localStorage.setItem("token", res.accessToken);
    alert("Đăng ký thành công!");
    window.location.href = "/browse";
  } catch (err: any) {
    console.error("Register error:", err);
    alert("Đăng ký thất bại. Vui lòng thử lại.");
  }
};


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
            <p className="text-muted-foreground mt-2">Tham gia Hệ Thống Quản Lý Sân Thể Thao HCMUT</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Họ và tên */}
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

            {/* Email */}
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

            {/* Số điện thoại */}
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

            {/* Loại người dùng */}
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
            </div>

            {/* Mật khẩu */}
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

            {/* Xác nhận mật khẩu */}
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

            {/* Checkbox đồng ý điều khoản */}
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
                <Link href="#" className="text-primary hover:text-primary/80">
                  Điều Khoản Dịch Vụ
                </Link>{" "}
                và{" "}
                <Link href="#" className="text-primary hover:text-primary/80">
                  Chính Sách Bảo Mật
                </Link>
              </span>
            </label>

            {/* Nút submit */}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang tạo..." : "Tạo Tài Khoản"}
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
