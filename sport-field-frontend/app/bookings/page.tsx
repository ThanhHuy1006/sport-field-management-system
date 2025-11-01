"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ArrowLeft, Download } from "lucide-react"

const mockBookings = [
  {
    id: 1,
    fieldName: "Green Valley Soccer Field",
    location: "District 1, HCMC",
    date: "2025-01-20",
    time: "18:00",
    duration: 2,
    price: 1000000,
    status: "upcoming",
    image: "/placeholder.svg?key=vbfdr",
    bookingRef: "BK-2025-001234",
  },
  {
    id: 2,
    fieldName: "Basketball Arena",
    location: "District 7, HCMC",
    date: "2025-01-18",
    time: "14:00",
    duration: 1,
    price: 400000,
    status: "upcoming",
    image: "/placeholder.svg?key=ejrsp",
    bookingRef: "BK-2025-001233",
  },
  {
    id: 3,
    fieldName: "Badminton Court Pro",
    location: "District 3, HCMC",
    date: "2025-01-10",
    time: "10:00",
    duration: 1,
    price: 200000,
    status: "completed",
    image: "/placeholder.svg?key=njyq6",
    bookingRef: "BK-2025-001232",
    rating: 5,
  },
  {
    id: 4,
    fieldName: "Tennis Court Elite",
    location: "District 2, HCMC",
    date: "2025-01-05",
    time: "16:00",
    duration: 2,
    price: 700000,
    status: "completed",
    image: "/placeholder.svg?key=jtmmn",
    bookingRef: "BK-2025-001231",
    rating: 4,
  },
]

export default function BookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedBooking, setSelectedBooking] = useState<(typeof mockBookings)[0] | null>(null)

  const filteredBookings = mockBookings.filter((booking) => booking.status === activeTab)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Đơn đặt sân của tôi</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "upcoming"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sắp tới ({mockBookings.filter((b) => b.status === "upcoming").length})
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "completed"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã hoàn thành ({mockBookings.filter((b) => b.status === "completed").length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row">
                {/* Image */}
                <img
                  src={booking.image || "/placeholder.svg"}
                  alt={booking.fieldName}
                  className="w-full md:w-48 h-48 object-cover"
                />

                {/* Content */}
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{booking.fieldName}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {booking.location}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          booking.status === "upcoming" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {booking.status === "upcoming" ? "Sắp tới" : "Đã hoàn thành"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Ngày</p>
                        <p className="font-medium text-foreground">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Giờ</p>
                        <p className="font-medium text-foreground">{booking.time}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Thời lượng</p>
                        <p className="font-medium text-foreground">{booking.duration} giờ</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Mã đặt sân</p>
                        <p className="font-medium text-foreground">{booking.bookingRef}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="text-2xl font-bold text-primary">{booking.price.toLocaleString()} VND</div>
                    <div className="flex gap-2">
                      {booking.status === "completed" && !booking.rating && (
                        <Button variant="outline" size="sm">
                          Đánh giá
                        </Button>
                      )}
                      {booking.status === "completed" && booking.rating && (
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < booking.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Hóa đơn
                      </Button>
                      {booking.status === "upcoming" && (
                        <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                          Hủy
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Chưa có đơn đặt sân {activeTab === "upcoming" ? "sắp tới" : "đã hoàn thành"}
            </p>
            <Link href="/browse">
              <Button className="mt-4">Duyệt sân</Button>
            </Link>
          </Card>
        )}
      </div>
    </main>
  )
}
