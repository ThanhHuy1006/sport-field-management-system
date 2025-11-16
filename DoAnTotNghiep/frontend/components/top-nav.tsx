"use client"

import Link from "next/link"
import Image from "next/image"
import { UserNav } from "./user-nav"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function TopNav() {
  // Mock notification count
  const notificationCount = 3

  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={40} height={40} className="object-contain" />
            <span className="font-bold text-base hidden md:inline text-foreground">HCMUT Sport Field Management System</span>
            <span className="font-bold text-base md:hidden text-foreground">ĐHBK TPHCM</span>
          </Link>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount}
                </Badge>
              )}
            </Button>
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </div>
    </nav>
  )
}
