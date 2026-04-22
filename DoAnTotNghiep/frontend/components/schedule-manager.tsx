"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Calendar,
  Clock,
  MapPin,
  Phone,
  User,
  ChevronLeft,
  ChevronRight,
  List,
  LayoutGrid,
  Search,
  Download,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  DollarSign,
  Info,
} from "lucide-react"

// Types
export interface Booking {
  id: number
  fieldId: number
  fieldName: string
  customerName: string
  customerPhone: string
  date: string
  startTime: string
  endTime: string
  duration: number
  price: number
  status: "pending" | "confirmed" | "completed" | "rejected" | "pending_reschedule"
  ownerName?: string
  location?: string
  rejectionReason?: string
  rescheduleRequest?: {
    oldDate: string
    oldTime: string
    newDate: string
    newTime: string
    requestedAt: string
  }
}

export interface Field {
  id: number
  name: string
  type: string
  pricePerHour: number
  ownerName?: string
}

export interface Owner {
  id: number
  name: string
  fieldCount: number
}

interface ScheduleManagerProps {
  bookings: Booking[]
  fields: Field[]
  owners?: Owner[]
  isAdmin?: boolean
  onApprove?: (id: number) => void
  onReject?: (id: number, reason: string) => void
  onApproveReschedule?: (id: number) => void
  onRejectReschedule?: (id: number, reason: string) => void
}

const START_HOUR = 6
const END_HOUR = 23
const HOUR_HEIGHT = 80

