"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useMemo, useState } from "react"
import { UserNav } from "./user-nav"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import {
  LayoutList,
  LayoutDashboard,
  Building2,
  Calendar,
  Users,
  FileText,
  Menu,
  MapPin,
  Star,
  BarChart3,
  Flag,
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { NotificationsPanel } from "@/components/notifications-panel"
import { useNotifications } from "@/hooks/use-notifications"
import {
  getStoredAccessToken,
  getStoredUser,
} from "@/features/auth/lib/auth-storage"

type UserRole = "USER" | "OWNER" | "ADMIN" | null

function mapBackendRoleToUiRole(role?: string | null): UserRole {
  const normalizedRole = role?.toUpperCase()

  if (normalizedRole === "USER") return "USER"
  if (normalizedRole === "OWNER") return "OWNER"
  if (normalizedRole === "ADMIN") return "ADMIN"

  return null
}

export function TopNav() {
  const [currentRole, setCurrentRole] = useState<UserRole>(null)
  const [mobileOpen, setMobileOpen] = useState(false)

  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications()

  useEffect(() => {
    const syncAuthState = () => {
      const token = getStoredAccessToken()
      const user = getStoredUser()

      if (!token || !user) {
        setCurrentRole(null)
        return
      }

      setCurrentRole(mapBackendRoleToUiRole(user.role))
    }

    syncAuthState()

    window.addEventListener("storage", syncAuthState)
    window.addEventListener("focus", syncAuthState)

    return () => {
      window.removeEventListener("storage", syncAuthState)
      window.removeEventListener("focus", syncAuthState)
    }
  }, [])

  const isLoggedIn = currentRole !== null

  const navLinks = useMemo(() => {
    if (!isLoggedIn) {
      return [
        { href: "/", label: "Trang chủ", icon: null },
        { href: "/browse", label: "Danh sách sân", icon: LayoutList },
        { href: "/about", label: "Về chúng tôi", icon: null },
        { href: "/for-owners", label: "Dành cho chủ sân", icon: Building2 },
        { href: "/help", label: "Trợ giúp", icon: FileText },
      ]
    }

    switch (currentRole) {
      case "USER":
        return [
          { href: "/", label: "Trang chủ", icon: null },
          { href: "/browse", label: "Danh sách sân", icon: LayoutList },
          { href: "/about", label: "Về chúng tôi", icon: null },
          { href: "/bookings", label: "Đơn đặt sân", icon: Calendar },
          { href: "/help", label: "Trợ giúp", icon: FileText },
        ]

      case "OWNER":
        return [
          {
            href: "/owner/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/owner/fields",
            label: "Quản lý sân",
            icon: Building2,
          },
          {
            href: "/owner/schedule",
            label: "Đơn đặt",
            icon: Calendar,
          },
          {
            href: "/owner/reports",
            label: "Báo cáo",
            icon: FileText,
          },
        ]

      case "ADMIN":
        return [
          {
            href: "/admin/dashboard",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          {
            href: "/admin/users",
            label: "Người dùng",
            icon: Users,
          },
          {
            href: "/admin/fields",
            label: "Quản lý sân",
            icon: MapPin,
          },
          {
            href: "/admin/schedule",
            label: "Quản lý đặt sân",
            icon: Calendar,
          },
          // {
          //   href: "/admin/field-reports",
          //   label: "Báo cáo sân",
          //   icon: Flag,
          // },
          // {
          //   href: "/admin/reviews",
          //   label: "Báo cáo đánh giá",
          //   icon: Star,
          // },
          {
            href: "/admin/reports",
            label: "Thống kê",
            icon: BarChart3,
          },
        ]

      default:
        return []
    }
  }, [currentRole, isLoggedIn])

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image
                  src="/hcmut-logo.png"
                  alt="HCMUT Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col -space-y-1">
                <span className="font-bold text-lg text-foreground">
                  HCMUT
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  Sport Field Management System
                </span>
              </div>
            </Link>

            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon

                return (
                  <Button
                    key={link.href}
                    variant="ghost"
                    size="sm"
                    className="text-sm font-medium gap-2 hover:bg-accent hover:text-accent-foreground"
                    asChild
                  >
                    <Link href={link.href}>
                      {Icon && <Icon className="h-4 w-4" />}
                      {link.label}
                    </Link>
                  </Button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isLoggedIn ? (
              <>
                <NotificationsPanel
                  notifications={notifications}
                  unreadCount={unreadCount}
                  onMarkAsRead={markAsRead}
                  onMarkAllAsRead={markAllAsRead}
                />

                <ThemeToggle />

                <div className="h-6 w-px bg-border hidden sm:block" />

                <div className="hidden sm:block">
                  <UserNav />
                </div>
              </>
            ) : (
              <>
                <ThemeToggle />

                <div className="h-6 w-px bg-border hidden sm:block" />

                <div className="hidden sm:flex items-center gap-2">
                  <Button variant="ghost" size="sm" asChild>
                    <Link href="/login">Đăng nhập</Link>
                  </Button>

                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                    asChild
                  >
                    <Link href="/register">Đăng ký</Link>
                  </Button>
                </div>
              </>
            )}

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  <div className="flex items-center gap-3 pb-4 border-b">
                    <Image
                      src="/hcmut-logo.png"
                      alt="HCMUT Logo"
                      width={32}
                      height={32}
                    />
                    <span className="font-bold text-lg">HCMUT Sport</span>
                  </div>

                  {navLinks.map((link) => {
                    const Icon = link.icon

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md hover:bg-accent transition-colors"
                      >
                        {Icon && <Icon className="h-5 w-5" />}
                        {link.label}
                      </Link>
                    )
                  })}

                  <div className="pt-4 border-t mt-4">
                    {isLoggedIn ? (
                      <div className="sm:hidden">
                        <UserNav />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:hidden">
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          asChild
                        >
                          <Link href="/login">Đăng nhập</Link>
                        </Button>

                        <Button
                          className="w-full bg-green-600 hover:bg-green-700"
                          asChild
                        >
                          <Link href="/register">Đăng ký</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}