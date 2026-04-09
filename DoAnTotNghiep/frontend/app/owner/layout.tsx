import type React from "react"
import { OwnerSidebar } from "@/components/layout/owner-sidebar"

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <OwnerSidebar />
      <div className="pt-14 lg:pt-0 lg:pl-64 transition-all duration-300">{children}</div>
    </div>
  )
}
