"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Lock, ArrowLeft } from "lucide-react"
import { loginUser } from "@/lib/auth"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await loginUser(email, password)

      // ✅ Lưu token và role
      localStorage.setItem("token", res.accessToken)
      localStorage.setItem("role", res.user.role)
      localStorage.setItem("userId", String(res.user.id))

      // ✅ Chuyển hướng theo role
      switch (res.user.role) {
        case "ADMIN":
          router.push("/admin/dashboard")
          break
        case "OWNER":
          router.push("/owner/dashboard")
          break
        default:
          router.push("/") // USER
      }
    } catch (err: any) {
      setError("Sai email hoặc mật khẩu, vui lòng thử lại.")
      console.error(err)
    } finally {
      setLoading(false)
    }
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
            <h1 className="text-3xl font-bold text-foreground">Chào Mừng Trở Lại</h1>
            <p className="text-muted-foreground mt-2">
              Đăng nhập vào Hệ Thống Quản Lý Sân Thể Thao HCMUT
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Địa Chỉ Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang đăng nhập..." : "Đăng Nhập"}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:text-primary/80 font-medium">
                Đăng ký tại đây
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </main>
  )
}
