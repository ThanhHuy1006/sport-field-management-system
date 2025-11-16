"use client"

import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { XCircle, RefreshCw, Home, HelpCircle } from "lucide-react"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingId = searchParams.get("bookingId")

  const handleRetry = () => {
    if (bookingId) {
      router.push(`/payment/${bookingId}`)
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="max-w-2xl w-full p-8 md:p-12">
        <div className="text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>

          {/* Error Message */}
          <h1 className="text-3xl font-bold text-foreground mb-3">Thanh toán thất bại</h1>
          <p className="text-muted-foreground mb-8">
            Giao dịch của bạn không thể hoàn tất. Vui lòng thử lại hoặc liên hệ hỗ trợ.
          </p>

          {/* Error Details */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-6 rounded-lg mb-8 text-left">
            <h3 className="font-semibold text-red-900 dark:text-red-100 mb-3">Lý do có thể:</h3>
            <ul className="text-sm text-red-800 dark:text-red-200 space-y-2">
              <li>• Thông tin thẻ không chính xác</li>
              <li>• Số dư tài khoản không đủ</li>
              <li>• Thẻ đã hết hạn hoặc bị khóa</li>
              <li>• Ngân hàng từ chối giao dịch</li>
              <li>• Lỗi kết nối mạng</li>
            </ul>
          </div>

          {/* Booking Reference */}
          {bookingId && (
            <div className="bg-muted p-4 rounded-lg mb-8">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">Mã đặt sân</span>
                <span className="font-bold">{bookingId}</span>
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg mb-8 text-left">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Đề xuất:</h3>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Kiểm tra lại thông tin thẻ và thử lại</li>
              <li>• Sử dụng phương thức thanh toán khác</li>
              <li>• Liên hệ ngân hàng để xác nhận tình trạng thẻ</li>
              <li>• Liên hệ hỗ trợ khách hàng nếu vấn đề vẫn tiếp diễn</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Trang chủ
              </Link>
            </Button>

            <Button variant="outline" className="w-full bg-transparent" asChild>
              <Link href="/contact">
                <HelpCircle className="w-4 h-4 mr-2" />
                Liên hệ hỗ trợ
              </Link>
            </Button>

            <Button className="w-full" onClick={handleRetry}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </div>
      </Card>
    </main>
  )
}
