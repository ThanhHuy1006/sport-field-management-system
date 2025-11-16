"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ArrowLeft, AlertCircle } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Pagination } from "@/components/pagination"

const mockBookings = [
  {
    id: 1,
    fieldName: "Green Valley Soccer Field",
    location: "District 1, HCMC",
    date: "2025-01-20",
    time: "18:00",
    duration: 2,
    price: 1000000,
    status: "pending",
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
    status: "confirmed",
    image: "/placeholder.svg?key=ejrsp",
    bookingRef: "BK-2025-001233",
  },
  {
    id: 5,
    fieldName: "Futsal Court Premium",
    location: "District 5, HCMC",
    date: "2025-01-08",
    time: "20:00",
    duration: 2,
    price: 600000,
    status: "completed",
    image: "/placeholder.svg?key=futsal",
    bookingRef: "BK-2025-001235",
    // No rating - user can review this one
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
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [rating, setRating] = useState(0)
  const [fieldQuality, setFieldQuality] = useState(0)
  const [service, setService] = useState(0)
  const [location, setLocation] = useState(0)
  const [facilities, setFacilities] = useState(0)
  const [review, setReview] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const handleCancelBooking = (bookingId: number) => {
    console.log("[v0] Cancelling booking:", bookingId)
    // In real app: API call to cancel
  }

  const handleSubmitRating = () => {
    console.log("[v0] Submitting rating:", { 
      bookingId: selectedBooking?.id, 
      overallRating: rating,
      fieldQuality,
      service,
      location,
      facilities,
      review 
    })
    setShowRatingDialog(false)
    setRating(0)
    setFieldQuality(0)
    setService(0)
    setLocation(0)
    setFacilities(0)
    setReview("")
  }

  const filteredBookings = mockBookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return booking.status === "pending" || booking.status === "confirmed"
    }
    return booking.status === activeTab
  })

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

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
            onClick={() => {
              setActiveTab("upcoming")
              setCurrentPage(1)
            }}
            className={`px-4 py-2 font-medium transition ${
              activeTab === "upcoming"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sắp tới ({mockBookings.filter((b) => b.status === "pending" || b.status === "confirmed").length})
          </button>
          <button
            onClick={() => {
              setActiveTab("completed")
              setCurrentPage(1)
            }}
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
        <div className="space-y-4 mb-8">
          {paginatedBookings.map((booking) => (
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
                          booking.status === "pending"
                            ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                            : booking.status === "confirmed"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        }`}
                      >
                        {booking.status === "pending"
                          ? "Chờ xác nhận"
                          : booking.status === "confirmed"
                            ? "Đã xác nhận"
                            : "Đã hoàn thành"}
                      </span>
                    </div>

                    {booking.status === "pending" && (
                      <div className="flex items-start gap-2 mb-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                        <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-800 dark:text-yellow-200">
                          Đơn đặt sân đang chờ chủ sân xác nhận. Bạn sẽ nhận email khi được duyệt.
                        </p>
                      </div>
                    )}

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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowRatingDialog(true)
                          }}
                        >
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
                      {(booking.status === "pending" || booking.status === "confirmed") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-destructive bg-transparent">
                              Hủy
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận hủy đặt sân</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn hủy đơn đặt sân này? Hành động này không thể hoàn tác.
                                {booking.status === "confirmed" && " Phí hủy có thể được áp dụng."}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Không</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleCancelBooking(booking.id)}>
                                Xác nhận hủy
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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

        {filteredBookings.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredBookings.length}
          />
        )}
      </div>

      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Đánh giá trải nghiệm</DialogTitle>
            <DialogDescription>Chia sẻ trải nghiệm của bạn với {selectedBooking?.fieldName}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <label className="block text-sm font-medium mb-2">Đánh giá tổng quan</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                    <Star
                      className={`w-10 h-10 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                    />
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {rating === 5 && "Xuất sắc"}
                  {rating === 4 && "Tốt"}
                  {rating === 3 && "Trung bình"}
                  {rating === 2 && "Kém"}
                  {rating === 1 && "Rất kém"}
                </p>
              )}
            </div>

            <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
              <p className="font-medium text-sm">Đánh giá chi tiết</p>
              
              {/* Field Quality */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm">Chất lượng sân</label>
                  <span className="text-sm font-medium text-primary">{fieldQuality}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setFieldQuality(star)} 
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= fieldQuality ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Service */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm">Dịch vụ & thái độ</label>
                  <span className="text-sm font-medium text-primary">{service}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setService(star)} 
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= service ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm">Vị trí & giao thông</label>
                  <span className="text-sm font-medium text-primary">{location}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setLocation(star)} 
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= location ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Facilities */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm">Tiện ích & cơ sở vật chất</label>
                  <span className="text-sm font-medium text-primary">{facilities}/5</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      onClick={() => setFacilities(star)} 
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= facilities ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Review text */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Nhận xét chi tiết <span className="text-muted-foreground">(tùy chọn)</span>
              </label>
              <Textarea
                placeholder="Chia sẻ trải nghiệm của bạn về sân, dịch vụ, và những điều bạn thích hoặc muốn cải thiện..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={5}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tối thiểu 20 ký tự để nhận xét của bạn có ý nghĩa hơn
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={handleSubmitRating} 
              disabled={rating === 0}
            >
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
