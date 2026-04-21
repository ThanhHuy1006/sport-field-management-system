"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Mail, Lock, ArrowLeft, AlertCircle } from "lucide-react"
import { login } from "@/features/auth/services/auth.service"
import { saveAuthSession } from "@/features/auth/lib/auth-storage"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)
      setError("")

      const result = await login({
        email,
        password,
      })

      saveAuthSession(result.data.token, result.data.user)

      const redirect = searchParams.get("redirect")
      if (redirect) {
        router.push(redirect)
        return
      }

      if (result.data.user.role === "admin") {
        router.push("/admin")
        return
      }

      if (result.data.user.role === "owner") {
        router.push("/owner")
        return
      }

      router.push("/browse")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại")
    } finally {
      setIsSubmitting(false)
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
            <p className="text-muted-foreground mt-2">Đăng nhập vào Hệ Thống Quản Lý Sân Thể Thao HCMUT</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-border"
                />
                <span className="text-sm text-foreground">Ghi nhớ đăng nhập</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-primary hover:text-primary/80">
                Quên mật khẩu?
              </Link>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang đăng nhập..." : "Đăng Nhập"}
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