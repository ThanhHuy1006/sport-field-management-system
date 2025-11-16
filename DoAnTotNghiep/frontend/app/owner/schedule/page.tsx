"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  User,
  ArrowLeft,
  DollarSign,
  Download,
  Printer,
  Phone,
  CheckCircle2,
  XCircle,
  Eye,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"

// Mock data
const fields = [
  { id: 1, name: "Sân Bóng Đá Thảo Điền", type: "Football", price: 300000 },
  { id: 2, name: "Sân Bóng Rổ Quận 7", type: "Basketball", price: 200000 },
  { id: 3, name: "Sân Tennis Bình Thạnh", type: "Tennis", price: 250000 },
]

const mockBookings = [
  {
    id: 1,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-01-20",
    startTime: "08:00",
    endTime: "10:00",
    customerName: "Nguyễn Văn A",
    customerEmail: "nguyenvana@email.com",
    customerPhone: "0901234567",
    status: "confirmed",
    duration: 2,
    price: 600000,
    notes: "Cần chuẩn bị bóng",
  },
  {
    id: 2,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-01-20",
    startTime: "14:00",
    endTime: "16:00",
    customerName: "Trần Thị B",
    customerEmail: "tranthib@email.com",
    customerPhone: "0912345678",
    status: "pending",
    duration: 2,
    price: 600000,
    notes: "",
  },
  {
    id: 3,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-01-20",
    startTime: "18:00",
    endTime: "20:00",
    customerName: "Lê Văn C",
    customerEmail: "levanc@email.com",
    customerPhone: "0923456789",
    status: "confirmed",
    duration: 2,
    price: 600000,
    notes: "",
  },
  {
    id: 4,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    date: "2025-01-20",
    startTime: "09:00",
    endTime: "11:00",
    customerName: "Phạm Văn D",
    customerEmail: "phamvand@email.com",
    customerPhone: "0934567890",
    status: "confirmed",
    duration: 2,
    price: 400000,
    notes: "",
  },
]

const timeSlots = [
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
  "22:00",
]

type Booking = (typeof mockBookings)[0]
type ViewMode = "day" | "week" | "list"

