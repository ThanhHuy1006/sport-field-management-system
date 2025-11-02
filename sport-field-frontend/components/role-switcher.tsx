"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { LogOut, UserCircle, Settings } from "lucide-react"
import Image from "next/image"

type UserRole = "USER" | "OWNER" | "ADMIN"

export function RoleSwitcher() {
  const [role, setRole] = useState<UserRole | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role") as UserRole | null
    if (token && storedRole) {
      setIsLoggedIn(true)
      setRole(storedRole)
    }
  }, [])

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = "/login"
  }

  if (!isLoggedIn) {
    return (
      <div className="flex gap-2">
        <Link href="/login">
          <Button variant="outline" size="sm">Đăng nhập</Button>
        </Link>
        <Link href="/register">
          <Button size="sm">Đăng ký</Button>
        </Link>
      </div>
    )
  }

  const roleLabel =
    role === "ADMIN" ? "Quản trị viên" : role === "OWNER" ? "Chủ sân" : "Khách hàng"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 p-1">
          <Image
            src="/avatar-default.png"
            alt="avatar"
            width={32}
            height={32}
            className="rounded-full border"
          />
          <span className="hidden sm:inline text-sm font-medium">{roleLabel}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
            <UserCircle className="h-4 w-4" /> Hồ sơ cá nhân
          </Link>
        </DropdownMenuItem>
        {role === "OWNER" && (
          <DropdownMenuItem asChild>
            <Link href="/owner/dashboard" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Quản lý sân
            </Link>
          </DropdownMenuItem>
        )}
        {role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Trang quản trị
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="h-4 w-4" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
