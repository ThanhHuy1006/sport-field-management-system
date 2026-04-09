"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  MapPin,
  Star,
  ArrowLeft,
  AlertCircle,
  Calendar,
  DollarSign,
  Repeat,
  CalendarDays,
  XCircle,
  QrCode,
  CheckCircle2,
} from "lucide-react"
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
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { QRCode } from "@/components/qr-code"

type Booking = {
  id: number
  fieldName: string
  location: string
  date: string
  time: string
  duration: number
  price: number
  status: string
  image: string
  bookingRef: string
  rating?: number
  rescheduleRequest?: {
    newDate: string
    newTime: string
    requestedAt: string
    oldDate: string
    oldTime: string
  }
  notification?: string
  cancelledAt?: string
  refundAmount?: number
  isRecurring?: boolean
  recurringId?: string
  recurringSettings?: {
    frequency: "weekly" | "biweekly" | "monthly"
    duration: string
    totalSessions: number
    completedSessions: number
  }
  recurringDates?: string[]
  checkedInAt?: string
}

const mockBookings: Booking[] = [
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
    notification: "Chờ xác nhận từ chủ sân",
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
    id: 8,
    fieldName: "Volleyball Court",
    location: "District 10, HCMC",
    date: "2025-01-09",
    time: "16:00",
    duration: 2,
    price: 300000,
    status: "checked_in",
    image: "/placeholder.svg?key=volleyball",
    bookingRef: "BK-2025-001245",
    checkedInAt: "2025-01-09T15:55:00",
  },
  {
    id: 6,
    fieldName: "Tennis Court Elite",
    location: "District 2, HCMC",
    date: "2025-01-22",
    time: "07:00",
    duration: 2,
    price: 700000,
    status: "confirmed",
    image: "/placeholder.svg?key=tennis-recurring",
    bookingRef: "BK-2025-001240",
    isRecurring: true,
    recurringId: "RC-2025-001",
    recurringSettings: {
      frequency: "weekly",
      duration: "8",
      totalSessions: 8,
      completedSessions: 2,
    },
    recurringDates: [
      "2025-01-08",
      "2025-01-15",
      "2025-01-22",
      "2025-01-29",
      "2025-02-05",
      "2025-02-12",
      "2025-02-19",
      "2025-02-26",
    ],
  },
  {
    id: 7,
    fieldName: "Badminton Court Pro",
    location: "District 3, HCMC",
    date: "2025-01-25",
    time: "19:00",
    duration: 1,
    price: 200000,
    status: "confirmed",
    image: "/placeholder.svg?key=badminton-recurring",
    bookingRef: "BK-2025-001241",
    isRecurring: true,
    recurringId: "RC-2025-002",
    recurringSettings: {
      frequency: "biweekly",
      duration: "12",
      totalSessions: 6,
      completedSessions: 0,
    },
    recurringDates: ["2025-01-25", "2025-02-08", "2025-02-22", "2025-03-08", "2025-03-22", "2025-04-05"],
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
  const [bookings, setBookings] = useState<Booking[]>(mockBookings)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false)
  const [showRecurringDetailDialog, setShowRecurringDetailDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [newDate, setNewDate] = useState("")
  const [newTime, setNewTime] = useState("")
  const [rating, setRating] = useState(0)
  const [fieldQuality, setFieldQuality] = useState(0)
  const [service, setService] = useState(0)
  const [location, setLocation] = useState(0)
  const [facilities, setFacilities] = useState(0)
  const [review, setReview] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [refundAmount, setRefundAmount] = useState(0)
  const [cancelBookingId, setCancelBookingId] = useState<number | null>(null)
  const itemsPerPage = 5
  const { toast } = useToast()

  const calculateRefund = (booking: Booking) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking >= 24) {
      return booking.price
    } else if (hoursUntilBooking >= 12) {
      return booking.price * 0.5
    } else {
      return 0
    }
  }

  const handleReschedule = () => {
    if (!newDate || !newTime || !selectedBooking) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng chọn ngày và giờ mới",
        variant: "destructive",
      })
      return
    }

    const bookingDateTime = new Date(`${selectedBooking.date}T${selectedBooking.time}`)
    const now = new Date()
    const hoursUntilBooking = (bookingDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursUntilBooking < 24) {
      toast({
        title: "Không thể đổi lịch",
        description: "Bạn cần đổi lịch trước 24h so với giờ đặt hiện tại.",
        variant: "destructive",
      })
      return
    }

    const conflict = bookings.find(
      (b) =>
        b.id !== selectedBooking.id &&
        b.status === "confirmed" &&
        b.fieldName === selectedBooking.fieldName &&
        b.date === newDate &&
        b.time === newTime,
    )

    if (conflict) {
      toast({
        title: "Khung giờ không khả dụng",
        description: "Khung giờ này đã được đặt. Vui lòng chọn thời gian khác.",
        variant: "destructive",
      })
      return
    }

    setBookings(
      bookings.map((b) =>
        b.id === selectedBooking.id
          ? {
              ...b,
              status: "pending_reschedule",
              rescheduleRequest: {
                newDate,
                newTime,
                requestedAt: new Date().toISOString(),
                oldDate: b.date,
                oldTime: b.time,
              },
              notification: "Chờ duyệt đổi lịch từ chủ sân",
            }
          : b,
      ),
    )

    toast({
      title: "Yêu cầu đổi lịch đã gửi",
      description: `Yêu cầu đổi sang ${newDate} lúc ${newTime} đang chờ chủ sân xác nhận.`,
    })

    setNewDate("")
    setNewTime("")
    setSelectedBooking(null)
    setShowRescheduleDialog(false)
  }

  const handleCancelBooking = (bookingId: number) => {
    const booking = bookings.find((b) => b.id === bookingId)
    if (!booking) return

    const refund = calculateRefund(booking)
    setRefundAmount(refund)
    setCancelBookingId(bookingId)
  }

  const confirmCancelBooking = () => {
    if (cancelBookingId === null) return

    setBookings(
      bookings.map((b) =>
        b.id === cancelBookingId
          ? { ...b, status: "cancelled", cancelledAt: new Date().toISOString(), refundAmount }
          : b,
      ),
    )

    const refundText =
      refundAmount > 0 ? `Số tiền hoàn: ${refundAmount.toLocaleString("vi-VN")} VNĐ` : "Không được hoàn tiền"

    toast({
      title: "Đã hủy đặt sân",
      description: refundText,
    })

    setCancelBookingId(null)
    setRefundAmount(0)
  }

  const handleCancelRecurringSeries = (booking: Booking) => {
    if (!booking.recurringId) return

    setBookings(
      bookings.map((b) => {
        if (b.recurringId === booking.recurringId && new Date(b.date) >= new Date()) {
          return { ...b, status: "cancelled", cancelledAt: new Date().toISOString() }
        }
        return b
      }),
    )

    toast({
      title: "Đã hủy lịch định kỳ",
      description: "Tất cả các buổi còn lại đã được hủy",
    })

    setShowRecurringDetailDialog(false)
  }

  const handleSubmitRating = () => {
    setShowRatingDialog(false)
    setRating(0)
    setFieldQuality(0)
    setService(0)
    setLocation(0)
    setFacilities(0)
    setReview("")

    toast({
      title: "Đánh giá đã được gửi",
      description: "Cảm ơn bạn đã chia sẻ trải nghiệm!",
    })
  }

  const handleShowQR = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowQRDialog(true)
  }

  const filteredBookings = bookings.filter((booking) => {
    if (activeTab === "upcoming") {
      return (
        (booking.status === "pending" ||
          booking.status === "confirmed" ||
          booking.status === "pending_reschedule" ||
          booking.status === "checked_in") &&
        !booking.isRecurring
      )
    }
    if (activeTab === "recurring") {
      return booking.isRecurring && booking.status !== "cancelled"
    }
    if (activeTab === "completed") {
      return booking.status === "completed"
    }
    if (activeTab === "cancelled") {
      return booking.status === "cancelled"
    }
    return false
  })

  const recurringCount = bookings.filter((b) => b.isRecurring && b.status !== "cancelled").length

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "pending":
        return {
          text: "Chờ xác nhận",
          className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        }
      case "confirmed":
        return { text: "Đã xác nhận", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" }
      case "checked_in":
        return {
          text: "Đã check-in",
          className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        }
      case "pending_reschedule":
        return {
          text: "Chờ duyệt đổi lịch",
          className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
        }
      case "cancelled":
        return { text: "Đã hủy", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" }
      case "completed":
        return {
          text: "Đã hoàn thành",
          className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        }
      default:
        return { text: status, className: "bg-gray-100 text-gray-700" }
    }
  }

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
        <div className="flex gap-4 mb-8 border-b border-border overflow-x-auto">
          <button
            onClick={() => {
              setActiveTab("upcoming")
              setCurrentPage(1)
            }}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === "upcoming"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sắp tới (
            {
              bookings.filter(
                (b) =>
                  (b.status === "pending" ||
                    b.status === "confirmed" ||
                    b.status === "pending_reschedule" ||
                    b.status === "checked_in") &&
                  !b.isRecurring,
              ).length
            }
            )
          </button>
          <button
            onClick={() => {
              setActiveTab("recurring")
              setCurrentPage(1)
            }}
            className={`px-4 py-2 font-medium transition whitespace-nowrap flex items-center gap-2 ${
              activeTab === "recurring"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Repeat className="w-4 h-4" />
            Định kỳ ({recurringCount})
          </button>
          <button
            onClick={() => {
              setActiveTab("completed")
              setCurrentPage(1)
            }}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === "completed"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã hoàn thành ({bookings.filter((b) => b.status === "completed").length})
          </button>
          <button
            onClick={() => {
              setActiveTab("cancelled")
              setCurrentPage(1)
            }}
            className={`px-4 py-2 font-medium transition whitespace-nowrap ${
              activeTab === "cancelled"
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã hủy ({bookings.filter((b) => b.status === "cancelled").length})
          </button>
        </div>

        {/* Bookings List */}
        <div className="space-y-4 mb-8">
          {paginatedBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Chưa có đơn đặt sân</h3>
              <p className="text-muted-foreground mb-4">
                {activeTab === "recurring"
                  ? "Bạn chưa có lịch đặt sân định kỳ nào"
                  : "Bạn chưa có đơn đặt sân nào trong mục này"}
              </p>
              <Link href="/browse">
                <Button>Tìm sân ngay</Button>
              </Link>
            </div>
          ) : (
            paginatedBookings.map((booking) => {
              const statusDisplay = getStatusDisplay(booking.status)
              return (
                <Card key={booking.id} className="overflow-hidden hover:shadow-lg transition">
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <div className="relative">
                      <img
                        src={booking.image || "/placeholder.svg"}
                        alt={booking.fieldName}
                        className="w-full md:w-48 h-48 object-cover"
                      />
                      {booking.isRecurring && (
                        <Badge className="absolute top-2 left-2 bg-primary">
                          <Repeat className="w-3 h-3 mr-1" />
                          Định kỳ
                        </Badge>
                      )}
                    </div>

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
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusDisplay.className}`}>
                            {statusDisplay.text}
                          </span>
                        </div>

                        {booking.status === "checked_in" && booking.checkedInAt && (
                          <div className="flex items-start gap-2 mb-4 p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-green-800 dark:text-green-200">
                              <p className="font-medium">Đã check-in thành công</p>
                              <p>Lúc: {new Date(booking.checkedInAt).toLocaleTimeString("vi-VN")}</p>
                            </div>
                          </div>
                        )}

                        {booking.isRecurring && booking.recurringSettings && (
                          <div className="flex items-start gap-2 mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                            <Repeat className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                              <p className="font-medium text-primary mb-1">Lịch định kỳ</p>
                              <p className="text-muted-foreground">
                                {booking.recurringSettings.frequency === "weekly"
                                  ? "Hàng tuần"
                                  : booking.recurringSettings.frequency === "biweekly"
                                    ? "2 tuần/lần"
                                    : "Hàng tháng"}
                                {" • "}
                                {booking.recurringSettings.completedSessions}/{booking.recurringSettings.totalSessions}{" "}
                                buổi đã hoàn thành
                              </p>
                            </div>
                          </div>
                        )}

                        {booking.status === "pending_reschedule" && booking.rescheduleRequest && (
                          <div className="flex items-start gap-2 mb-4 p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                            <AlertCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-purple-800 dark:text-purple-200">
                              <p className="font-medium mb-1">Yêu cầu đổi lịch</p>
                              <p>
                                Từ: {booking.rescheduleRequest.oldDate} lúc {booking.rescheduleRequest.oldTime}
                              </p>
                              <p>
                                Sang: {booking.rescheduleRequest.newDate} lúc {booking.rescheduleRequest.newTime}
                              </p>
                              <p className="text-xs mt-1">Đang chờ chủ sân xác nhận...</p>
                            </div>
                          </div>
                        )}

                        {booking.status === "cancelled" && booking.refundAmount !== undefined && (
                          <div className="flex items-start gap-2 mb-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                            <DollarSign className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-800 dark:text-red-200">
                              <p className="font-medium">
                                {booking.refundAmount > 0
                                  ? `Số tiền hoàn: ${booking.refundAmount.toLocaleString()} VND`
                                  : "Không được hoàn tiền (hủy dưới 12h)"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground mb-1">Ngày</p>
                            <p className="font-medium">{booking.date}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Giờ</p>
                            <p className="font-medium">{booking.time}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Thời gian</p>
                            <p className="font-medium">{booking.duration} giờ</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground mb-1">Tổng tiền</p>
                            <p className="font-medium text-primary">{booking.price.toLocaleString()} VND</p>
                          </div>
                        </div>

                        <p className="text-xs text-muted-foreground mt-3">Mã đặt sân: {booking.bookingRef}</p>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                        {(booking.status === "confirmed" || booking.status === "checked_in") && (
                          <Button variant="outline" size="sm" onClick={() => handleShowQR(booking)} className="gap-2">
                            <QrCode className="w-4 h-4" />
                            {booking.status === "checked_in" ? "Xem QR" : "Mã Check-in"}
                          </Button>
                        )}

                        {booking.isRecurring && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowRecurringDetailDialog(true)
                            }}
                          >
                            <CalendarDays className="w-4 h-4 mr-2" />
                            Xem lịch
                          </Button>
                        )}

                        {booking.status === "confirmed" && !booking.isRecurring && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking)
                                setShowRescheduleDialog(true)
                              }}
                            >
                              Đổi lịch
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 bg-transparent"
                                  onClick={() => handleCancelBooking(booking.id)}
                                >
                                  Hủy đặt sân
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Xác nhận hủy đặt sân?</AlertDialogTitle>
                                  <AlertDialogDescription asChild>
                                    <div className="space-y-2">
                                      <p>Bạn có chắc chắn muốn hủy đặt sân này không?</p>
                                      <div className="p-3 bg-muted rounded-lg text-sm">
                                        <p className="font-medium mb-1">Chính sách hoàn tiền:</p>
                                        <ul className="list-disc list-inside space-y-1">
                                          <li>Hủy trước 24h: Hoàn 100%</li>
                                          <li>Hủy trước 12h: Hoàn 50%</li>
                                          <li>Hủy dưới 12h: Không hoàn tiền</li>
                                        </ul>
                                        {refundAmount > 0 ? (
                                          <p className="mt-2 text-green-600 dark:text-green-400 font-medium">
                                            Số tiền hoàn: {refundAmount.toLocaleString()} VND
                                          </p>
                                        ) : (
                                          <p className="mt-2 text-red-600 dark:text-red-400 font-medium">
                                            Bạn sẽ không được hoàn tiền
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Quay lại</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={confirmCancelBooking}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Xác nhận hủy
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </>
                        )}

                        {booking.status === "completed" && !booking.rating && (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowRatingDialog(true)
                            }}
                          >
                            <Star className="w-4 h-4 mr-2" />
                            Đánh giá
                          </Button>
                        )}

                        {booking.status === "completed" && booking.rating && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <span>Đã đánh giá:</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${i < booking.rating! ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        )}
      </div>

      <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Mã Check-in
            </DialogTitle>
            <DialogDescription>Xuất trình mã QR này cho chủ sân khi đến để check-in</DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="flex flex-col items-center gap-6 py-4">
              {/* QR Code */}
              <div className="p-4 bg-white rounded-xl shadow-lg">
                <QRCode value={`BOOKING:${selectedBooking.bookingRef}`} size={200} />
              </div>

              {/* Booking Info */}
              <div className="w-full space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Mã đặt sân</span>
                  <span className="font-mono font-bold">{selectedBooking.bookingRef}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Sân</span>
                  <span className="font-medium">{selectedBooking.fieldName}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Ngày</span>
                  <span className="font-medium">{selectedBooking.date}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Giờ</span>
                  <span className="font-medium">
                    {selectedBooking.time} ({selectedBooking.duration}h)
                  </span>
                </div>
                {selectedBooking.status === "checked_in" && selectedBooking.checkedInAt && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">Đã check-in</p>
                      <p className="text-xs text-green-600 dark:text-green-500">
                        Lúc {new Date(selectedBooking.checkedInAt).toLocaleTimeString("vi-VN")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowQRDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Đánh giá sân</DialogTitle>
            <DialogDescription>Chia sẻ trải nghiệm của bạn tại {selectedBooking?.fieldName}</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {/* Overall Rating */}
            <div>
              <Label className="mb-3 block">Đánh giá tổng thể</Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="p-1 hover:scale-110 transition">
                    <Star
                      className={`w-8 h-8 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Detailed Ratings */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="mb-2 block text-sm">Chất lượng sân</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setFieldQuality(star)}>
                      <Star
                        className={`w-5 h-5 ${star <= fieldQuality ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-sm">Dịch vụ</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setService(star)}>
                      <Star
                        className={`w-5 h-5 ${star <= service ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-sm">Vị trí</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setLocation(star)}>
                      <Star
                        className={`w-5 h-5 ${star <= location ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-2 block text-sm">Tiện nghi</Label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setFacilities(star)}>
                      <Star
                        className={`w-5 h-5 ${star <= facilities ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Review Text */}
            <div>
              <Label htmlFor="review" className="mb-2 block">
                Nhận xét (tùy chọn)
              </Label>
              <Textarea
                id="review"
                placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatingDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitRating} disabled={rating === 0}>
              Gửi đánh giá
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={showRescheduleDialog} onOpenChange={setShowRescheduleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi lịch đặt sân</DialogTitle>
            <DialogDescription>
              Chọn ngày và giờ mới cho đơn đặt sân của bạn. Yêu cầu sẽ được gửi đến chủ sân để xác nhận.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="newDate">Ngày mới</Label>
              <input
                id="newDate"
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full mt-1 px-3 py-2 border rounded-md bg-background"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="newTime">Giờ mới</Label>
              <Select value={newTime} onValueChange={setNewTime}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Chọn giờ" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "06:00",
                    "07:00",
                    "08:00",
                    "09:00",
                    "10:00",
                    "11:00",
                    "12:00",
                    "13:00",
                    "14:00",
                    "15:00",
                    "16:00",
                    "17:00",
                    "18:00",
                    "19:00",
                    "20:00",
                    "21:00",
                  ].map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                Lưu ý: Bạn cần gửi yêu cầu đổi lịch trước 24h so với giờ đặt hiện tại.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRescheduleDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleReschedule}>Gửi yêu cầu</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Recurring Detail Dialog */}
      <Dialog open={showRecurringDetailDialog} onOpenChange={setShowRecurringDetailDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Repeat className="w-5 h-5 text-primary" />
              Chi tiết lịch định kỳ
            </DialogTitle>
            <DialogDescription>{selectedBooking?.fieldName}</DialogDescription>
          </DialogHeader>
          {selectedBooking && selectedBooking.recurringSettings && (
            <div className="space-y-4 py-4">
              {/* Progress */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span>
                    {selectedBooking.recurringSettings.completedSessions}/
                    {selectedBooking.recurringSettings.totalSessions} buổi
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{
                      width: `${(selectedBooking.recurringSettings.completedSessions / selectedBooking.recurringSettings.totalSessions) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tần suất</p>
                  <p className="font-medium">
                    {selectedBooking.recurringSettings.frequency === "weekly"
                      ? "Hàng tuần"
                      : selectedBooking.recurringSettings.frequency === "biweekly"
                        ? "2 tuần/lần"
                        : "Hàng tháng"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Giờ cố định</p>
                  <p className="font-medium">{selectedBooking.time}</p>
                </div>
              </div>

              {/* Sessions List */}
              <div>
                <p className="text-sm font-medium mb-2">Danh sách các buổi</p>
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {selectedBooking.recurringDates?.map((date, index) => {
                    const isPast = new Date(date) < new Date()
                    return (
                      <div
                        key={date}
                        className={`flex items-center justify-between p-2 rounded-lg ${
                          isPast ? "bg-green-50 dark:bg-green-950/20" : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Buổi {index + 1}</span>
                          <span className="text-sm text-muted-foreground">{date}</span>
                        </div>
                        {isPast ? (
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">
                            Hoàn thành
                          </Badge>
                        ) : (
                          <Badge variant="outline">Sắp tới</Badge>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="text-red-600 hover:text-red-700 bg-transparent">
                  <XCircle className="w-4 h-4 mr-2" />
                  Hủy toàn bộ
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hủy lịch định kỳ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn hủy tất cả các buổi còn lại trong lịch định kỳ này?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Quay lại</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => selectedBooking && handleCancelRecurringSeries(selectedBooking)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Xác nhận hủy
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => setShowRecurringDetailDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
