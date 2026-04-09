import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  display: "swap",
})

export const metadata: Metadata = {
  title: "Hệ Thống Quản Lý Sân Thể Thao ĐHBK TPHCM",
  description: "Nền tảng đặt sân thể thao Đại học Bách Khoa TP. Hồ Chí Minh",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