export function ScheduleManager({
  bookings: initialBookings,
  fields,
  owners = [],
  isAdmin = false,
  onApprove,
  onReject,
  onApproveReschedule,
  onRejectReschedule,
}: ScheduleManagerProps) {
  const [bookings, setBookings] = useState(initialBookings)

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])
  const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedField, setSelectedField] = useState<string>("all")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [rejectDialog, setRejectDialog] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [rescheduleDialog, setRescheduleDialog] = useState<number | null>(null)
  const [rescheduleAction, setRescheduleAction] = useState<"approve" | "reject" | null>(null)

  // Date helpers
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

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesDate = viewMode === "timeline" ? booking.date === formatDateISO(selectedDate) : true
    const matchesField = selectedField === "all" || booking.fieldId === Number.parseInt(selectedField)
    const matchesOwner =
      selectedOwner === "all" || booking.ownerName === owners.find((o) => o.id.toString() === selectedOwner)?.name
    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending"
        ? booking.status === "pending" || booking.status === "pending_reschedule"
        : booking.status === selectedStatus)
    const matchesSearch =
      searchQuery === "" ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.includes(searchQuery)
    return matchesDate && matchesField && matchesOwner && matchesStatus && matchesSearch
  })

  // Stats
  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter((b) => b.status === "pending" || b.status === "pending_reschedule").length,
    confirmed: filteredBookings.filter((b) => b.status === "confirmed").length,
    completed: filteredBookings.filter((b) => b.status === "completed").length,
    rejected: filteredBookings.filter((b) => b.status === "rejected").length,
    revenue: filteredBookings
      .filter((b) => b.status === "confirmed" || b.status === "completed")
      .reduce((sum, b) => sum + b.price, 0),
  }

  // Timeline helpers
  const getBookingStyle = (booking: Booking) => {
    const startHour = Number.parseInt(booking.startTime.split(":")[0])
    const endHour = Number.parseInt(booking.endTime.split(":")[0])
    const duration = endHour - startHour
    const top = (startHour - START_HOUR) * HOUR_HEIGHT
    const height = duration * HOUR_HEIGHT - 4
    return { top, height }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "pending":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "pending_reschedule":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
      case "completed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "rejected":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 border-l-green-500 hover:bg-green-500/20"
      case "pending":
        return "bg-orange-500/10 border-l-orange-500 hover:bg-orange-500/20"
      case "pending_reschedule":
        return "bg-purple-500/10 border-l-purple-500 hover:bg-purple-500/20"
      case "completed":
        return "bg-blue-500/10 border-l-blue-500 hover:bg-blue-500/20"
      default:
        return "bg-gray-500/10 border-l-gray-500 hover:bg-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ duyệt"
      case "pending_reschedule":
        return "Yêu cầu đổi lịch"
      case "completed":
        return "Hoàn thành"
      case "rejected":
        return "Đã từ chối"
      default:
        return status
    }
  }

  // Actions
  const handleApprove = (id: number) => {
    if (onApprove) {
      onApprove(id)
    } else {
      setBookings(bookings.map((b) => (b.id === id ? { ...b, status: "confirmed" as const } : b)))
    }
    setShowDetails(false)
  }

  const handleReject = (id: number) => {
    if (!rejectReason.trim()) return
    if (onReject) {
      onReject(id, rejectReason)
    } else {
      setBookings(
        bookings.map((b) => (b.id === id ? { ...b, status: "rejected" as const, rejectionReason: rejectReason } : b)),
      )
    }
    setRejectDialog(null)
    setRejectReason("")
  }

  const handleApproveReschedule = (id: number) => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking || !booking.rescheduleRequest) return

    if (onApproveReschedule) {
      onApproveReschedule(id)
    } else {
      setBookings(
        bookings.map((b) =>
          b.id === id
            ? {
                ...b,
                date: b.rescheduleRequest!.newDate,
                startTime: b.rescheduleRequest!.newTime,
                status: "confirmed" as const,
                rescheduleRequest: undefined,
              }
            : b,
        ),
      )
    }
    setRescheduleDialog(null)
  }

  const handleRejectReschedule = (id: number) => {
    if (!rejectReason.trim()) return
    if (onRejectReschedule) {
      onRejectReschedule(id, rejectReason)
    } else {
      setBookings(
        bookings.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "confirmed" as const,
                rescheduleRequest: undefined,
              }
            : b,
        ),
      )
    }
    setRescheduleDialog(null)
    setRejectReason("")
  }

  const exportToExcel = () => {
    const headers = ["ID", "Sân", "Khách hàng", "SĐT", "Ngày", "Giờ", "Thời lượng", "Giá", "Trạng thái"]
    const rows = filteredBookings.map((b) => [
      b.id,
      b.fieldName,
      b.customerName,
      b.customerPhone,
      b.date,
      `${b.startTime}-${b.endTime}`,
      `${b.duration}h`,
      b.price,
      getStatusText(b.status),
    ])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${formatDateISO(new Date())}.csv`
    a.click()
  }

  const fieldsToShow =
    selectedField === "all"
      ? selectedOwner === "all"
        ? fields
        : fields.filter((f) => f.ownerName === owners.find((o) => o.id.toString() === selectedOwner)?.name)
      : fields.filter((f) => f.id === Number.parseInt(selectedField))

  const getBookingsForField = (fieldId: number) => {
    return filteredBookings.filter((b) => b.fieldId === fieldId)
  }

  const timeSlots = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => {
    const hour = START_HOUR + i
    return `${hour.toString().padStart(2, "0")}:00`
  })

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng đơn</p>
              <p className="text-xl font-bold">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <p className="text-xl font-bold">{stats.pending}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã xác nhận</p>
              <p className="text-xl font-bold">{stats.confirmed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <X className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã từ chối</p>
              <p className="text-xl font-bold">{stats.rejected}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hoàn thành</p>
              <p className="text-xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Doanh thu</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(stats.revenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Admin Info Banner */}
      {isAdmin && (
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="font-medium text-blue-800 dark:text-blue-200">Chế độ xem Admin</p>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Admin chỉ có quyền xem tổng quan đặt sân. Việc duyệt/từ chối đơn do Chủ sân thực hiện.
            </p>
          </div>
        </div>
      )}

      {/* Filters & Controls */}
      <Card className="p-4">
        <div className="flex flex-col gap-4">
          {/* Row 1: View Toggle & Date */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className={viewMode === "list" ? "bg-primary" : ""}
              >
                <List className="w-4 h-4 mr-2" />
                Danh sách
              </Button>
              <Button
                variant={viewMode === "timeline" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("timeline")}
                className={viewMode === "timeline" ? "bg-primary" : ""}
              >
                <LayoutGrid className="w-4 h-4 mr-2" />
                Timeline
              </Button>
            </div>

            {viewMode === "timeline" && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousDay}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={goToToday}>
                  Hôm nay
                </Button>
                <span className="font-medium min-w-[200px] text-center">{formatDate(selectedDate)}</span>
                <Button variant="outline" size="icon" onClick={nextDay}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            <Button variant="outline" size="sm" onClick={exportToExcel}>
              <Download className="w-4 h-4 mr-2" />
              Xuất Excel
            </Button>
          </div>

          {/* Row 2: Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT, sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {isAdmin && owners.length > 0 && (
              <Select value={selectedOwner} onValueChange={setSelectedOwner}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chủ sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả chủ sân</SelectItem>
                  {owners.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id.toString()}>
                      {owner.name} ({owner.fieldCount} sân)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedField} onValueChange={setSelectedField}>
              <SelectTrigger className="w-[180px]">
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

            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Không có đơn đặt sân nào</p>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-foreground">{booking.customerName}</h3>
                      <Badge className={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {booking.fieldName}
                      {isAdmin && booking.ownerName && ` • ${booking.ownerName}`}
                    </p>

                    {/* Reschedule Request */}
                    {booking.status === "pending_reschedule" && booking.rescheduleRequest && (
                      <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="font-medium text-purple-800 dark:text-purple-200">Yêu cầu đổi lịch</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-purple-700 dark:text-purple-300 font-medium">Lịch cũ:</p>
                            <p className="text-purple-800 dark:text-purple-200">
                              {booking.rescheduleRequest.oldDate} lúc {booking.rescheduleRequest.oldTime}
                            </p>
                          </div>
                          <div>
                            <p className="text-purple-700 dark:text-purple-300 font-medium">Lịch mới:</p>
                            <p className="text-purple-800 dark:text-purple-200">
                              {booking.rescheduleRequest.newDate} lúc {booking.rescheduleRequest.newTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Ngày</p>
                        <p className="font-medium text-foreground">{booking.date}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Giờ</p>
                        <p className="font-medium text-foreground">
                          {booking.startTime} - {booking.endTime}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Thời lượng</p>
                        <p className="font-medium text-foreground">{booking.duration} giờ</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Số tiền</p>
                        <p className="font-medium text-primary">{formatCurrency(booking.price)}</p>
                      </div>
                    </div>

                    {booking.status === "rejected" && booking.rejectionReason && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Lý do từ chối:</strong> {booking.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions - Only for Owner */}
                  {!isAdmin && (
                    <>
                      {booking.status === "pending_reschedule" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              setRescheduleDialog(booking.id)
                              setRescheduleAction("approve")
                            }}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Duyệt đổi lịch
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive bg-transparent"
                            onClick={() => {
                              setRescheduleDialog(booking.id)
                              setRescheduleAction("reject")
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      )}

                      {booking.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(booking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-destructive bg-transparent"
                            onClick={() => setRejectDialog(booking.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Timeline View */}
      {viewMode === "timeline" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header */}
              <div
                className="grid border-b border-border bg-muted/50"
                style={{ gridTemplateColumns: `80px repeat(${fieldsToShow.length}, 1fr)` }}
              >
                <div className="p-3 font-medium text-sm text-muted-foreground border-r border-border">Giờ</div>
                {fieldsToShow.map((field) => (
                  <div key={field.id} className="p-3 border-r border-border last:border-r-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-primary" />
                      <div>
                        <p className="font-medium text-sm">{field.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {field.type} • {formatCurrency(field.pricePerHour)}/giờ
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Timeline Grid */}
              <div className="grid" style={{ gridTemplateColumns: `80px repeat(${fieldsToShow.length}, 1fr)` }}>
                {/* Time Column */}
                <div className="border-r border-border">
                  {timeSlots.map((time) => (
                    <div
                      key={time}
                      className="flex items-center justify-center text-sm text-muted-foreground border-b border-border"
                      style={{ height: HOUR_HEIGHT }}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {time}
                    </div>
                  ))}
                </div>

                {/* Field Columns */}
                {fieldsToShow.map((field) => (
                  <div key={field.id} className="relative border-r border-border last:border-r-0">
                    {/* Grid lines */}
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="border-b border-dashed border-border"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {/* Booking blocks */}
                    {getBookingsForField(field.id).map((booking) => {
                      const { top, height } = getBookingStyle(booking)
                      return (
                        <div
                          key={booking.id}
                          className={`absolute left-1 right-1 rounded-lg border-l-4 cursor-pointer transition-all ${getStatusBgColor(booking.status)}`}
                          style={{ top: top + 2, height }}
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowDetails(true)
                          }}
                        >
                          <div className="p-2 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <Badge className={`text-[10px] px-1.5 py-0 ${getStatusColor(booking.status)}`}>
                                {getStatusText(booking.status)}
                              </Badge>
                              <span className="text-[10px] text-muted-foreground">
                                {booking.startTime} - {booking.endTime}
                              </span>
                            </div>
                            <p className="text-xs font-medium truncate flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {booking.customerName}
                            </p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                <Phone className="w-2.5 h-2.5" />
                                {booking.customerPhone}
                              </span>
                              <span className="text-xs font-semibold text-primary">
                                {formatCurrency(booking.price)}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Booking Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt sân</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getStatusColor(selectedBooking.status)}>
                  {getStatusText(selectedBooking.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">#{selectedBooking.id}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium">{selectedBooking.customerName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Số điện thoại</p>
                    <p className="font-medium">{selectedBooking.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sân</p>
                    <p className="font-medium">{selectedBooking.fieldName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                    <p className="font-medium">
                      {selectedBooking.date} • {selectedBooking.startTime} - {selectedBooking.endTime} (
                      {selectedBooking.duration}h)
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tổng tiền</p>
                    <p className="font-medium text-primary text-lg">{formatCurrency(selectedBooking.price)}</p>
                  </div>
                </div>
              </div>

              {/* Actions for Owner */}
              {!isAdmin && selectedBooking.status === "pending" && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => handleApprove(selectedBooking.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Duyệt
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive bg-transparent"
                    onClick={() => {
                      setShowDetails(false)
                      setRejectDialog(selectedBooking.id)
                    }}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Từ chối
                  </Button>
                </div>
              )}

              {isAdmin && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground text-center">
                    Việc duyệt/từ chối đơn do Chủ sân thực hiện
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialog !== null}
        onOpenChange={() => {
          setRejectDialog(null)
          setRejectReason("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Từ chối đặt sân
            </DialogTitle>
            <DialogDescription>Vui lòng nhập lý do từ chối để khách hàng hiểu rõ tình huống.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Lý do từ chối *</Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Sân đang bảo trì, đã có booking khác..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog(null)
                setRejectReason("")
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => rejectDialog && handleReject(rejectDialog)}>
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog
        open={rescheduleDialog !== null}
        onOpenChange={() => {
          setRescheduleDialog(null)
          setRescheduleAction(null)
          setRejectReason("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{rescheduleAction === "approve" ? "Xác nhận duyệt đổi lịch" : "Từ chối đổi lịch"}</DialogTitle>
            <DialogDescription>
              {rescheduleAction === "approve"
                ? "Bạn có chắc chắn muốn duyệt yêu cầu đổi lịch này?"
                : "Vui lòng nhập lý do từ chối để khách hàng hiểu rõ tình huống."}
            </DialogDescription>
          </DialogHeader>
          {rescheduleAction === "reject" && (
            <div className="py-4">
              <Label htmlFor="reschedule-reason">Lý do từ chối *</Label>
              <Textarea
                id="reschedule-reason"
                placeholder="Ví dụ: Khung giờ mới không còn trống..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
                className="mt-2"
              />
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRescheduleDialog(null)
                setRescheduleAction(null)
                setRejectReason("")
              }}
            >
              Hủy
            </Button>
            <Button
              variant={rescheduleAction === "approve" ? "default" : "destructive"}
              className={rescheduleAction === "approve" ? "bg-green-600" : ""}
              onClick={() => {
                if (rescheduleDialog) {
                  if (rescheduleAction === "approve") handleApproveReschedule(rescheduleDialog)
                  else handleRejectReschedule(rescheduleDialog)
                }
              }}
            >
              {rescheduleAction === "approve" ? "Xác nhận duyệt" : "Xác nhận từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
