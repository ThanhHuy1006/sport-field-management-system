"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  Calendar,
  Star,
  TicketPercent,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  User,
  BarChart3,
  QrCode,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

const ownerNavItems = [
  { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/owner/fields", label: "Quản lý sân", icon: MapPin },
  { href: "/owner/schedule", label: "Quản lý đặt sân", icon: Calendar },
  { href: "/owner/checkin", label: "Check-in", icon: QrCode },
  { href: "/owner/reports", label: "Báo cáo", icon: BarChart3 },
  { href: "/owner/vouchers", label: "Voucher", icon: TicketPercent },
  { href: "/owner/reviews", label: "Đánh giá", icon: Star },
  { href: "/owner/profile", label: "Hồ sơ", icon: User },
  { href: "/owner/settings", label: "Cài đặt", icon: Settings },
]

function MobileNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-14 px-4 flex items-center justify-between">
      <Link href="/owner/dashboard" className="flex items-center gap-2">
        <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">O</span>
        </div>
        <span className="font-bold">Chủ Sân</span>
      </Link>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center justify-between h-14 px-4 border-b border-border">
            <Link href="/owner/dashboard" className="flex items-center gap-2" onClick={() => setOpen(false)}>
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">O</span>
              </div>
              <span className="font-bold">Chủ Sân</span>
            </Link>
          </div>

          <nav className="p-3 space-y-1">
            {ownerNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive ? "bg-green-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted",
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
            <Link
              href="/"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">Thoát</span>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

function DesktopSidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={cn(
        "hidden lg:block fixed left-0 top-0 z-40 h-screen bg-card border-r border-border transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <Link href="/owner/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">O</span>
            </div>
            <span className="font-bold">Chủ Sân</span>
          </Link>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className={collapsed ? "mx-auto" : ""}
        >
          {collapsed ? <Menu className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1">
        {ownerNavItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive ? "bg-green-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-muted",
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border">
        <Link
          href="/"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          {!collapsed && <span className="text-sm font-medium">Thoát</span>}
        </Link>
      </div>
    </aside>
  )
}

export function OwnerSidebar() {
  return (
    <>
      <MobileNav />
      <DesktopSidebar />
    </>
  )
}