export default function OwnerSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedField, setSelectedField] = useState<string>("all")
  const [viewMode, setViewMode] = useState<ViewMode>("day")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const formatDateISO = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND"
  }

  const previousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesDate = booking.date === formatDateISO(selectedDate)
    const matchesField = selectedField === "all" || booking.fieldId === Number.parseInt(selectedField)
    return matchesDate && matchesField
  })

  const getBookingForSlot = (fieldId: number, time: string) => {
    return filteredBookings.find((b) => b.fieldId === fieldId && b.startTime === time)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "pending":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ duyệt"
      case "completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  const handleViewDetails = (booking: Booking) => {
    setSelectedBooking(booking)
    setShowDetails(true)
  }

  const handleApprove = (bookingId: number) => {
    console.log("[v0] Approving booking:", bookingId)
    setShowDetails(false)
  }

  const handleReject = (bookingId: number) => {
    console.log("[v0] Rejecting booking:", bookingId)
    setShowDetails(false)
  }

  const fieldsToShow = selectedField === "all" ? fields : fields.filter((f) => f.id === Number.parseInt(selectedField))

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.price, 0)
  const confirmedRevenue = filteredBookings.filter((b) => b.status === "confirmed").reduce((sum, b) => sum + b.price, 0)
  const pendingRevenue = filteredBookings.filter((b) => b.status === "pending").reduce((sum, b) => sum + b.price, 0)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/owner/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Lịch Đặt Sân</h1>
                <p className="text-sm text-muted-foreground">Theo dõi và quản lý lịch đặt sân chi tiết</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="w-4 h-4 mr-2" />
                In lịch
              </Button>
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousDay}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="min-w-[280px] text-center">
                <div className="font-semibold">{formatDate(selectedDate)}</div>
              </div>
              <Button variant="outline" size="icon" onClick={nextDay}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={goToToday}>
                Hôm nay
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)} className="w-auto">
                <TabsList>
                  <TabsTrigger value="day">Ngày</TabsTrigger>
                  <TabsTrigger value="week">Tuần</TabsTrigger>
                  <TabsTrigger value="list">Danh sách</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Chọn sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả sân</SelectItem>
                  {fields.map((field) => (
                    <SelectItem key={field.id} value={field.id.toString()}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng đặt sân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredBookings.length}</div>
              <p className="text-xs text-muted-foreground mt-1">slots</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đã xác nhận</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {filteredBookings.filter((b) => b.status === "confirmed").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(confirmedRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Chờ duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {filteredBookings.filter((b) => b.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{formatCurrency(pendingRevenue)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Slot trống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-muted-foreground">
                {fieldsToShow.length * timeSlots.length - filteredBookings.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">có thể đặt</p>
            </CardContent>
          </Card>
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-primary flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Doanh thu ngày
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground mt-1">từ {filteredBookings.length} bookings</p>
            </CardContent>
          </Card>
        </div>

        {viewMode === "day" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Lịch Chi Tiết - {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold bg-muted/50 sticky left-0 z-10 min-w-[100px]">Giờ</th>
                      {fieldsToShow.map((field) => (
                        <th key={field.id} className="text-left p-3 font-semibold bg-muted/50 min-w-[280px]">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-primary" />
                            <div>
                              <div className="font-semibold">{field.name}</div>
                              <div className="text-xs text-muted-foreground font-normal">
                                {field.type} • {formatCurrency(field.price)}/giờ
                              </div>
                            </div>
                          </div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {timeSlots.map((time) => (
                      <tr key={time} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {time}
                          </div>
                        </td>
                        {fieldsToShow.map((field) => {
                          const booking = getBookingForSlot(field.id, time)
                          return (
                            <td key={field.id} className="p-2">
                              {booking ? (
                                <div
                                  className={`p-3 rounded-lg border ${getStatusColor(booking.status)} transition-all hover:shadow-md cursor-pointer group relative`}
                                  onClick={() => handleViewDetails(booking)}
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <Badge variant="outline" className="text-xs">
                                      {getStatusText(booking.status)}
                                    </Badge>
                                    <span className="text-xs font-medium">
                                      {booking.startTime} - {booking.endTime}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                                    <User className="w-3.5 h-3.5" />
                                    {booking.customerName}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                                    <Phone className="w-3 h-3" />
                                    {booking.customerPhone}
                                  </div>
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/50">
                                    <span className="text-xs text-muted-foreground">{booking.duration}h</span>
                                    <span className="text-xs font-semibold text-primary">
                                      {formatCurrency(booking.price)}
                                    </span>
                                  </div>
                                  <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                </div>
                              ) : (
                                <div className="p-3 rounded-lg border border-dashed border-muted-foreground/20 text-center text-sm text-muted-foreground hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer">
                                  <div className="text-xs">Trống</div>
                                  <div className="text-xs mt-1 opacity-0 group-hover:opacity-100">+ Đặt sân</div>
                                </div>
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "list" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Danh Sách Đặt Sân - {formatDate(selectedDate)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Không có đặt sân nào trong ngày này</p>
                  </div>
                ) : (
                  filteredBookings.map((booking) => (
                    <Card key={booking.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                              <span className="font-semibold">
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  <MapPin className="w-4 h-4 text-muted-foreground" />
                                  <span className="font-medium">{booking.fieldName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm mb-2">
                                  <User className="w-4 h-4 text-muted-foreground" />
                                  <span>{booking.customerName}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                  <Phone className="w-4 h-4 text-muted-foreground" />
                                  <span>{booking.customerPhone}</span>
                                </div>
                              </div>

                              <div className="text-right">
                                <div className="text-sm text-muted-foreground mb-1">Thời lượng</div>
                                <div className="font-semibold mb-3">{booking.duration} giờ</div>
                                <div className="text-sm text-muted-foreground mb-1">Tổng tiền</div>
                                <div className="text-lg font-bold text-primary">{formatCurrency(booking.price)}</div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button size="sm" variant="outline" onClick={() => handleViewDetails(booking)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Chi tiết
                            </Button>
                            {booking.status === "pending" && (
                              <>
                                <Button size="sm" onClick={() => handleApprove(booking.id)}>
                                  <CheckCircle2 className="w-4 h-4 mr-2" />
                                  Duyệt
                                </Button>
                                <Button size="sm" variant="destructive" onClick={() => handleReject(booking.id)}>
                                  <XCircle className="w-4 h-4 mr-2" />
                                  Từ chối
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {booking.notes && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-start gap-2 text-sm">
                              <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                              <div>
                                <span className="font-medium">Ghi chú: </span>
                                <span className="text-muted-foreground">{booking.notes}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {viewMode === "week" && (
          <Card>
            <CardHeader>
              <CardTitle>Xem Theo Tuần</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Chế độ xem theo tuần đang được phát triển</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Legend */}
        <div className="mt-6 flex flex-wrap gap-4 items-center p-4 bg-muted/30 rounded-lg">
          <div className="text-sm font-semibold">Chú thích:</div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/20"></div>
            <span className="text-sm">Đã xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/20"></div>
            <span className="text-sm">Chờ duyệt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500/20 border border-blue-500/20"></div>
            <span className="text-sm">Hoàn thành</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-dashed border-muted-foreground/20"></div>
            <span className="text-sm">Slot trống</span>
          </div>
        </div>
      </div>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đặt Sân</DialogTitle>
            <DialogDescription>Thông tin chi tiết về đơn đặt sân #{selectedBooking?.id}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">Trạng thái</div>
                  <Badge className={getStatusColor(selectedBooking.status)}>
                    {getStatusText(selectedBooking.status)}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground mb-1">Tổng tiền</div>
                  <div className="text-2xl font-bold text-primary">{formatCurrency(selectedBooking.price)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-3">Thông tin sân</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedBooking.fieldName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                      <span>{new Date(selectedBooking.date).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedBooking.startTime} - {selectedBooking.endTime} ({selectedBooking.duration}h)
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Thông tin khách hàng</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedBooking.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a href={`tel:${selectedBooking.customerPhone}`} className="text-primary hover:underline">
                        {selectedBooking.customerPhone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <a href={`mailto:${selectedBooking.customerEmail}`} className="text-primary hover:underline">
                        {selectedBooking.customerEmail}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <div className="font-semibold text-orange-600 mb-1">Yêu cầu đặc biệt</div>
                      <p className="text-sm">{selectedBooking.notes}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex gap-2">
            {selectedBooking?.status === "pending" && (
              <>
                <Button variant="outline" onClick={() => setShowDetails(false)}>
                  Đóng
                </Button>
                <Button variant="destructive" onClick={() => handleReject(selectedBooking.id)}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button onClick={() => handleApprove(selectedBooking.id)}>
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Duyệt đơn
                </Button>
              </>
            )}
            {selectedBooking?.status !== "pending" && <Button onClick={() => setShowDetails(false)}>Đóng</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
