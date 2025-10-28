"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, X, Clock } from "lucide-react"

const mockBookings = [
  {
    id: 1,
    customerName: "John Doe",
    fieldName: "Green Valley Soccer Field",
    date: "2025-01-20",
    time: "18:00",
    duration: 2,
    price: 1000000,
    status: "pending",
    customerEmail: "john@example.com",
  },
  {
    id: 2,
    customerName: "Jane Smith",
    fieldName: "Basketball Arena",
    date: "2025-01-18",
    time: "14:00",
    duration: 1,
    price: 400000,
    status: "confirmed",
    customerEmail: "jane@example.com",
  },
  {
    id: 3,
    customerName: "Mike Johnson",
    fieldName: "Green Valley Soccer Field",
    date: "2025-01-15",
    time: "10:00",
    duration: 1,
    price: 500000,
    status: "completed",
    customerEmail: "mike@example.com",
  },
]

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [filter, setFilter] = useState("all")

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter)

  const handleApprove = (id: number) => {
    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b)))
  }

  const handleReject = (id: number) => {
    setBookings(bookings.filter((b) => b.id !== id))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Manage Bookings</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["all", "pending", "confirmed", "completed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">{booking.customerName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-green-100 text-green-700"
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{booking.fieldName}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Date</p>
                      <p className="font-medium text-foreground">{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Time</p>
                      <p className="font-medium text-foreground">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Duration</p>
                      <p className="font-medium text-foreground">{booking.duration} hour(s)</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Amount</p>
                      <p className="font-medium text-primary">{booking.price.toLocaleString()} VND</p>
                    </div>
                  </div>
                </div>

                {booking.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(booking.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive bg-transparent"
                      onClick={() => handleReject(booking.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No {filter} bookings</p>
          </Card>
        )}
      </div>
    </main>
  )
}
