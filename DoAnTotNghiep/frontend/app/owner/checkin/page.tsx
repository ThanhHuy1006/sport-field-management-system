"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Keyboard,
  History,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/api-client"

type PaymentMethod = "ONSITE" | "BANK_TRANSFER" | "VNPAY" | "MOMO" | "ZALOPAY" | null

type OwnerBookingDetail = {
  id: number
  field_id: number
  user_id: number
  start_datetime: string
  end_datetime: string
  status: string
  notes: string | null
  approval_mode_snapshot?: "AUTO" | "MANUAL" | null
  requested_payment_method?: PaymentMethod
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  total_price: string | number
  checked_in_at: string | null
  checked_in_by: number | null
  checkin_method: string | null
  created_at: string
  field: {
    id: number
    field_name: string | null
    address: string | null
    sport_type: string | null
  } | null
  user: {
    id: number
    name: string | null
    email: string | null
    phone: string | null
  } | null
}

type OwnerBookingResponse = {
  success: boolean
  message: string
  data: OwnerBookingDetail
}

type OwnerBookingsResponse = {
  success: boolean
  message: string
  data:
    | OwnerBookingDetail[]
    | {
        items?: OwnerBookingDetail[]
        pagination?: {
          page?: number
          limit?: number
          total?: number
          totalPages?: number
          total_pages?: number
        }
      }
}

type CheckinResult = "success" | "error" | "already" | "completed" | null

type CheckinHistoryItem = {
  bookingRef: string
  customerName: string
  time: string
  fieldName: string
}

const onlinePaymentMethods = ["BANK_TRANSFER", "VNPAY", "MOMO", "ZALOPAY"]

async function getOwnerBookings(params?: { page?: number; limit?: number; status?: string }) {
  const searchParams = new URLSearchParams()

  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("limit", String(params?.limit ?? 50))

  if (params?.status) {
    searchParams.set("status", params.status)
  }

  return apiRequest<OwnerBookingsResponse>(`/owner/bookings?${searchParams.toString()}`, {
    method: "GET",
    requireAuth: true,
  })
}

async function getOwnerBookingDetail(bookingId: number) {
  return apiRequest<OwnerBookingResponse>(`/owner/bookings/${bookingId}`, {
    method: "GET",
    requireAuth: true,
  })
}

async function verifyOwnerBookingQr(qrToken: string) {
  return apiRequest<OwnerBookingResponse>("/owner/bookings/check-in/verify", {
    method: "POST",
    body: JSON.stringify({
      qr_token: qrToken,
    }),
    requireAuth: true,
  })
}

async function scanOwnerBookingQr(qrToken: string) {
  return apiRequest<OwnerBookingResponse>("/owner/bookings/check-in/scan", {
    method: "POST",
    body: JSON.stringify({
      qr_token: qrToken,
    }),
    requireAuth: true,
  })
}

async function checkInOwnerBooking(bookingId: number) {
  return apiRequest<OwnerBookingResponse>(`/owner/bookings/${bookingId}/check-in`, {
    method: "PATCH",
    body: JSON.stringify({
      note: "Chủ sân xác nhận check-in thủ công",
    }),
    requireAuth: true,
  })
}

function extractOwnerBookings(response: OwnerBookingsResponse) {
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response.data?.items)) return response.data.items
  return []
}

function parseBookingId(value: string) {
  const trimmed = value.trim()

  if (!trimmed) return Number.NaN

  const directNumber = Number(trimmed)
  if (Number.isInteger(directNumber) && directNumber > 0) {
    return directNumber
  }

  const match = trimmed.match(/(\d+)\s*$/)
  if (!match) return Number.NaN

  const parsed = Number(match[1])
  return Number.isInteger(parsed) && parsed > 0 ? parsed : Number.NaN
}

function isToday(value: string) {
  const target = new Date(value)
  const now = new Date()

  if (Number.isNaN(target.getTime())) return false

  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  )
}

