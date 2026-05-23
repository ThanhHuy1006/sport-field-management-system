"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { RefreshCw } from "lucide-react"

import { ScheduleManager, type Booking, type Field } from "@/components/schedule-manager"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import {
  getOwnerBookings,
  type OwnerBookingListItem,
} from "@/features/bookings/services/get-owner-bookings"
import { approveOwnerBooking } from "@/features/bookings/services/approve-owner-booking"
import { rejectOwnerBooking } from "@/features/bookings/services/reject-owner-booking"

type OwnerBookingsApiResponse = {
  data?:
    | OwnerBookingListItem[]
    | {
        items?: OwnerBookingListItem[]
      }
}

function extractBookingItems(response: OwnerBookingsApiResponse) {
  if (Array.isArray(response?.data)) {
    return response.data
  }

  if (Array.isArray(response?.data?.items)) {
    return response.data.items
  }

  return []
}

function getApiStatus(item: OwnerBookingListItem) {
  return String(item.status || "")
}

function isPastStartTime(item: OwnerBookingListItem) {
  const time = new Date(item.start_datetime).getTime()

  if (Number.isNaN(time)) {
    return false
  }

  return time <= Date.now()
}

function mapApiStatusToUi(item: OwnerBookingListItem): Booking["status"] {
  const status = getApiStatus(item)

  switch (status) {
    case "PENDING_CONFIRM":
      return "pending"

    case "APPROVED":
    case "AWAITING_PAYMENT":
    case "PAID":
    case "CHECKED_IN":
      return "confirmed"

    case "COMPLETED":
      return "completed"

    case "REJECTED":
    case "CANCELLED":
    case "PAY_FAILED":
    case "PAYMENT_EXPIRED":
    case "NO_SHOW":
      return "rejected"

    default:
      return "rejected"
  }
}

const formatLocalDate = (iso: string) => {
  return new Date(iso).toLocaleDateString("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

const formatLocalTime = (iso: string) => {
  return new Date(iso).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

function getRejectionReason(item: OwnerBookingListItem) {
  const status = getApiStatus(item)

  if (status === "NO_SHOW") {
    return "Khách không check-in trong thời gian đặt sân"
  }

  if (status === "PAYMENT_EXPIRED") {
    return "Booking đã hết hạn thanh toán"
  }

  if (status === "PENDING_CONFIRM" && isPastStartTime(item)) {
    return "Booking đã quá giờ bắt đầu, không thể duyệt"
  }

  if (status === "REJECTED") {
    return "Booking đã bị từ chối"
  }

  if (status === "CANCELLED") {
    return "Booking đã bị hủy"
  }

  if (status === "PAY_FAILED") {
    return "Thanh toán thất bại"
  }

  return undefined
}

function calculateDuration(startIso: string, endIso: string) {
  const start = new Date(startIso)
  const end = new Date(endIso)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

  return Math.max(0, Math.round(durationHours * 100) / 100)
}

function mapApiBookingToUi(item: OwnerBookingListItem): Booking {
  const duration = calculateDuration(item.start_datetime, item.end_datetime)

  return {
    id: item.id,
    fieldId: item.field?.id ?? item.field_id,
    fieldName: item.field?.field_name ?? "Chưa có tên sân",
    customerName: item.contact_name ?? item.user?.name ?? "Khách hàng",
    customerPhone: item.contact_phone ?? item.user?.phone ?? "Chưa cập nhật",
    date: formatLocalDate(item.start_datetime),
    startTime: formatLocalTime(item.start_datetime),
    endTime: formatLocalTime(item.end_datetime),
    duration,
    price: Number(item.total_price ?? 0),
    status: mapApiStatusToUi(item),
    rawStatus: getApiStatus(item),
    location: item.field?.address ?? undefined,
    rejectionReason: getRejectionReason(item),
  }
}

export default function OwnerSchedulePage() {
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const loadOwnerBookings = async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const response = await getOwnerBookings({
        page: 1,
        limit: 50,
      })

      const items = extractBookingItems(response as OwnerBookingsApiResponse)

      setBookings(items.map(mapApiBookingToUi))
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đã có lỗi xảy ra"

      setErrorMessage(message)
      setBookings([])

      toast({
        title: "Không tải được danh sách booking",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void loadOwnerBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const ownerFields: Field[] = useMemo(() => {
    const map = new Map<number, Field>()

    bookings.forEach((booking) => {
      if (!map.has(booking.fieldId)) {
        map.set(booking.fieldId, {
          id: booking.fieldId,
          name: booking.fieldName,
          type: "Field",
          pricePerHour: Math.round(
            booking.price / Math.max(1, booking.duration),
          ),
        })
      }
    })

    return Array.from(map.values())
  }, [bookings])

  const handleApprove = async (id: number) => {
    if (actionLoadingId) return

    try {
      setActionLoadingId(id)

      await approveOwnerBooking(id)

      toast({
        title: "Duyệt booking thành công",
      })

      await loadOwnerBookings()
    } catch (error) {
      toast({
        title: "Duyệt booking thất bại",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        variant: "destructive",
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleReject = async (id: number, reason: string) => {
    if (actionLoadingId) return

    try {
      setActionLoadingId(id)

      await rejectOwnerBooking(id, reason)

      toast({
        title: "Từ chối booking thành công",
      })

      await loadOwnerBookings()
    } catch (error) {
      toast({
        title: "Từ chối booking thất bại",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        variant: "destructive",
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  return (
    <main data-cy="owner-bookings-page" className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/owner/dashboard"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Quản lý đặt sân</span>
          </div>

          <div className="flex items-center justify-between">
            <h1 data-cy="owner-bookings-title" className="text-xl font-bold">
              Quản Lý Đặt Sân
            </h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        {errorMessage && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p>{errorMessage}</p>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => void loadOwnerBookings()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Thử lại
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div
            data-cy="owner-bookings-loading"
            className="text-center py-12 text-muted-foreground"
          >
            Đang tải danh sách booking...
          </div>
        ) : (
          <div data-cy="owner-bookings-schedule-manager">
            <ScheduleManager
              bookings={bookings}
              fields={ownerFields}
              isAdmin={false}
              actionLoadingId={actionLoadingId}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          </div>
        )}
      </div>
    </main>
  )
}
