"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
  Camera,
  CheckCircle2,
  CircleX,
  Clock,
  History,
  Keyboard,
  Loader2,
  MapPin,
  Phone,
  QrCode,
  RefreshCcw,
  Search,
  User,
  Wallet,
} from "lucide-react"

import { apiRequest } from "@/lib/api-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type OwnerBookingDetail = {
  id: number
  field_id: number
  user_id: number
  start_datetime: string
  end_datetime: string
  status: string
  notes: string | null

  approval_mode_snapshot?: "AUTO" | "MANUAL" | null
  requested_payment_method?:
    | "ONSITE"
    | "BANK_TRANSFER"
    | "VNPAY"
    | "MOMO"
    | "ZALOPAY"
    | null

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

  status_history?: Array<{
    id: number
    from_status: string | null
    to_status: string
    changed_at: string
    reason: string | null
  }>
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

type CheckinResult = "success" | "already" | "completed" | null

const QR_READER_ID = "owner-checkin-qr-reader"

function extractBookings(response: OwnerBookingsResponse): OwnerBookingDetail[] {
  if (Array.isArray(response.data)) return response.data
  if (Array.isArray(response.data?.items)) return response.data.items
  return []
}

function getLocalDateKey(value?: string | Date | null) {
  if (!value) return ""

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "-"

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function formatTime(value?: string | null) {
  if (!value) return "--:--"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "--:--"

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })
}

function getDurationHours(startValue?: string | null, endValue?: string | null) {
  if (!startValue || !endValue) return 0

  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0

  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  return Math.max(0, Math.round(hours * 100) / 100)
}

function formatCurrency(value: string | number | null | undefined) {
  const amount = Number(value ?? 0)

  if (!Number.isFinite(amount)) return "0 ₫"

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount)
}

function parseBookingId(value: string) {
  const trimmed = value.trim()

  if (!trimmed) return null

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed)
  }

  const digits = trimmed.replace(/\D/g, "")

  if (!digits) return null

  return Number(digits)
}

function getStatusLabel(status?: string | null) {
  switch (String(status || "").toUpperCase()) {
    case "PENDING_CONFIRM":
      return "Chờ xác nhận"
    case "APPROVED":
      return "Đã duyệt"
    case "AWAITING_PAYMENT":
      return "Chờ thanh toán"
    case "PAID":
      return "Đã thanh toán"
    case "CHECKED_IN":
      return "Đã check-in"
    case "COMPLETED":
      return "Hoàn thành"
    case "REJECTED":
      return "Đã từ chối"
    case "CANCELLED":
      return "Đã hủy"
    case "PAY_FAILED":
      return "Thanh toán thất bại"
    case "PAYMENT_EXPIRED":
      return "Quá hạn thanh toán"
    case "NO_SHOW":
      return "Khách không đến"
    default:
      return status || "Không xác định"
  }
}

function getPaymentMethodLabel(method?: OwnerBookingDetail["requested_payment_method"]) {
  switch (method) {
    case "ONSITE":
      return "Thanh toán tại sân"
    case "BANK_TRANSFER":
      return "Chuyển khoản ngân hàng"
    case "VNPAY":
      return "VNPay"
    case "MOMO":
      return "MoMo"
    case "ZALOPAY":
      return "ZaloPay"
    default:
      return "Không xác định"
  }
}

function getCustomerName(booking: OwnerBookingDetail) {
  return booking.contact_name || booking.user?.name || booking.user?.email || "Khách hàng"
}

function getCustomerPhone(booking: OwnerBookingDetail) {
  return booking.contact_phone || booking.user?.phone || "-"
}

function canCheckIn(booking: OwnerBookingDetail) {
  const status = String(booking.status || "").toUpperCase()

  if (status === "CHECKED_IN" || status === "COMPLETED") {
    return false
  }

  const method = String(booking.requested_payment_method || "").toUpperCase()
  const onlinePaymentMethods = ["BANK_TRANSFER", "VNPAY", "MOMO", "ZALOPAY"]

  if (onlinePaymentMethods.includes(method)) {
    return status === "PAID"
  }

  // Với thanh toán tại sân hoặc backend chưa trả requested_payment_method:
  // APPROVED là đủ điều kiện check-in.
  return status === "APPROVED" || status === "PAID"
}

