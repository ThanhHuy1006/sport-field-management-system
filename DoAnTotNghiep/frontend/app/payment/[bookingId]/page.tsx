"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Building2, Copy, Check, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function PaymentPage({ params }: { params: { bookingId: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [copied, setCopied] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(`booking-${params.bookingId}`)
      if (stored) {
        setBookingData(JSON.parse(stored))
      }
    }
  }, [params.bookingId])

  if (!bookingData) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thông tin đặt sân...</p>
        </div>
      </main>
    )
  }

  const bankDetails = {
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountName: "CÔNG TY TNHH ĐẶT SÂN",
    transferContent: `DATSANBK${params.bookingId}`,
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    toast({
      title: "Đã sao chép",
      description: `${field} đã được sao chép`,
    })
    setTimeout(() => setCopied(null), 2000)
  }

  const handleConfirmPayment = () => {
    setConfirmed(true)
    if (typeof window !== "undefined") {
      const updated = { ...bookingData, status: "pending_confirmation" }
      localStorage.setItem(`booking-${params.bookingId}`, JSON.stringify(updated))
    }
    setTimeout(() => {
      router.push(`/payment/success?bookingId=${params.bookingId}`)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/bookings" className="text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Chuyển khoản ngân hàng</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Bank Transfer Info */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Thông tin chuyển khoản</h2>
                  <p className="text-sm text-muted-foreground">Chuyển khoản theo thông tin bên dưới</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Ngân hàng</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.bankName, "Tên ngân hàng")}
                      className="h-8"
                    >
                      {copied === "Tên ngân hàng" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="font-bold text-lg">{bankDetails.bankName}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Số tài khoản</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountNumber, "Số tài khoản")}
                      className="h-8"
                    >
                      {copied === "Số tài khoản" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="font-bold text-lg font-mono">{bankDetails.accountNumber}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Chủ tài khoản</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.accountName, "Chủ tài khoản")}
                      className="h-8"
                    >
                      {copied === "Chủ tài khoản" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </Button>
                  </div>
                  <p className="font-bold text-lg">{bankDetails.accountName}</p>
                </div>

                <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-primary">Nội dung chuyển khoản (Bắt buộc)</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(bankDetails.transferContent, "Nội dung chuyển khoản")}
                      className="h-8"
                    >
                      {copied === "Nội dung chuyển khoản" ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <Copy className="w-4 h-4 text-primary" />
                      )}
                    </Button>
                  </div>
                  <p className="font-bold text-xl font-mono text-primary">{bankDetails.transferContent}</p>
                </div>

                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Số tiền</span>
                  </div>
                  <p className="font-bold text-2xl text-primary">{bookingData.totalAmount.toLocaleString()} ₫</p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-2">Lưu ý quan trọng:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li>Vui lòng chuyển ĐÚNG nội dung để hệ thống tự động xác nhận</li>
                      <li>Đơn đặt sân sẽ được xác nhận sau khi chúng tôi nhận được tiền (1-5 phút)</li>
                      <li>Nếu sau 24h chưa nhận được xác nhận, vui lòng liên hệ hỗ trợ</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button onClick={handleConfirmPayment} className="w-full" size="lg" disabled={confirmed}>
                {confirmed ? "Đang xử lý..." : "Tôi đã chuyển khoản"}
              </Button>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="font-bold mb-4">Chi tiết đơn hàng</h3>

              <div className="space-y-3 pb-4 border-b border-border mb-4 text-sm">
                <div>
                  <p className="font-medium text-foreground mb-1">{bookingData.fieldName}</p>
                  <p className="text-muted-foreground text-xs">Mã: {bookingData.bookingId}</p>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày & Giờ</span>
                  <span className="font-medium text-right">
                    {bookingData.date}
                    <br />
                    {bookingData.time}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium">{bookingData.duration} giờ</span>
                </div>
              </div>

              <div className="space-y-2 pb-4 border-b border-border mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">{(bookingData.totalAmount - 50000).toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-medium">50,000 ₫</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold">Tổng cộng</span>
                <span className="text-xl font-bold text-primary">{bookingData.totalAmount.toLocaleString()} ₫</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
