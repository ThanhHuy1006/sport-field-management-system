"use client"

import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle, Home, Calendar, Clock } from "lucide-react"

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    if (bookingId && typeof window !== "undefined") {
      const stored = localStorage.getItem(`booking-${bookingId}`)
      if (stored) {
        setBookingData(JSON.parse(stored))
      }
    }
  }, [bookingId])

  if (!bookingData) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        <div className="text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-foreground mb-3">Thanh toán thành công!</h1>
          <p className="text-muted-foreground mb-8">
            Đơn đặt sân của bạn đã được thanh toán. Chờ chủ sân xác nhận để hoàn tất.
          </p>

          {/* Booking Details */}
          <div className="bg-muted p-6 rounded-lg mb-8">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-border">
              <span className="text-muted-foreground">Mã đặt sân</span>
              <span className="font-bold text-xl">#{bookingData.bookingId}</span>
            </div>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sân</span>
                <span className="font-medium text-right">{bookingData.fieldName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ngày & Giờ</span>
                <span className="font-medium">
                  {bookingData.date} lúc {bookingData.time}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Thời lượng</span>
                <span className="font-medium">{bookingData.duration} giờ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tổng thanh toán</span>
                <span className="font-bold text-primary">{bookingData.totalAmount.toLocaleString()} ₫</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 py-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg mb-4">
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-500 animate-pulse" />
              <span className="font-medium text-yellow-700 dark:text-yellow-400">Đang chờ chủ sân xác nhận</span>
            </div>

            <div className="text-sm text-left space-y-2 text-muted-foreground">
              <p>✓ Thanh toán đã hoàn tất</p>
              <p>✓ Email xác nhận đã được gửi đến {bookingData.email}</p>
              <p>⏳ Chờ chủ sân xác nhận (2-24 giờ)</p>
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg mb-8 text-left">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Bước tiếp theo:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Kiểm tra email để xem chi tiết đặt sân</li>
              <li>• Chờ email xác nhận từ chủ sân</li>
              <li>• Có thể kiểm tra trạng thái đơn trong "Đơn đặt sân của tôi"</li>
              <li>• Liên hệ hỗ trợ nếu không nhận được xác nhận sau 24h</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/" className="w-full">
              <Button variant="outline" className="w-full bg-transparent">
                <Home className="w-4 h-4 mr-2" />
                Về trang chủ
              </Button>
            </Link>

            <Link href="/bookings" className="w-full">
              <Button className="w-full">
                <Calendar className="w-4 h-4 mr-2" />
                Xem đơn đặt sân
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  )
}
