"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Pagination } from "@/components/pagination"
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
} from "lucide-react"

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
  rawStatus?: string
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

export interface OwnerRescheduleRequest {
  id: number
  booking_id: number
  old_start_datetime: string
  old_end_datetime: string
  new_start_datetime: string
  new_end_datetime: string
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string
  reason?: string | null
  owner_note?: string | null
}

interface ScheduleManagerProps {
  bookings: Booking[]
  fields: Field[]
  owners?: Owner[]
  isAdmin?: boolean
  onApprove?: (id: number) => void
  onReject?: (id: number, reason: string) => void
  onCancelBooking?: (id: number, reason: string) => void
  actionLoadingId?: number | null
  pendingRescheduleByBookingId?: Map<number, OwnerRescheduleRequest>
  rescheduleActionLoadingId?: number | null
  onApproveReschedule?: (requestId: number) => void
  onRejectReschedule?: (requestId: number, reason: string) => void
}

const START_HOUR = 6
const END_HOUR = 23
const HOUR_HEIGHT = 80
const ITEMS_PER_PAGE = 8

export function ScheduleManager({
  bookings: initialBookings,
  fields,
  owners = [],
  isAdmin = false,
  onApprove,
  onReject,
  onCancelBooking,
  actionLoadingId = null,
  pendingRescheduleByBookingId,
  rescheduleActionLoadingId = null,
  onApproveReschedule,
  onRejectReschedule,
}: ScheduleManagerProps) {
  const [bookings, setBookings] = useState(initialBookings)

  useEffect(() => {
    setBookings(initialBookings)
  }, [initialBookings])

  const [viewMode, setViewMode] = useState<"list" | "timeline">("list")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [selectedField, setSelectedField] = useState<string>("all")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [rejectDialog, setRejectDialog] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const [cancelDialog, setCancelDialog] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [rescheduleDialog, setRescheduleDialog] = useState<number | null>(null)
  const [rescheduleAction, setRescheduleAction] = useState<"approve" | "reject" | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const formatDateISO = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")

    return `${year}-${month}-${day}`
  }

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " VND"
  }

  const formatDateTimeText = (value: string) => {
    return new Date(value).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  const formatTimeText = (value: string) => {
    return new Date(value).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatTimeRangeText = (start: string, end: string) => {
    return `${formatTimeText(start)} - ${formatTimeText(end)}`
  }

  const getBookingStartDateTime = (booking: Booking) => {
    return new Date(`${booking.date}T${booking.startTime}`)
  }

  const isPastBookingStart = (booking: Booking) => {
    return getBookingStartDateTime(booking).getTime() <= Date.now()
  }

  const isExpiredPendingBooking = (booking: Booking) => {
    return booking.status === "pending" && isPastBookingStart(booking)
  }

  const canShowPendingActions = (booking: Booking) => {
    if (isAdmin) return false
    if (isExpiredPendingBooking(booking)) return false

    if (booking.rawStatus) {
      return booking.rawStatus === "PENDING_CONFIRM"
    }

    return booking.status === "pending"
  }

  const canShowOwnerCancelAction = (booking: Booking) => {
    if (isAdmin) return false
    if (isExpiredPendingBooking(booking)) return false

    if (booking.rawStatus) {
      return ["APPROVED", "AWAITING_PAYMENT", "PAID"].includes(booking.rawStatus)
    }

    return booking.status === "confirmed"
  }

  const isConfirmedLikeBooking = (booking: Booking) => {
    if (booking.rawStatus) {
      return ["APPROVED", "PAID", "CHECKED_IN"].includes(booking.rawStatus)
    }

    return booking.status === "confirmed"
  }

  const isRevenueBooking = (booking: Booking) => {
    if (booking.rawStatus) {
      return ["PAID", "CHECKED_IN", "COMPLETED"].includes(booking.rawStatus)
    }

    return booking.status === "completed"
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

  const filteredBookings = bookings.filter((booking) => {
    const matchesDate = viewMode === "timeline" ? booking.date === formatDateISO(selectedDate) : true
    const matchesField = selectedField === "all" || booking.fieldId === Number.parseInt(selectedField)
    const matchesOwner =
      selectedOwner === "all" || booking.ownerName === owners.find((o) => o.id.toString() === selectedOwner)?.name

    const expiredPending = isExpiredPendingBooking(booking)

    const matchesStatus =
      selectedStatus === "all" ||
      (selectedStatus === "pending"
        ? !expiredPending && (booking.status === "pending" || booking.status === "pending_reschedule")
        : selectedStatus === "awaiting_payment"
          ? booking.rawStatus === "AWAITING_PAYMENT"
          : selectedStatus === "confirmed"
            ? isConfirmedLikeBooking(booking)
            : selectedStatus === "rejected"
              ? booking.status === "rejected" || expiredPending
              : booking.status === selectedStatus)

    const matchesSearch =
      searchQuery === "" ||
      booking.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.fieldName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customerPhone.includes(searchQuery)

    return matchesDate && matchesField && matchesOwner && matchesStatus && matchesSearch
  })

  const stats = {
    total: filteredBookings.length,
    pending: filteredBookings.filter(
      (b) => !isExpiredPendingBooking(b) && (b.status === "pending" || b.status === "pending_reschedule"),
    ).length,
    confirmed: filteredBookings.filter(isConfirmedLikeBooking).length,
    completed: filteredBookings.filter((b) => b.status === "completed").length,
    rejected: filteredBookings.filter((b) => b.status === "rejected" || isExpiredPendingBooking(b)).length,
    revenue: filteredBookings.filter(isRevenueBooking).reduce((sum, b) => sum + b.price, 0),
  }

  const totalItems = filteredBookings.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return filteredBookings.slice(startIndex, endIndex)
  }, [filteredBookings, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [viewMode, selectedDate, selectedField, selectedOwner, selectedStatus, searchQuery])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const getBookingStyle = (booking: Booking) => {
    const [startHour = "0", startMinute = "0"] = booking.startTime.split(":")
    const [endHour = "0", endMinute = "0"] = booking.endTime.split(":")

    const startTotalMinutes = Number(startHour) * 60 + Number(startMinute)
    const endTotalMinutes = Number(endHour) * 60 + Number(endMinute)

    const top = ((startTotalMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT
    const height = ((endTotalMinutes - startTotalMinutes) / 60) * HOUR_HEIGHT - 4

    return {
      top: Math.max(0, top),
      height: Math.max(36, height),
    }
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
      case "rejected":
        return "bg-red-500/10 border-l-red-500 hover:bg-red-500/20"
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

  const getDisplayStatusText = (booking: Booking) => {
    if (isExpiredPendingBooking(booking)) {
      return "Đã quá giờ"
    }

    switch (booking.rawStatus) {
      case "PENDING_CONFIRM":
        return "Chờ duyệt"
      case "APPROVED":
        return "Đã xác nhận"
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
        return "Hết hạn thanh toán"
      case "NO_SHOW":
        return "Không đến sân"
      default:
        return getStatusText(booking.status)
    }
  }

  const getDisplayStatusColor = (booking: Booking) => {
    if (isExpiredPendingBooking(booking)) {
      return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    }

    switch (booking.rawStatus) {
      case "AWAITING_PAYMENT":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      case "APPROVED":
      case "PAID":
        return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
      case "CHECKED_IN":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
      case "REJECTED":
      case "CANCELLED":
      case "PAY_FAILED":
      case "PAYMENT_EXPIRED":
      case "NO_SHOW":
        return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
      default:
        return getStatusColor(booking.status)
    }
  }

  const getDisplayStatusBgColor = (booking: Booking) => {
    if (isExpiredPendingBooking(booking)) {
      return "bg-red-500/10 border-l-red-500 hover:bg-red-500/20"
    }

    switch (booking.rawStatus) {
      case "AWAITING_PAYMENT":
        return "bg-yellow-500/10 border-l-yellow-500 hover:bg-yellow-500/20"
      case "APPROVED":
      case "PAID":
        return "bg-green-500/10 border-l-green-500 hover:bg-green-500/20"
      case "CHECKED_IN":
        return "bg-emerald-500/10 border-l-emerald-500 hover:bg-emerald-500/20"
      case "COMPLETED":
        return "bg-blue-500/10 border-l-blue-500 hover:bg-blue-500/20"
      case "REJECTED":
      case "CANCELLED":
      case "PAY_FAILED":
      case "PAYMENT_EXPIRED":
      case "NO_SHOW":
        return "bg-red-500/10 border-l-red-500 hover:bg-red-500/20"
      default:
        return getStatusBgColor(booking.status)
    }
  }

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

  const handleCancelBooking = (id: number) => {
    if (!cancelReason.trim()) return

    if (onCancelBooking) {
      onCancelBooking(id, cancelReason.trim())
    } else {
      setBookings(
        bookings.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "rejected" as const,
                rawStatus: "CANCELLED",
                rejectionReason: cancelReason.trim(),
              }
            : b,
        ),
      )
    }

    setCancelDialog(null)
    setCancelReason("")
    setShowDetails(false)
  }

  const handleApproveReschedule = (requestId: number) => {
    if (onApproveReschedule) {
      onApproveReschedule(requestId)
    }

    setRescheduleDialog(null)
    setRescheduleAction(null)
  }

  const handleRejectReschedule = (requestId: number) => {
    if (!rejectReason.trim()) return

    if (onRejectReschedule) {
      onRejectReschedule(requestId, rejectReason)
    }

    setRescheduleDialog(null)
    setRescheduleAction(null)
    setRejectReason("")
  }

  const exportToExcel = () => {
    const escapeCsvValue = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`
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
      getDisplayStatusText(b),
    ])
    const csv = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bookings-${formatDateISO(new Date())}.csv`
    a.click()
    URL.revokeObjectURL(url)
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

      <Card className="p-4">
        <div className="flex flex-col gap-4">
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

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo tên, SĐT, sân..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            {isAdmin && owners.length > 0 && (
              <Select
                value={selectedOwner}
                onValueChange={(value) => {
                  setSelectedOwner(value)
                  setCurrentPage(1)
                }}
              >
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

            <Select
              value={selectedField}
              onValueChange={(value) => {
                setSelectedField(value)
                setCurrentPage(1)
              }}
            >
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

            <Select
              value={selectedStatus}
              onValueChange={(value) => {
                setSelectedStatus(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[170px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="awaiting_payment">Chờ thanh toán</SelectItem>
                <SelectItem value="confirmed">Đã xác nhận</SelectItem>
                <SelectItem value="completed">Hoàn thành</SelectItem>
                <SelectItem value="rejected">Đã từ chối</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {viewMode === "list" && (
        <div className="space-y-4">
          {filteredBookings.length === 0 ? (
            <Card className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Không có đơn đặt sân nào</p>
            </Card>
          ) : (
            paginatedBookings.map((booking) => {
              const pendingReschedule = pendingRescheduleByBookingId?.get(booking.id)

              return (
                <Card key={booking.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-foreground">{booking.customerName}</h3>
                      <Badge
                        className={
                          pendingReschedule
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                            : getDisplayStatusColor(booking)
                        }
                      >
                        {pendingReschedule ? "Chờ duyệt đổi lịch" : getDisplayStatusText(booking)}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3">
                      {booking.fieldName}
                      {isAdmin && booking.ownerName && ` • ${booking.ownerName}`}
                    </p>

                    {pendingReschedule && (
                      <div className="mb-4 p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <RefreshCw className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <p className="font-medium text-purple-800 dark:text-purple-200">Yêu cầu đổi lịch</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-purple-700 dark:text-purple-300 font-medium">Lịch hiện tại:</p>
                            <p className="text-purple-800 dark:text-purple-200">
                              {formatDateTimeText(pendingReschedule.old_start_datetime)} lúc{" "}
                              {formatTimeRangeText(
                                pendingReschedule.old_start_datetime,
                                pendingReschedule.old_end_datetime,
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-purple-700 dark:text-purple-300 font-medium">Muốn đổi sang:</p>
                            <p className="text-purple-800 dark:text-purple-200">
                              {formatDateTimeText(pendingReschedule.new_start_datetime)} lúc{" "}
                              {formatTimeRangeText(
                                pendingReschedule.new_start_datetime,
                                pendingReschedule.new_end_datetime,
                              )}
                            </p>
                          </div>
                        </div>

                        {pendingReschedule.reason && (
                          <p className="mt-3 text-sm text-purple-800 dark:text-purple-200">
                            <strong>Lý do:</strong> {pendingReschedule.reason}
                          </p>
                        )}
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
                          <strong>Lý do:</strong> {booking.rejectionReason}
                        </p>
                      </div>
                    )}

                    {isExpiredPendingBooking(booking) && (
                      <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Thông báo:</strong> Booking đã quá giờ bắt đầu, không thể duyệt.
                        </p>
                      </div>
                    )}
                  </div>

                  {!isAdmin && (
                    <>
                      {pendingReschedule && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={rescheduleActionLoadingId === pendingReschedule.id}
                            onClick={() => {
                              setRescheduleDialog(pendingReschedule.id)
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
                            disabled={rescheduleActionLoadingId === pendingReschedule.id}
                            className="text-destructive bg-transparent"
                            onClick={() => {
                              setRescheduleDialog(pendingReschedule.id)
                              setRescheduleAction("reject")
                            }}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      )}

                      {canShowPendingActions(booking) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={actionLoadingId === booking.id}
                            onClick={() => handleApprove(booking.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === booking.id}
                            className="text-destructive bg-transparent"
                            onClick={() => setRejectDialog(booking.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Từ chối
                          </Button>
                        </div>
                      )}

                      {canShowOwnerCancelAction(booking) && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoadingId === booking.id}
                            className="text-destructive bg-transparent"
                            onClick={() => {
                              setCancelDialog(booking.id)
                              setCancelReason("")
                            }}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Hủy do sự cố
                          </Button>
                        </div>
                      )}

                      {isExpiredPendingBooking(booking) && (
                        <div className="flex items-center">
                          <Badge variant="destructive">Đã quá giờ</Badge>
                        </div>
                      )}
                    </>
                  )}
                </div>
                </Card>
              )
            })
          )}

          {totalItems > ITEMS_PER_PAGE && (
            <div className="pt-2">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalItems}
              />
            </div>
          )}
        </div>
      )}

      {viewMode === "timeline" && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
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

              <div className="grid" style={{ gridTemplateColumns: `80px repeat(${fieldsToShow.length}, 1fr)` }}>
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

                {fieldsToShow.map((field) => (
                  <div key={field.id} className="relative border-r border-border last:border-r-0">
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="border-b border-dashed border-border"
                        style={{ height: HOUR_HEIGHT }}
                      />
                    ))}

                    {getBookingsForField(field.id).map((booking) => {
                      const { top, height } = getBookingStyle(booking)
                      return (
                        <div
                          key={booking.id}
                          className={`absolute left-1 right-1 rounded-lg border-l-4 cursor-pointer transition-all ${getDisplayStatusBgColor(booking)}`}
                          style={{ top: top + 2, height }}
                          onClick={() => {
                            setSelectedBooking(booking)
                            setShowDetails(true)
                          }}
                        >
                          <div className="p-2 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <Badge className={`text-[10px] px-1.5 py-0 ${getDisplayStatusColor(booking)}`}>
                                {getDisplayStatusText(booking)}
                              </Badge>
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

      <Dialog
        open={showDetails}
        onOpenChange={(open) => {
          setShowDetails(open)

          if (!open) {
            setSelectedBooking(null)
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chi tiết đặt sân</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge className={getDisplayStatusColor(selectedBooking)}>
                  {getDisplayStatusText(selectedBooking)}
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

              {!isAdmin && canShowPendingActions(selectedBooking) && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    disabled={actionLoadingId === selectedBooking.id}
                    onClick={() => handleApprove(selectedBooking.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Duyệt
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive bg-transparent"
                    disabled={actionLoadingId === selectedBooking.id}
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

              {!isAdmin && canShowOwnerCancelAction(selectedBooking) && (
                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 text-destructive bg-transparent"
                    disabled={actionLoadingId === selectedBooking.id}
                    onClick={() => {
                      setShowDetails(false)
                      setCancelDialog(selectedBooking.id)
                      setCancelReason("")
                    }}
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Hủy do sự cố
                  </Button>
                </div>
              )}

              {!isAdmin && isExpiredPendingBooking(selectedBooking) && (
                <div className="pt-4 border-t">
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/20">
                    <p className="text-sm text-red-800 dark:text-red-200">
                      Booking đã quá giờ bắt đầu, không thể duyệt.
                    </p>
                  </div>
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
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || actionLoadingId === rejectDialog}
              onClick={() => rejectDialog && handleReject(rejectDialog)}
            >
              Xác nhận từ chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={cancelDialog !== null}
        onOpenChange={() => {
          setCancelDialog(null)
          setCancelReason("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Hủy booking do sự cố
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do hủy để khách hàng được thông báo rõ ràng. Nếu booking đã thanh toán, hệ thống sẽ ghi nhận yêu cầu hoàn tiền.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="cancel-reason">Lý do hủy *</Label>
            <Textarea
              id="cancel-reason"
              placeholder="Ví dụ: Sân bảo trì đột xuất, mưa lớn, mất điện..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
              maxLength={255}
              className="mt-2"
            />
            <p className="mt-2 text-xs text-muted-foreground">Tối đa 255 ký tự.</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCancelDialog(null)
                setCancelReason("")
              }}
            >
              Đóng
            </Button>
            <Button
              variant="destructive"
              disabled={!cancelReason.trim() || actionLoadingId === cancelDialog}
              onClick={() => cancelDialog && handleCancelBooking(cancelDialog)}
            >
              Xác nhận hủy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              disabled={
                rescheduleDialog === null ||
                rescheduleActionLoadingId === rescheduleDialog ||
                (rescheduleAction === "reject" && !rejectReason.trim())
              }
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