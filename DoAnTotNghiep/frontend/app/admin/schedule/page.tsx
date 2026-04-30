"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  ScheduleManager,
  type Booking,
  type Field,
  type Owner,
} from "@/components/schedule-manager"
import { Pagination } from "@/components/pagination"
import { apiGet } from "@/lib/api-client"

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type AdminField = {
  id: number
  owner_id: number
  field_name: string | null
  sport_type: string | null
  address: string | null
  base_price_per_hour: string | number | null
  status: string
  owner?: {
    id: number
    name: string | null
    email: string | null
  } | null
  users?: {
    id: number
    name: string | null
    email: string | null
  } | null
}

type AdminBooking = {
  id: number
  field_id: number
  user_id: number
  start_datetime: string
  end_datetime: string
  status: string
  total_price: string | number | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
  user?: {
    id: number
    name: string | null
    email: string | null
    phone: string | null
  } | null
  users?: {
    id: number
    name: string | null
    email: string | null
    phone: string | null
  } | null
  field?: {
    id: number
    field_name: string | null
    address: string | null
    sport_type: string | null
    owner_id: number
  } | null
  fields?: {
    id: number
    field_name: string | null
    address: string | null
    sport_type: string | null
    owner_id: number
  } | null
}

const ITEMS_PER_PAGE = 8

function formatDateISO(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.split("T")[0] || ""
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatTime(value: string) {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    const timePart = value.split("T")[1] || value
    return timePart.slice(0, 5)
  }

  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")

  return `${hour}:${minute}`
}

function calculateDuration(startValue: string, endValue: string) {
  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)

  return Math.max(0, Math.round(durationHours * 100) / 100)
}

function mapBookingStatus(status: string): Booking["status"] {
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
      return "rejected"

    default:
      return "pending"
  }
}

function getOwnerName(field: AdminField) {
  return field.owner?.name || field.users?.name || "Chưa cập nhật"
}

function getBookingUser(booking: AdminBooking) {
  return booking.user || booking.users || null
}

function getBookingField(booking: AdminBooking) {
  return booking.field || booking.fields || null
}

function mapFieldToScheduleField(field: AdminField): Field {
  return {
    id: field.id,
    name: field.field_name || "Chưa cập nhật tên sân",
    type: field.sport_type || "Khác",
    pricePerHour: Number(field.base_price_per_hour || 0),
    ownerName: getOwnerName(field),
  }
}

function mapBookingToScheduleBooking(
  booking: AdminBooking,
  fieldMap: Map<number, Field>,
): Booking {
  const mappedField = fieldMap.get(booking.field_id)
  const bookingUser = getBookingUser(booking)
  const bookingField = getBookingField(booking)

  return {
    id: booking.id,
    fieldId: booking.field_id,
    fieldName:
      bookingField?.field_name ||
      mappedField?.name ||
      "Chưa cập nhật tên sân",
    date: formatDateISO(booking.start_datetime),
    startTime: formatTime(booking.start_datetime),
    endTime: formatTime(booking.end_datetime),
    customerName: bookingUser?.name || bookingUser?.email || "Khách hàng",
    customerPhone: bookingUser?.phone || "-",
    ownerName: mappedField?.ownerName || "Chưa cập nhật",
    status: mapBookingStatus(booking.status),
    duration: calculateDuration(booking.start_datetime, booking.end_datetime),
    price: Number(booking.total_price || 0),
    location: bookingField?.address || undefined,
    rejectionReason:
      booking.status === "REJECTED" ||
      booking.status === "CANCELLED" ||
      booking.status === "PAY_FAILED" ||
      booking.status === "PAYMENT_EXPIRED"
        ? booking.notes || "Đơn đã bị từ chối, đã hủy hoặc thanh toán thất bại"
        : undefined,
  }
}

function buildOwners(fields: AdminField[]): Owner[] {
  const ownerMap = new Map<number, Owner>()

  fields.forEach((field) => {
    if (!field.owner_id) return

    const current = ownerMap.get(field.owner_id)

    if (current) {
      ownerMap.set(field.owner_id, {
        ...current,
        fieldCount: current.fieldCount + 1,
      })
      return
    }

    ownerMap.set(field.owner_id, {
      id: field.owner_id,
      name: getOwnerName(field),
      fieldCount: 1,
    })
  })

  return Array.from(ownerMap.values())
}

function sortBookingsByNewest(bookings: Booking[]) {
  return [...bookings].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.startTime}:00`).getTime()
    const dateB = new Date(`${b.date}T${b.startTime}:00`).getTime()

    if (Number.isNaN(dateA) || Number.isNaN(dateB)) {
      return b.id - a.id
    }

    return dateB - dateA
  })
}

export default function AdminSchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = bookings.length
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE)

  const visibleBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return bookings.slice(startIndex, endIndex)
  }, [bookings, currentPage])

  const fetchAdminSchedule = useCallback(async () => {
    try {
      const [fieldsRes, bookingsRes] = await Promise.all([
        apiGet<ApiResponse<AdminField[]>>("/admin/fields"),
        apiGet<ApiResponse<AdminBooking[]>>("/admin/bookings"),
      ])

      const mappedFields = fieldsRes.data.map(mapFieldToScheduleField)
      const fieldMap = new Map(mappedFields.map((field) => [field.id, field]))

      const mappedBookings = bookingsRes.data.map((booking) =>
        mapBookingToScheduleBooking(booking, fieldMap),
      )

      setFields(mappedFields)
      setOwners(buildOwners(fieldsRes.data))
      setBookings(sortBookingsByNewest(mappedBookings))
      setCurrentPage(1)
    } catch (error) {
      console.error(error)
      setFields([])
      setOwners([])
      setBookings([])
      setCurrentPage(1)
    }
  }, [])

  useEffect(() => {
    fetchAdminSchedule()
  }, [fetchAdminSchedule])

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/dashboard"
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Quản Lý Đặt Sân</h1>
            <p className="text-muted-foreground">
              Xem tổng quan tất cả đơn đặt sân trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {/* Schedule Manager Component */}
      <ScheduleManager
        bookings={visibleBookings}
        fields={fields}
        owners={owners}
        isAdmin={true}
      />

      {totalItems > ITEMS_PER_PAGE && (
        <div className="mt-6">
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
  )
}