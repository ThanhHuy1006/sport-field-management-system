"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ScheduleManager,
  type Booking,
  type Field,
  type Owner,
} from "@/components/schedule-manager"
import { Pagination } from "@/components/pagination"
import { apiGet } from "@/lib/api-client"

type ApiResponse<T> = {
  success?: boolean
  message?: string
  data?: T
}

type ApiListData<T> =
  | T[]
  | {
      items?: T[]
      pagination?: {
        page?: number
        limit?: number
        total?: number
        total_pages?: number
      }
    }

type AdminField = {
  id: number
  owner_id?: number | null
  field_name?: string | null
  sport_type?: string | null
  address?: string | null
  base_price_per_hour?: string | number | null
  status?: string | null

  owner?: {
    id?: number | null
    name?: string | null
    email?: string | null
  } | null

  users?: {
    id?: number | null
    name?: string | null
    email?: string | null
  } | null
}

type AdminBooking = {
  id: number
  field_id?: number | null
  user_id?: number | null
  start_datetime?: string | null
  end_datetime?: string | null
  status?: string | null
  total_price?: string | number | null
  notes?: string | null
  created_at?: string | null
  updated_at?: string | null

  user?: {
    id?: number | null
    name?: string | null
    email?: string | null
    phone?: string | null
  } | null

  users?: {
    id?: number | null
    name?: string | null
    email?: string | null
    phone?: string | null
  } | null

  field?: {
    id?: number | null
    field_name?: string | null
    address?: string | null
    sport_type?: string | null
    owner_id?: number | null
  } | null

  fields?: {
    id?: number | null
    field_name?: string | null
    address?: string | null
    sport_type?: string | null
    owner_id?: number | null
  } | null
}

const ITEMS_PER_PAGE = 8

function extractItems<T>(data: ApiListData<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data

  if (Array.isArray(data?.items)) {
    return data.items
  }

  return []
}

function toNumber(value: string | number | null | undefined, fallback = 0) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return fallback
  }

  return numberValue
}

function formatDateISO(value?: string | null) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value.split("T")[0] || ""
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

function formatTime(value?: string | null) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    const timePart = value.split("T")[1] || value
    return timePart.slice(0, 5)
  }

  const hour = String(date.getHours()).padStart(2, "0")
  const minute = String(date.getMinutes()).padStart(2, "0")

  return `${hour}:${minute}`
}

function calculateDuration(startValue?: string | null, endValue?: string | null) {
  if (!startValue || !endValue) return 0

  const start = new Date(startValue)
  const end = new Date(endValue)

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 0
  }

  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)

  return Math.max(0, Math.round(durationHours * 100) / 100)
}

function mapBookingStatus(status?: string | null): Booking["status"] {
  const normalizedStatus = String(status || "").toUpperCase()

  switch (normalizedStatus) {
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
      return "pending"
  }
}

function getBookingRejectionReason(booking: AdminBooking) {
  const normalizedStatus = String(booking.status || "").toUpperCase()

  switch (normalizedStatus) {
    case "REJECTED":
      return booking.notes || "Đơn đặt sân đã bị từ chối"

    case "CANCELLED":
      return booking.notes || "Đơn đặt sân đã bị hủy"

    case "PAY_FAILED":
      return booking.notes || "Thanh toán thất bại"

    case "PAYMENT_EXPIRED":
      return booking.notes || "Đơn đã quá hạn thanh toán"

    case "NO_SHOW":
      return booking.notes || "Khách hàng không đến sân"

    default:
      return undefined
  }
}

function getOwnerName(field: AdminField) {
  return field.owner?.name || field.users?.name || "Chưa cập nhật"
}

function getOwnerId(field: AdminField) {
  return field.owner_id ?? field.owner?.id ?? field.users?.id ?? null
}

function getBookingUser(booking: AdminBooking) {
  return booking.user || booking.users || null
}

function getBookingField(booking: AdminBooking) {
  return booking.field || booking.fields || null
}

function getBookingFieldId(booking: AdminBooking) {
  return booking.field_id ?? booking.field?.id ?? booking.fields?.id ?? 0
}

function mapFieldToScheduleField(field: AdminField): Field {
  return {
    id: field.id,
    name: field.field_name || "Chưa cập nhật tên sân",
    type: field.sport_type || "Khác",
    pricePerHour: toNumber(field.base_price_per_hour),
    ownerName: getOwnerName(field),
  }
}

function mapBookingToScheduleBooking(
  booking: AdminBooking,
  fieldMap: Map<number, Field>,
): Booking {
  const fieldId = getBookingFieldId(booking)
  const mappedField = fieldMap.get(fieldId)
  const bookingUser = getBookingUser(booking)
  const bookingField = getBookingField(booking)

  return {
    id: booking.id,
    fieldId,
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
    price: toNumber(booking.total_price),
    location: bookingField?.address || undefined,
    rejectionReason: getBookingRejectionReason(booking),
  }
}

function buildOwners(fields: AdminField[]): Owner[] {
  const ownerMap = new Map<number, Owner>()

  fields.forEach((field) => {
    const ownerId = getOwnerId(field)

    if (!ownerId) return

    const current = ownerMap.get(ownerId)

    if (current) {
      ownerMap.set(ownerId, {
        ...current,
        fieldCount: current.fieldCount + 1,
      })
      return
    }

    ownerMap.set(ownerId, {
      id: ownerId,
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
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  const totalItems = bookings.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  const visibleBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE

    return bookings.slice(startIndex, endIndex)
  }, [bookings, currentPage])

  const fetchAdminSchedule = useCallback(async () => {
    try {
      setLoading(true)
      setErrorMessage("")

      const [fieldsRes, bookingsRes] = await Promise.all([
        apiGet<ApiResponse<ApiListData<AdminField>>>("/admin/fields", {
          page: 1,
          limit: 100,
        }),
        apiGet<ApiResponse<ApiListData<AdminBooking>>>("/admin/bookings", {
          page: 1,
          limit: 100,
        }),
      ])

      const fieldItems = extractItems(fieldsRes.data)
      const bookingItems = extractItems(bookingsRes.data)

      const mappedFields = fieldItems.map(mapFieldToScheduleField)
      const fieldMap = new Map(mappedFields.map((field) => [field.id, field]))

      const mappedBookings = bookingItems.map((booking) =>
        mapBookingToScheduleBooking(booking, fieldMap),
      )

      setFields(mappedFields)
      setOwners(buildOwners(fieldItems))
      setBookings(sortBookingsByNewest(mappedBookings))
      setCurrentPage(1)
    } catch (error) {
      console.error(error)

      setFields([])
      setOwners([])
      setBookings([])
      setCurrentPage(1)

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đặt sân",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdminSchedule()
  }, [fetchAdminSchedule])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Quản Lý Đặt Sân</h1>
            <p className="text-muted-foreground">
              Xem tổng quan tất cả đơn đặt sân trong hệ thống
            </p>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p>{errorMessage}</p>

            <button
              type="button"
              onClick={fetchAdminSchedule}
              className="w-fit rounded-md border border-destructive/40 px-3 py-1.5 text-sm font-medium hover:bg-destructive/10"
            >
              Thử lại
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted-foreground">
          Đang tải danh sách đặt sân...
        </div>
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}