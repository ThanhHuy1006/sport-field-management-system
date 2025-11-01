"use client"

import Link from "next/link"
import Image from "next/image"
import { RoleSwitcher } from "./role-switcher"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "@/components/ui/button"
import { LogOut, Bell } from "lucide-react"

export function TopNav() {
  return (
    <nav className="border-b bg-background sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={40} height={40} className="object-contain" />
            <span className="font-bold text-base hidden md:inline text-foreground">
              HCMUT SFMS
            </span>
            <span className="font-bold text-base md:hidden text-foreground">ĐHBK TPHCM</span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <ThemeToggle />
            <RoleSwitcher />
            {/* <Button variant="ghost" size="icon">
              <LogOut className="h-5 w-5" />
            </Button> */}
          </div>
        </div>
      </div>
    </nav>
  )
}
