"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ScheduleManager, type Booking, type Field } from "@/components/schedule-manager"
import { useToast } from "@/hooks/use-toast"
import {
  getOwnerBookings,
  type OwnerBookingListItem,
} from "@/features/bookings/services/get-owner-bookings"
import { approveOwnerBooking } from "@/features/bookings/services/approve-owner-booking"
import { rejectOwnerBooking } from "@/features/bookings/services/reject-owner-booking"

function mapApiStatusToUi(
  status: OwnerBookingListItem["status"],
): Booking["status"] {
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
      return "rejected"
    default:
      return "pending"
  }
}

// function mapApiBookingToUi(item: OwnerBookingListItem): Booking {
//   const start = new Date(item.start_datetime)
//   const end = new Date(item.end_datetime)
//   const duration = Math.max(
//     1,
//     Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)),
//   )

//   return {
//     id: item.id,
//     fieldId: item.field?.id ?? item.field_id,
//     fieldName: item.field?.field_name ?? "Chưa có tên sân",
//     customerName: item.user?.full_name ?? "Khách hàng",
//     customerPhone: item.user?.phone_number ?? "Chưa cập nhật",
//     date: item.start_datetime.slice(0, 10),
//     startTime: item.start_datetime.slice(11, 16),
//     endTime: item.end_datetime.slice(11, 16),
//     duration,
//     price: Number(item.total_price ?? 0),
//     status: mapApiStatusToUi(item.status),
//     location: item.field?.address ?? undefined,
//     rejectionReason: item.rejection_reason ?? undefined,
//   }
// }
function mapApiBookingToUi(item: OwnerBookingListItem): Booking {
  const start = new Date(item.start_datetime)
  const end = new Date(item.end_datetime)
  const duration = Math.max(
    1,
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60)),
  )

  return {
    id: item.id,
    fieldId: item.field?.id ?? item.field_id,
    fieldName: item.field?.field_name ?? "Chưa có tên sân",
    customerName: item.user?.name ?? "Khách hàng",
    customerPhone: item.user?.phone ?? "Chưa cập nhật",
    date: item.start_datetime.slice(0, 10),
    startTime: item.start_datetime.slice(11, 16),
    endTime: item.end_datetime.slice(11, 16),
    duration,
    price: Number(item.total_price ?? 0),
    status: mapApiStatusToUi(item.status),
    location: item.field?.address ?? undefined,
    rejectionReason: item.rejection_reason ?? undefined,
  }
}

export default function OwnerSchedulePage() {
  const { toast } = useToast()

  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadOwnerBookings = async () => {
    try {
      setIsLoading(true)

      const res = await getOwnerBookings({
        page: 1,
        limit: 100,
      })
      console.log("OWNER BOOKINGS RAW:", res)
      console.log("OWNER BOOKINGS FIRST ITEM:", res.data.items?.[0])
      console.log("OWNER BOOKINGS USER:", res.data.items?.[0]?.user)

      setBookings(res.data.items.map(mapApiBookingToUi))
    } catch (error) {
      toast({
        title: "Không tải được danh sách booking",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        variant: "destructive",
      })
      setBookings([])
    } finally {
      setIsLoading(false)
    }
  
  }

  useEffect(() => {
    loadOwnerBookings()
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
          pricePerHour: Math.round(booking.price / Math.max(1, booking.duration)),
        })
      }
    })

    return Array.from(map.values())
  }, [bookings])

  const handleApprove = async (id: number) => {
    try {
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
    }
  }

  const handleReject = async (id: number, reason: string) => {
    try {
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
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/owner/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Quản lý đặt sân</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Quản Lý Đặt Sân</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12 text-muted-foreground">
            Đang tải danh sách booking...
          </div>
        ) : (
          <ScheduleManager
            bookings={bookings}
            fields={ownerFields}
            isAdmin={false}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        )}
      </div>
    </main>
  )
}
