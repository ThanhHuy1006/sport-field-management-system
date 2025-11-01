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
import { Users, Settings, Home, LogOut } from "lucide-react"

type UserRole = "USER" | "OWNER" | "ADMIN"

export function RoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("token")
    const storedRole = localStorage.getItem("role") as UserRole | null

    if (token && storedRole) {
      setIsLoggedIn(true)
      setCurrentRole(storedRole)
    } else {
      setIsLoggedIn(false)
    }
  }, [])

  const roles = [
    { id: "USER", label: "Khách hàng", icon: Home, href: "/browse" },
    { id: "OWNER", label: "Chủ sân", icon: Settings, href: "/owner/dashboard" },
    { id: "ADMIN", label: "Quản trị viên", icon: Users, href: "/admin/dashboard" },
  ] as const

  const current = roles.find((r) => r.id === currentRole) || roles[0]
  const CurrentIcon = current.icon

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    localStorage.removeItem("refreshToken")
    window.location.href = "/login"
  }

  // 🔹 Nếu chưa đăng nhập → hiển thị nút Login / Register
  if (!isLoggedIn) {
    return (
      <div className="flex gap-3">
        <Link href="/login">
          <Button variant="outline" size="sm">
            Đăng nhập
          </Button>
        </Link>
        <Link href="/register">
          <Button size="sm" className="bg-primary text-white hover:bg-primary/80">
            Đăng ký
          </Button>
        </Link>
      </div>
    )
  }

  // 🔹 Nếu đã đăng nhập → hiển thị dropdown role
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 bg-transparent">
          <CurrentIcon className="h-4 w-4" />
          <span className="hidden sm:inline">{current.label}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Vai trò hiện tại</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => {
          const Icon = role.icon
          return (
            <DropdownMenuItem key={role.id} asChild>
              <Link
                href={role.href}
                onClick={() => {
                  localStorage.setItem("role", role.id)
                  setCurrentRole(role.id as UserRole)
                }}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Icon className="h-4 w-4" />
                <span>{role.label}</span>
                {currentRole === role.id && (
                  <span className="ml-auto text-xs font-semibold text-primary">✓</span>
                )}
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" /> Đăng xuất
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
