"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, LayoutDashboard, Building2, Shield, Heart, Clock } from "lucide-react"

type UserRole = "customer" | "owner" | "admin"

interface UserData {
  name: string
  email: string
  avatar?: string
  role: UserRole
}

export function UserNav() {
  const [user] = useState<UserData>({
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    avatar: "/placeholder.svg",
    role: "customer",
  })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case "customer":
        return "Khách hàng"
      case "owner":
        return "Chủ sân"
      case "admin":
        return "Quản trị viên"
    }
  }

  const getRoleLinks = () => {
    switch (user.role) {
      case "customer":
        return [
          { href: "/profile", icon: User, label: "Hồ sơ của tôi" },
          { href: "/bookings", icon: Clock, label: "Lịch đặt sân" },
          { href: "/wishlist", icon: Heart, label: "Yêu thích" },
          { href: "/settings", icon: Settings, label: "Cài đặt" },
        ]
      case "owner":
        return [
          { href: "/owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/owner/profile", icon: User, label: "Hồ sơ của tôi" },
          { href: "/owner/fields", icon: Building2, label: "Quản lý sân" },
          { href: "/owner/settings", icon: Settings, label: "Cài đặt" },
        ]
      case "admin":
        return [
          { href: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard" },
          { href: "/admin/profile", icon: User, label: "Hồ sơ của tôi" },
          { href: "/admin/users", icon: Shield, label: "Quản lý users" },
          { href: "/admin/settings", icon: Settings, label: "Cài đặt" },
        ]
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            <p className="text-xs leading-none text-primary font-medium pt-1">{getRoleLabel(user.role)}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {getRoleLinks().map((link) => {
          const Icon = link.icon
          return (
            <DropdownMenuItem key={link.href} asChild>
              <Link href={link.href} className="flex items-center gap-2 cursor-pointer">
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 dark:text-red-400 cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          <span>Đăng xuất</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