async function getOwnerBookings(params?: {
  page?: number
  limit?: number
  status?: string
}) {
  const searchParams = new URLSearchParams()

  searchParams.set("page", String(params?.page ?? 1))
  searchParams.set("limit", String(params?.limit ?? 50))

  if (params?.status) {
    searchParams.set("status", params.status)
  }

  return apiRequest<OwnerBookingsResponse>(
    `/owner/bookings?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    },
  )
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
  return apiRequest<OwnerBookingResponse>(
    `/owner/bookings/${bookingId}/check-in`,
    {
      method: "PATCH",
      body: JSON.stringify({
        note: "Chủ sân xác nhận check-in thủ công",
      }),
      requireAuth: true,
    },
  )
}

export default function OwnerCheckinPage() {
  const [activeTab, setActiveTab] = useState("qr")
  const [bookingCode, setBookingCode] = useState("")
  const [bookings, setBookings] = useState<OwnerBookingDetail[]>([])
  const [foundBooking, setFoundBooking] = useState<OwnerBookingDetail | null>(null)
  const [qrToken, setQrToken] = useState("")
  const [checkinResult, setCheckinResult] = useState<CheckinResult>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const [scanning, setScanning] = useState(false)
  const [showResultDialog, setShowResultDialog] = useState(false)

  const qrScannerRef = useRef<any>(null)
  const hasScannedRef = useRef(false)

  const todayKey = getLocalDateKey(new Date())

  const todayBookings = useMemo(
    () =>
      bookings.filter(
        (booking) => getLocalDateKey(booking.start_datetime) === todayKey,
      ),
    [bookings, todayKey],
  )

  const pendingTodayBookings = useMemo(
    () =>
      todayBookings.filter(
        (booking) =>
          canCheckIn(booking) &&
          !booking.checked_in_at &&
          !["CHECKED_IN", "COMPLETED"].includes(
            String(booking.status || "").toUpperCase(),
          ),
      ),
    [todayBookings],
  )

  const recentCheckins = useMemo(
    () =>
      bookings
        .filter((booking) => {
          const status = String(booking.status || "").toUpperCase()
          return status === "CHECKED_IN" || status === "COMPLETED"
        })
        .sort((a, b) => {
          const aTime = new Date(a.checked_in_at || a.created_at).getTime()
          const bTime = new Date(b.checked_in_at || b.created_at).getTime()

          return bTime - aTime
        })
        .slice(0, 6),
    [bookings],
  )

  const checkedInTodayCount = useMemo(
    () =>
      todayBookings.filter((booking) => {
        const status = String(booking.status || "").toUpperCase()
        return status === "CHECKED_IN" || status === "COMPLETED"
      }).length,
    [todayBookings],
  )

  const loadTodayBookings = async () => {
    try {
      setIsPageLoading(true)
      setErrorMessage("")

      const response = await getOwnerBookings({
        page: 1,
        limit: 50,
      })

      setBookings(extractBookings(response))
    } catch (error) {
      console.error("Load owner bookings error:", error)

      setBookings([])
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đặt sân hôm nay.",
      )
    } finally {
      setIsPageLoading(false)
    }
  }

  const stopCameraScanning = async () => {
    try {
      if (qrScannerRef.current) {
        if (qrScannerRef.current.isScanning) {
          await qrScannerRef.current.stop()
        }

        qrScannerRef.current.clear()
        qrScannerRef.current = null
      }
    } catch (error) {
      console.error("Stop QR scanner error:", error)
    } finally {
      setScanning(false)
    }
  }

  const handleScanQrToken = async (token: string) => {
    const qrTokenValue = token.trim()

    if (!qrTokenValue) {
      setErrorMessage("Không đọc được dữ liệu từ mã QR.")
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage("")

      const response = await verifyOwnerBookingQr(qrTokenValue)

      setQrToken(qrTokenValue)
      setFoundBooking(response.data)

      if (response.data.status === "CHECKED_IN") {
        setCheckinResult("already")
      } else if (response.data.status === "COMPLETED") {
        setCheckinResult("completed")
      } else {
        setCheckinResult(null)
      }

      setShowResultDialog(true)
    } catch (error) {
      console.error("Verify QR error:", error)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "QR không hợp lệ, đã hết hạn hoặc không thuộc sân của bạn.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const startCameraScanning = async () => {
    try {
      if (isLoading || isSubmitting) return

      if (typeof window === "undefined") return

      setErrorMessage("")
      setScanning(true)
      hasScannedRef.current = false

      // Đợi React render div #owner-checkin-qr-reader xong rồi mới start camera.
      await new Promise((resolve) => setTimeout(resolve, 150))

      const readerElement = document.getElementById(QR_READER_ID)

      if (!readerElement) {
        setScanning(false)
        setErrorMessage("Không tìm thấy vùng quét QR. Vui lòng tải lại trang.")
        return
      }

      const { Html5Qrcode } = await import("html5-qrcode")

      if (qrScannerRef.current) {
        try {
          if (qrScannerRef.current.isScanning) {
            await qrScannerRef.current.stop()
          }
          qrScannerRef.current.clear()
        } catch {
          // Ignore old scanner cleanup error
        }

        qrScannerRef.current = null
      }

      const scanner = new Html5Qrcode(QR_READER_ID)
      qrScannerRef.current = scanner

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText: string) => {
          if (hasScannedRef.current) return

          hasScannedRef.current = true

          await stopCameraScanning()
          await handleScanQrToken(decodedText)
        },
        () => {
          // Không báo lỗi liên tục khi camera chưa nhận diện được QR.
        },
      )
    } catch (error) {
      console.error("Start QR scanner error:", error)

      setScanning(false)
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể mở camera. Vui lòng kiểm tra quyền camera hoặc chạy trên localhost/HTTPS.",
      )
    }
  }

  const handleManualSearch = async () => {
    const bookingId = parseBookingId(bookingCode)

    if (!bookingId) {
      setErrorMessage("Vui lòng nhập mã đặt sân hợp lệ.")
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage("")
      setQrToken("")
      setCheckinResult(null)

      const response = await getOwnerBookingDetail(bookingId)

      setFoundBooking(response.data)

      if (response.data.status === "CHECKED_IN") {
        setCheckinResult("already")
      } else if (response.data.status === "COMPLETED") {
        setCheckinResult("completed")
      } else {
        setCheckinResult(null)
      }

      setShowResultDialog(true)
    } catch (error) {
      console.error("Manual search booking error:", error)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không tìm thấy đặt sân hoặc đặt sân không thuộc quyền quản lý của bạn.",
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckin = async () => {
    if (!foundBooking) return

    try {
      setIsSubmitting(true)
      setErrorMessage("")

      const response = qrToken
        ? await scanOwnerBookingQr(qrToken)
        : await checkInOwnerBooking(foundBooking.id)

      setFoundBooking(response.data)
      setCheckinResult("success")

      await loadTodayBookings()
    } catch (error) {
      console.error("Check-in booking error:", error)

      setErrorMessage(
        error instanceof Error ? error.message : "Không thể check-in đặt sân.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const closeResultDialog = (open: boolean) => {
    setShowResultDialog(open)

    if (!open) {
      setFoundBooking(null)
      setCheckinResult(null)
      setQrToken("")
    }
  }

  useEffect(() => {
    void loadTodayBookings()
  }, [])

  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        try {
          if (qrScannerRef.current.isScanning) {
            void qrScannerRef.current.stop()
          }

          qrScannerRef.current.clear()
        } catch {
          // Ignore cleanup error
        }

        qrScannerRef.current = null
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Check-in</h1>
        <p className="text-muted-foreground">
          Quét mã QR hoặc nhập mã đặt sân để xác nhận khách hàng đến sân
        </p>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{errorMessage}</p>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setErrorMessage("")
                void loadTodayBookings()
              }}
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Thử lại
            </Button>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Đơn hôm nay
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{todayBookings.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Chờ check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-500">
              {pendingTodayBookings.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Đã check-in
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-500">
              {checkedInTodayCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Phương thức Check-in</CardTitle>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => {
                setActiveTab(value)
                setErrorMessage("")

                if (value !== "qr" && scanning) {
                  void stopCameraScanning()
                }
              }}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="qr" className="gap-2">
                  <Camera className="h-4 w-4" />
                  Quét QR
                </TabsTrigger>
                <TabsTrigger value="manual" className="gap-2">
                  <Keyboard className="h-4 w-4" />
                  Nhập mã
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qr" className="mt-6 space-y-4">
                <div className="relative flex min-h-[360px] items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/50">
                  {scanning ? (
                    <div id={QR_READER_ID} className="w-full min-h-[360px]" />
                  ) : (
                    <div className="flex flex-col items-center justify-center px-6 text-center text-muted-foreground">
                      <QrCode className="mb-4 h-16 w-16" />
                      <p>Nhấn nút bên dưới để bắt đầu quét</p>
                    </div>
                  )}
                </div>

                <Button
                  type="button"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || isSubmitting}
                  onClick={() => {
                    if (scanning) {
                      void stopCameraScanning()
                    } else {
                      void startCameraScanning()
                    }
                  }}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xác thực QR...
                    </>
                  ) : scanning ? (
                    <>
                      <CircleX className="mr-2 h-4 w-4" />
                      Dừng quét
                    </>
                  ) : (
                    <>
                      <Camera className="mr-2 h-4 w-4" />
                      Bắt đầu quét
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="manual" className="mt-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="booking-code">Mã đặt sân</Label>
                  <div className="flex gap-2">
                    <Input
                      id="booking-code"
                      placeholder="Nhập ID hoặc mã đặt sân, ví dụ: 31 hoặc BK-000031"
                      value={bookingCode}
                      onChange={(event) => setBookingCode(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          void handleManualSearch()
                        }
                      }}
                    />

                    <Button
                      type="button"
                      onClick={() => void handleManualSearch()}
                      disabled={isLoading || isSubmitting}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Check-in gần đây
            </CardTitle>
          </CardHeader>

          <CardContent>
            {isPageLoading ? (
              <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang tải...
              </div>
            ) : recentCheckins.length === 0 ? (
              <p className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
                Chưa có lượt check-in gần đây.
              </p>
            ) : (
              <div className="space-y-3">
                {recentCheckins.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border border-green-500/30 bg-green-500/5 p-3"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {getCustomerName(booking)}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {booking.field?.field_name || "Sân chưa cập nhật"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <p className="font-medium">BK-{String(booking.id).padStart(6, "0")}</p>
                      <p className="text-muted-foreground">
                        {formatTime(booking.checked_in_at || booking.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Đơn đặt sân hôm nay</CardTitle>
        </CardHeader>

        <CardContent>
          {isPageLoading ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang tải danh sách...
            </div>
          ) : todayBookings.length === 0 ? (
            <p className="rounded-lg border border-border px-4 py-6 text-center text-sm text-muted-foreground">
              Hôm nay chưa có đơn đặt sân.
            </p>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((booking) => {
                const isCheckedIn =
                  booking.status === "CHECKED_IN" || booking.status === "COMPLETED"

                return (
                  <div
                    key={booking.id}
                    className="flex flex-col gap-3 rounded-lg border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">
                          BK-{String(booking.id).padStart(6, "0")}
                        </p>
                        <Badge variant={isCheckedIn ? "default" : "secondary"}>
                          {getStatusLabel(booking.status)}
                        </Badge>
                      </div>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {getCustomerName(booking)} ·{" "}
                        {booking.field?.field_name || "Sân chưa cập nhật"}
                      </p>

                      <p className="mt-1 text-sm text-muted-foreground">
                        {formatTime(booking.start_datetime)} -{" "}
                        {formatTime(booking.end_datetime)}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      disabled={isCheckedIn || !canCheckIn(booking)}
                      onClick={() => {
                        setQrToken("")
                        setFoundBooking(booking)
                        setCheckinResult(isCheckedIn ? "already" : null)
                        setShowResultDialog(true)
                      }}
                    >
                      {isCheckedIn ? "Đã check-in" : "Xem / Check-in"}
                    </Button>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResultDialog} onOpenChange={closeResultDialog}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Thông tin đặt sân</DialogTitle>
            <DialogDescription>
              Xác nhận thông tin và check-in khách hàng
            </DialogDescription>
          </DialogHeader>

          {foundBooking && (
            <div className="space-y-4">
              {checkinResult === "success" && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-600">
                  Check-in thành công.
                </div>
              )}

              {checkinResult === "already" && (
                <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-sm text-yellow-600">
                  Đơn này đã được check-in trước đó.
                </div>
              )}

              {checkinResult === "completed" && (
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm text-blue-600">
                  Đơn này đã hoàn thành.
                </div>
              )}

              <div className="grid gap-3">
                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <User className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-semibold">{getCustomerName(foundBooking)}</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <Phone className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-semibold">{getCustomerPhone(foundBooking)}</p>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <MapPin className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sân</p>
                    <p className="font-semibold">
                      {foundBooking.field?.field_name || "Sân chưa cập nhật"}
                    </p>
                    {foundBooking.field?.address && (
                      <p className="text-sm text-muted-foreground">
                        {foundBooking.field.address}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <div className="flex gap-3 rounded-lg border border-border p-3">
                    <Clock className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày</p>
                      <p className="font-semibold">
                        {formatDate(foundBooking.start_datetime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 rounded-lg border border-border p-3">
                    <Clock className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Giờ</p>
                      <p className="font-semibold">
                        {formatTime(foundBooking.start_datetime)} -{" "}
                        {formatTime(foundBooking.end_datetime)} (
                        {getDurationHours(
                          foundBooking.start_datetime,
                          foundBooking.end_datetime,
                        )}
                        h)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 rounded-lg border border-border p-3">
                  <Wallet className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thanh toán</p>
                    <p className="font-semibold">
                      {getPaymentMethodLabel(foundBooking.requested_payment_method)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Tổng tiền: {formatCurrency(foundBooking.total_price)}
                    </p>
                  </div>
                </div>

                <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Mã đặt sân</span>
                    <span className="font-mono font-semibold">
                      BK-{String(foundBooking.id).padStart(6, "0")}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => closeResultDialog(false)}
                >
                  Đóng
                </Button>

                <Button
                  type="button"
                  disabled={
                    isSubmitting ||
                    checkinResult === "success" ||
                    checkinResult === "already" ||
                    checkinResult === "completed" ||
                    !canCheckIn(foundBooking)
                  }
                  onClick={() => void handleCheckin()}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang check-in...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Xác nhận Check-in
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
