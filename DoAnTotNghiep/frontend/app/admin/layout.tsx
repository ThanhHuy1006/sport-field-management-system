"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import {
  getStoredAccessToken,
  getStoredUser,
} from "@/features/auth/lib/auth-storage"

function getDefaultRouteByRole(role?: string | null) {
  const normalizedRole = role?.toUpperCase()

  if (normalizedRole === "ADMIN") {
    return "/admin/dashboard"
  }

  if (normalizedRole === "OWNER") {
    return "/owner/dashboard"
  }

  return "/browse"
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    const token = getStoredAccessToken()
    const user = getStoredUser()

    if (!token || !user) {
      router.replace("/login?redirect=/admin/dashboard")
      return
    }

    if (user.role !== "ADMIN") {
      router.replace(getDefaultRouteByRole(user.role))
      return
    }

    setIsAllowed(true)
  }, [router])

  if (!isAllowed) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}