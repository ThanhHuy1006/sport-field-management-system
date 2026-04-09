import type React from "react"
import { TopNav } from "@/components/top-nav"
import { Footer } from "@/components/layout/footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <TopNav />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  )
}
