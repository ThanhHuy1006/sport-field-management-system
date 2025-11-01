"use client"

import Link from "next/link"
import { Card } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

const mockBookings = [
  {
    id: 1,
    customer: "Nguyễn Văn A",
    field: "Sân Bóng Đá Green Valley",
    date: "2025-01-20",
    time: "18:00",
    duration: 2,
    price: 1000000,
    status: "confirmed",
  },
  {
    id: 2,
    customer: "Trần Thị B",
    field: "Sân Bóng Rổ Arena",
    date: "2025-01-18",
    time: "14:00",
    duration: 1,
    price: 400000,
    status: "confirmed",
  },
  {
    id: 3,
    customer: "Lê Văn C",
    field: "Sân Bóng Đá Green Valley",
    date: "2025-01-15",
    time: "10:00",
    duration: 1,
    price: 500000,
    status: "completed",
  },
]

export default function AdminBookingsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Tất Cả Đặt Sân</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="overflow-x-auto">
          <Card className="overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Khách Hàng</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Sân</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Ngày</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Giờ</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Thời Lượng</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Giá</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Trạng Thái</th>
                </tr>
              </thead>
              <tbody>
                {mockBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{booking.customer}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.field}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.date}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.time}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{booking.duration} giờ</td>
                    <td className="px-6 py-4 text-sm font-medium text-primary">{booking.price.toLocaleString()} VND</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          booking.status === "confirmed" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {booking.status === "confirmed" ? "Đã Xác Nhận" : "Hoàn Thành"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </div>
    </main>
  )
}
