import type React from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <div className="lg:pl-64 transition-all duration-300">
        <main className="min-h-screen">{children}</main>
      </div>
    </div>
  )
}
