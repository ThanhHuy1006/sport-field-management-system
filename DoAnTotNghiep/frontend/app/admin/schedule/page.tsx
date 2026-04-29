"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ScheduleManager, type Booking, type Field, type Owner } from "@/components/schedule-manager"
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
  base_price_per_hour: number
  status: string
  owner: {
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
  total_price: number
  notes: string | null
  created_at: string | null
  updated_at: string | null
  user: {
    id: number
    name: string | null
    email: string | null
    phone: string | null
  } | null
  field: {
    id: number
    field_name: string | null
    address: string | null
    sport_type: string | null
    owner_id: number
  } | null
}

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

function mapFieldToScheduleField(field: AdminField): Field {
  return {
    id: field.id,
    name: field.field_name || "Chưa cập nhật tên sân",
    type: field.sport_type || "Khác",
    pricePerHour: Number(field.base_price_per_hour || 0),
    ownerName: field.owner?.name || "Chưa cập nhật",
  }
}

function mapBookingToScheduleBooking(booking: AdminBooking, fieldMap: Map<number, Field>): Booking {
  const field = fieldMap.get(booking.field_id)

  return {
    id: booking.id,
    fieldId: booking.field_id,
    fieldName: booking.field?.field_name || field?.name || "Chưa cập nhật tên sân",
    date: formatDateISO(booking.start_datetime),
    startTime: formatTime(booking.start_datetime),
    endTime: formatTime(booking.end_datetime),
    customerName: booking.user?.name || booking.user?.email || "Khách hàng",
    customerPhone: booking.user?.phone || "-",
    ownerName: field?.ownerName || "Chưa cập nhật",
    status: mapBookingStatus(booking.status),
    duration: calculateDuration(booking.start_datetime, booking.end_datetime),
    price: Number(booking.total_price || 0),
    location: booking.field?.address || undefined,
    rejectionReason:
      booking.status === "REJECTED" || booking.status === "CANCELLED" || booking.status === "PAY_FAILED"
        ? booking.notes || "Đơn đã bị từ chối hoặc đã hủy"
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
      name: field.owner?.name || "Chưa cập nhật",
      fieldCount: 1,
    })
  })

  return Array.from(ownerMap.values())
}

export default function AdminSchedulePage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [fields, setFields] = useState<Field[]>([])
  const [owners, setOwners] = useState<Owner[]>([])

  const fetchAdminSchedule = useCallback(async () => {
    try {
      const [fieldsRes, bookingsRes] = await Promise.all([
        apiGet<ApiResponse<AdminField[]>>("/admin/fields"),
        apiGet<ApiResponse<AdminBooking[]>>("/admin/bookings"),
      ])

      const mappedFields = fieldsRes.data.map(mapFieldToScheduleField)
      const fieldMap = new Map(mappedFields.map((field) => [field.id, field]))

      setFields(mappedFields)
      setOwners(buildOwners(fieldsRes.data))
      setBookings(bookingsRes.data.map((booking) => mapBookingToScheduleBooking(booking, fieldMap)))
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    fetchAdminSchedule()
  }, [fetchAdminSchedule])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Quản Lý Đặt Sân</h1>
            <p className="text-muted-foreground">Xem tổng quan tất cả đơn đặt sân trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* Schedule Manager Component */}
      <ScheduleManager bookings={bookings} fields={fields} owners={owners} isAdmin={true} />
    </div>
  )
}