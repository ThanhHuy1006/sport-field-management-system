"use client"

import { useState, useRef, useEffect } from "react"
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
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface BookingInfo {
  id: number
  bookingRef: string
  customerName: string
  customerPhone: string
  fieldName: string
  date: string
  time: string
  duration: number
  price: number
  status: "confirmed" | "checked_in" | "completed"
}

// Mock data for demo
const mockBookings: BookingInfo[] = [
  {
    id: 1,
    bookingRef: "BK-2025-001233",
    customerName: "Nguyễn Văn An",
    customerPhone: "0901234567",
    fieldName: "Sân Bóng Đá Mini 1",
    date: "2025-01-09",
    time: "18:00",
    duration: 2,
    price: 500000,
    status: "confirmed",
  },
  {
    id: 2,
    bookingRef: "BK-2025-001234",
    customerName: "Trần Thị Bình",
    customerPhone: "0912345678",
    fieldName: "Sân Cầu Lông A",
    date: "2025-01-09",
    time: "14:00",
    duration: 1,
    price: 200000,
    status: "confirmed",
  },
  {
    id: 3,
    bookingRef: "BK-2025-001235",
    customerName: "Lê Văn Cường",
    customerPhone: "0923456789",
    fieldName: "Sân Tennis Pro",
    date: "2025-01-09",
    time: "16:00",
    duration: 2,
    price: 700000,
    status: "checked_in",
  },
]

const recentCheckins = [
  { bookingRef: "BK-2025-001235", customerName: "Lê Văn Cường", time: "15:55", fieldName: "Sân Tennis Pro" },
  { bookingRef: "BK-2025-001230", customerName: "Phạm Minh Đức", time: "14:02", fieldName: "Sân Bóng Đá Mini 2" },
  { bookingRef: "BK-2025-001228", customerName: "Hoàng Thu Hà", time: "10:58", fieldName: "Sân Cầu Lông B" },
]

export default function OwnerCheckinPage() {
  const [inputMethod, setInputMethod] = useState<"camera" | "manual">("manual")
  const [manualCode, setManualCode] = useState("")
  const [scanning, setScanning] = useState(false)
  const [foundBooking, setFoundBooking] = useState<BookingInfo | null>(null)
  const [showResultDialog, setShowResultDialog] = useState(false)
  const [checkinResult, setCheckinResult] = useState<"success" | "error" | "already" | null>(null)
  const [checkinHistory, setCheckinHistory] = useState(recentCheckins)
  const videoRef = useRef<HTMLVideoElement>(null)
  const { toast } = useToast()

  // Stats for today
  const todayStats = {
    total: 12,
    checkedIn: 5,
    pending: 7,
  }

  const handleManualSearch = () => {
    if (!manualCode.trim()) {
      toast({
        title: "Vui lòng nhập mã",
        description: "Nhập mã đặt sân để tìm kiếm",
        variant: "destructive",
      })
      return
    }

    // Search in mock data
    const booking = mockBookings.find((b) => b.bookingRef.toLowerCase() === manualCode.trim().toLowerCase())

    if (booking) {
      setFoundBooking(booking)
      if (booking.status === "checked_in") {
        setCheckinResult("already")
      } else {
        setCheckinResult(null)
      }
      setShowResultDialog(true)
    } else {
      toast({
        title: "Không tìm thấy",
        description: "Mã đặt sân không tồn tại hoặc không hợp lệ",
        variant: "destructive",
      })
    }
  }

  const handleCheckin = () => {
    if (!foundBooking) return

    // Simulate check-in
    setCheckinResult("success")

    // Add to history
    setCheckinHistory([
      {
        bookingRef: foundBooking.bookingRef,
        customerName: foundBooking.customerName,
        time: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        fieldName: foundBooking.fieldName,
      },
      ...checkinHistory.slice(0, 4),
    ])

    toast({
      title: "Check-in thành công",
      description: `${foundBooking.customerName} đã check-in tại ${foundBooking.fieldName}`,
    })
  }

  const startCameraScanning = async () => {
    setScanning(true)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
      }
    } catch (error) {
      toast({
        title: "Không thể truy cập camera",
        description: "Vui lòng cho phép truy cập camera để quét QR",
        variant: "destructive",
      })
      setScanning(false)
    }
  }

  const stopCameraScanning = () => {
    setScanning(false)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
  }

  // Simulate QR scan detection
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        // Simulate finding a QR code
        const booking = mockBookings[0]
        stopCameraScanning()
        setFoundBooking(booking)
        setCheckinResult(null)
        setShowResultDialog(true)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [scanning])

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
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
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
              <Button className="w-full" size="lg" onClick={scanning ? stopCameraScanning : startCameraScanning}>
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
                    placeholder="VD: BK-2025-001234"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleManualSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleManualSearch}>
                    <Search className="w-4 h-4 mr-2" />
                    Tìm
                  </Button>
                </div>
              </div>

              {/* Quick access - Today's bookings */}
              <div>
                <p className="text-sm font-medium mb-2">Đơn hôm nay chờ check-in</p>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {mockBookings
                    .filter((b) => b.status === "confirmed")
                    .map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition"
                        onClick={() => {
                          setFoundBooking(booking)
                          setCheckinResult(null)
                          setShowResultDialog(true)
                        }}
                      >
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.fieldName} • {booking.time}
                          </p>
                        </div>
                        <Badge variant="outline">{booking.bookingRef}</Badge>
                      </div>
                    ))}
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
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {checkinResult === "success"
                ? "Check-in thành công"
                : checkinResult === "already"
                  ? "Đã check-in trước đó"
                  : checkinResult === "error"
                    ? "Check-in thất bại"
                    : "Thông tin đặt sân"}
            </DialogTitle>
            <DialogDescription>
              {checkinResult === "success"
                ? "Khách hàng đã được check-in thành công"
                : checkinResult === "already"
                  ? "Đơn đặt sân này đã được check-in trước đó"
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
                      : checkinResult === "already"
                        ? "bg-yellow-500/10 border-yellow-500/30"
                        : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  {checkinResult === "success" ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : checkinResult === "already" ? (
                    <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">
                      {checkinResult === "success"
                        ? "Check-in hoàn tất"
                        : checkinResult === "already"
                          ? "Đã check-in lúc 15:55"
                          : "Không thể check-in"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {checkinResult === "success"
                        ? `Lúc ${new Date().toLocaleTimeString("vi-VN")}`
                        : checkinResult === "already"
                          ? "Khách hàng đã đến trước đó"
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
                    <p className="font-medium text-foreground">{foundBooking.customerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium text-foreground">{foundBooking.customerPhone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sân</p>
                    <p className="font-medium text-foreground">{foundBooking.fieldName}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày</p>
                      <p className="font-medium text-foreground">{foundBooking.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Giờ</p>
                      <p className="font-medium text-foreground">
                        {foundBooking.time} ({foundBooking.duration}h)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <span className="text-muted-foreground">Mã đặt sân</span>
                  <span className="font-mono font-bold text-foreground">{foundBooking.bookingRef}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowResultDialog(false)}>
              Đóng
            </Button>
            {!checkinResult && foundBooking?.status === "confirmed" && (
              <Button onClick={handleCheckin} className="bg-green-600 hover:bg-green-700">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Xác nhận Check-in
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