function getBookingRef(booking: OwnerBookingDetail) {
  return `BK-${String(booking.id).padStart(6, "0")}`
}

function getCustomerName(booking: OwnerBookingDetail) {
  return booking.contact_name || booking.user?.name || booking.user?.email || "Khách hàng"
}

function getCustomerPhone(booking: OwnerBookingDetail) {
  return booking.contact_phone || booking.user?.phone || "-"
}

function getFieldName(booking: OwnerBookingDetail) {
  return booking.field?.field_name || "Chưa cập nhật sân"
}

function getLocalDate(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("vi-VN")
}

function getStartTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "--:--"

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getDurationHours(startValue: string, endValue: string) {
  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  return Math.max(0, Math.round(hours * 10) / 10)
}

function getCheckedInTime(booking: OwnerBookingDetail) {
  if (!booking.checked_in_at) return ""

  const date = new Date(booking.checked_in_at)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function canCheckIn(booking: OwnerBookingDetail) {
  const status = String(booking.status || "").toUpperCase()

  if (status === "CHECKED_IN" || status === "COMPLETED") {
    return false
  }

  const paymentMethod = String(booking.requested_payment_method || "").toUpperCase()

  if (onlinePaymentMethods.includes(paymentMethod)) {
    return status === "PAID"
  }

  return status === "APPROVED" || status === "PAID"
}

function getPaymentMessage(booking: OwnerBookingDetail) {
  const paymentMethod = String(booking.requested_payment_method || "").toUpperCase()

  if (onlinePaymentMethods.includes(paymentMethod)) {
    return "Booking thanh toán online/chuyển khoản phải thanh toán thành công trước khi check-in."
  }

  return "Booking thanh toán tại sân phải được chủ sân xác nhận trước khi check-in."
}

export default function OwnerCheckinPage() {
  const [inputMethod, setInputMethod] = useState<"camera" | "manual">("manual")
  const [manualCode, setManualCode] = useState("")
  const [qrToken, setQrToken] = useState("")
  const [scanning, setScanning] = useState(false)
  const [todayBookings, setTodayBookings] = useState<OwnerBookingDetail[]>([])
  const [foundBooking, setFoundBooking] = useState<OwnerBookingDetail | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [checkinResult, setCheckinResult] = useState<CheckinResult>(null)
  const [checkinHistory, setCheckinHistory] = useState<CheckinHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scanTimerRef = useRef<number | null>(null)
  const hasScannedRef = useRef(false)

  const { toast } = useToast()

  const todayStats = {
    total: todayBookings.length,
    checkedIn: todayBookings.filter(
      (item) => item.status === "CHECKED_IN" || item.status === "COMPLETED",
    ).length,
    pending: todayBookings.filter((item) => canCheckIn(item)).length,
  }

  async function loadTodayBookings() {
    try {
      const res = await getOwnerBookings({
        page: 1,
        limit: 50,
      })

      const items = extractOwnerBookings(res).filter((item) => isToday(item.start_datetime))

      setTodayBookings(items)

      const history = items
        .filter((item) => item.status === "CHECKED_IN" || item.status === "COMPLETED")
        .sort((a, b) => {
          const timeA = new Date(a.checked_in_at || a.start_datetime).getTime()
          const timeB = new Date(b.checked_in_at || b.start_datetime).getTime()

          return timeB - timeA
        })
        .slice(0, 5)
        .map((booking) => ({
          bookingRef: getBookingRef(booking),
          customerName: getCustomerName(booking),
          time: getCheckedInTime(booking) || getStartTime(booking.start_datetime),
          fieldName: getFieldName(booking),
        }))

      setCheckinHistory(history)
    } catch (error) {
      setTodayBookings([])
      setCheckinHistory([])

      toast({
        title: "Không thể tải đơn hôm nay",
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra kết nối hoặc quyền chủ sân.",
        variant: "destructive",
      })
    }
  }

  async function loadBookingById(bookingId: number) {
    if (!bookingId || Number.isNaN(bookingId)) {
      toast({
        title: "Mã booking không hợp lệ",
        description: "Vui lòng nhập ID booking, ví dụ: 31 hoặc BK-000031.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)
      setQrToken("")

      const res = await getOwnerBookingDetail(bookingId)

      setFoundBooking(res.data)

      if (res.data.status === "CHECKED_IN") {
        setCheckinResult("already")
      } else if (res.data.status === "COMPLETED") {
        setCheckinResult("completed")
      } else {
        setCheckinResult(null)
      }

      setShowResultDialog(true)
    } catch (error) {
      setFoundBooking(null)

      toast({
        title: "Không tìm thấy booking",
        description: error instanceof Error ? error.message : "Mã đặt sân không tồn tại hoặc không thuộc sân của bạn.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleManualSearch = async () => {
    if (!manualCode.trim()) {
      toast({
        title: "Vui lòng nhập mã",
        description: "Nhập mã đặt sân để tìm kiếm",
        variant: "destructive",
      })
      return
    }

    const bookingId = parseBookingId(manualCode)
    await loadBookingById(bookingId)
  }

  async function handleScanQrToken(token: string) {
    const qrTokenValue = token.trim()

    if (!qrTokenValue) {
      toast({
        title: "QR không hợp lệ",
        description: "Không đọc được dữ liệu từ mã QR.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsLoading(true)

      const res = await verifyOwnerBookingQr(qrTokenValue)

      setQrToken(qrTokenValue)
      setFoundBooking(res.data)

      if (res.data.status === "CHECKED_IN") {
        setCheckinResult("already")
      } else if (res.data.status === "COMPLETED") {
        setCheckinResult("completed")
      } else {
        setCheckinResult(null)
      }

      setShowResultDialog(true)
    } catch (error) {
      setQrToken("")
      setFoundBooking(null)

      toast({
        title: "Quét QR thất bại",
        description:
          error instanceof Error
            ? error.message
            : "QR không hợp lệ, đã hết hạn hoặc không thuộc sân của bạn.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const stopCameraScanning = () => {
    if (scanTimerRef.current) {
      window.clearInterval(scanTimerRef.current)
      scanTimerRef.current = null
    }

    setScanning(false)
    hasScannedRef.current = false

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }

  const startCameraScanning = async () => {
    if (isLoading || isSubmitting || scanning) return

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        toast({
          title: "Không hỗ trợ camera",
          description: "Trình duyệt hiện tại không hỗ trợ truy cập camera.",
          variant: "destructive",
        })
        return
      }

      const BarcodeDetectorCtor = (window as any).BarcodeDetector

      if (!BarcodeDetectorCtor) {
        toast({
          title: "Trình duyệt chưa hỗ trợ quét QR",
          description:
            "Vui lòng dùng Chrome/Edge bản mới hoặc dùng tab Nhập mã để check-in thủ công.",
          variant: "destructive",
        })
        return
      }

      const detector = new BarcodeDetectorCtor({
        formats: ["qr_code"],
      })

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })

      streamRef.current = stream
      setScanning(true)
      hasScannedRef.current = false

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }

      scanTimerRef.current = window.setInterval(async () => {
        if (!videoRef.current || hasScannedRef.current) return

        try {
          const codes = await detector.detect(videoRef.current)

          if (!codes?.length) return

          const decodedText = String(codes[0]?.rawValue || "").trim()

          if (!decodedText) return

          hasScannedRef.current = true
          stopCameraScanning()
          await handleScanQrToken(decodedText)
        } catch {
          // Không toast liên tục trong lúc camera đang quét.
        }
      }, 500)
    } catch (error) {
      stopCameraScanning()

      toast({
        title: "Không thể truy cập camera",
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng cho phép truy cập camera để quét QR.",
        variant: "destructive",
      })
    }
  }

  const handleCheckin = async () => {
    if (!foundBooking) return

    if (!canCheckIn(foundBooking)) {
      toast({
        title: "Không thể check-in",
        description: getPaymentMessage(foundBooking),
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)

      const res = qrToken
        ? await scanOwnerBookingQr(qrToken)
        : await checkInOwnerBooking(foundBooking.id)

      setFoundBooking(res.data)
      setCheckinResult("success")

      setCheckinHistory((prev) => [
        {
          bookingRef: getBookingRef(res.data),
          customerName: getCustomerName(res.data),
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          fieldName: getFieldName(res.data),
        },
        ...prev.slice(0, 4),
      ])

      await loadTodayBookings()

      toast({
        title: "Check-in thành công",
        description: `${getCustomerName(res.data)} đã check-in tại ${getFieldName(res.data)}`,
      })
    } catch (error) {
      setCheckinResult("error")

      toast({
        title: "Check-in thất bại",
        description: error instanceof Error ? error.message : "Không thể check-in đơn đặt sân.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    void loadTodayBookings()

    return () => {
      stopCameraScanning()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pendingBookings = todayBookings.filter((booking) => canCheckIn(booking))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Check-in Khách Hàng</h1>
        <p className="text-muted-foreground mt-1">Quét mã QR hoặc nhập mã đặt sân để check-in</p>
      </div>

      {/* Today Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đơn hôm nay</p>
              <p className="text-2xl font-bold">{todayStats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã check-in</p>
              <p className="text-2xl font-bold">{todayStats.checkedIn}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ check-in</p>
              <p className="text-2xl font-bold">{todayStats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Check-in Methods */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Phương thức Check-in</h2>

          {/* Method Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={inputMethod === "camera" ? "default" : "outline"}
              onClick={() => setInputMethod("camera")}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Quét QR
            </Button>
            <Button
              variant={inputMethod === "manual" ? "default" : "outline"}
              onClick={() => setInputMethod("manual")}
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Nhập mã
            </Button>
          </div>

          {/* Camera Scanner */}
          {inputMethod === "camera" && (
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {scanning ? (
                  <>
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    {/* Scan overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                        {/* Scanning line animation */}
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-pulse" />
                      </div>
                    </div>
                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm">
                      Đang quét... Hướng camera vào mã QR
                    </p>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <QrCode className="w-16 h-16 mb-4" />
                    <p>Nhấn nút bên dưới để bắt đầu quét</p>
                  </div>
                )}
              </div>
              <Button
                className="w-full"
                size="lg"
                disabled={isLoading || isSubmitting}
                onClick={scanning ? stopCameraScanning : startCameraScanning}
              >
                {scanning ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Dừng quét
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Bắt đầu quét
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Manual Input */}
          {inputMethod === "manual" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bookingCode">Mã đặt sân</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="bookingCode"
                    placeholder="VD: 31 hoặc BK-000031"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        void handleManualSearch()
                      }
                    }}
                    className="flex-1"
                  />
                  <Button onClick={handleManualSearch} disabled={isLoading}>
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Tìm
                  </Button>
                </div>
              </div>

              {/* Quick access - Today's bookings */}
              <div>
                <p className="text-sm font-medium mb-2">Đơn hôm nay chờ check-in</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pendingBookings.length === 0 ? (
                    <div className="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                      Không có đơn nào đang chờ check-in.
                    </div>
                  ) : (
                    pendingBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition"
                        onClick={() => {
                          setQrToken("")
                          setFoundBooking(booking)
                          setCheckinResult(null)
                          setShowResultDialog(true)
                        }}
                      >
                        <div>
                          <p className="font-medium">{getCustomerName(booking)}</p>
                          <p className="text-sm text-muted-foreground">
                            {getFieldName(booking)} • {getStartTime(booking.start_datetime)}
                          </p>
                        </div>
                        <Badge variant="outline">{getBookingRef(booking)}</Badge>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Recent Check-ins */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Check-in gần đây</h2>
          </div>

          <div className="space-y-3">
            {checkinHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có check-in nào hôm nay</p>
              </div>
            ) : (
              checkinHistory.map((checkin, index) => (
                <div
                  key={`${checkin.bookingRef}-${index}`}
                  className="flex items-center justify-between p-4 bg-muted/50 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{checkin.customerName}</p>
                      <p className="text-sm text-muted-foreground">{checkin.fieldName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">{checkin.bookingRef}</p>
                    <p className="text-xs text-muted-foreground">{checkin.time}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Result Dialog */}
      <Dialog
        open={showResultDialog}
        onOpenChange={(open) => {
          setShowResultDialog(open)

          if (!open) {
            setFoundBooking(null)
            setCheckinResult(null)
            setQrToken("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {checkinResult === "success"
                ? "Check-in thành công"
                : checkinResult === "already"
                  ? "Đã check-in trước đó"
                  : checkinResult === "completed"
                    ? "Đơn đã hoàn tất"
                    : checkinResult === "error"
                      ? "Check-in thất bại"
                      : "Thông tin đặt sân"}
            </DialogTitle>
            <DialogDescription>
              {checkinResult === "success"
                ? "Khách hàng đã được check-in thành công"
                : checkinResult === "already"
                  ? "Đơn đặt sân này đã được check-in trước đó"
                  : checkinResult === "completed"
                    ? "Đơn đặt sân này đã hoàn tất"
                    : checkinResult === "error"
                      ? "Có lỗi xảy ra khi check-in"
                      : "Xác nhận thông tin và check-in khách hàng"}
            </DialogDescription>
          </DialogHeader>

          {foundBooking && (
            <div className="space-y-4 py-4">
              {/* Status indicator */}
              {checkinResult && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    checkinResult === "success"
                      ? "bg-green-500/10 border-green-500/30"
                      : checkinResult === "already" || checkinResult === "completed"
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  {checkinResult === "success" ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : checkinResult === "already" || checkinResult === "completed" ? (
                    <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {checkinResult === "success"
                        ? "Check-in hoàn tất"
                        : checkinResult === "already"
                          ? `Đã check-in${getCheckedInTime(foundBooking) ? ` lúc ${getCheckedInTime(foundBooking)}` : ""}`
                          : checkinResult === "completed"
                            ? "Đơn đã hoàn tất"
                            : "Không thể check-in"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {checkinResult === "success"
                        ? `Lúc ${new Date().toLocaleTimeString("vi-VN")}`
                        : checkinResult === "already"
                          ? "Khách hàng đã đến trước đó"
                          : checkinResult === "completed"
                            ? "Không thể check-in lại đơn đã hoàn tất"
                            : "Vui lòng thử lại"}
                    </p>
                  </div>
                </div>
              )}

              {/* Booking details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium text-foreground">{getCustomerName(foundBooking)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium text-foreground">{getCustomerPhone(foundBooking)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sân</p>
                    <p className="font-medium text-foreground">{getFieldName(foundBooking)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày</p>
                      <p className="font-medium text-foreground">{getLocalDate(foundBooking.start_datetime)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Giờ</p>
                      <p className="font-medium text-foreground">
                        {getStartTime(foundBooking.start_datetime)} ({getDurationHours(foundBooking.start_datetime, foundBooking.end_datetime)}h)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <span className="text-muted-foreground">Mã đặt sân</span>
                  <span className="font-mono font-bold text-foreground">{getBookingRef(foundBooking)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResultDialog(false)} disabled={isSubmitting}>
              Đóng
            </Button>
            {!checkinResult && foundBooking && canCheckIn(foundBooking) && (
              <Button
                onClick={handleCheckin}
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                )}
                Xác nhận Check-in
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
