"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { OwnerSidebar } from "@/components/layout/owner-sidebar"
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

export default function OwnerLayout({
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
      router.replace("/login?redirect=/owner/dashboard")
      return
    }

    if (user.role !== "OWNER") {
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
      <OwnerSidebar />
      <div className="pt-14 lg:pt-0 lg:pl-64 transition-all duration-300">{children}</div>
    </div>
  )
}