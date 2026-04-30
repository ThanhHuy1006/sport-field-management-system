import { apiRequest } from "@/lib/api-client"

export type OwnerDashboardSummary = {
  total_fields: number
  pending_bookings: number
  total_bookings_this_month: number
  total_revenue_this_month: number
}

export type OwnerDashboardSummaryResponse = {
  success: boolean
  message: string
  data: OwnerDashboardSummary
}

export type OwnerDashboardBooking = {
  id: number
  field_id: number
  user_id: number
  start_datetime: string
  end_datetime: string
  status: string
  notes?: string | null
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  requested_payment_method?: "ONSITE" | "BANK_TRANSFER" | string | null
  original_price?: string | number | null
  discount_amount?: string | number | null
  total_price: string | number
  created_at?: string
  users?: {
    id: number
    name: string | null
    email: string | null
    phone: string | null
  } | null
  fields?: {
    id: number
    field_name: string
    address?: string | null
  } | null
}

export type RecentOwnerBookingsResponse = {
  success: boolean
  message: string
  data: OwnerDashboardBooking[]
}

export type OwnerNotification = {
  id: number
  user_id: number
  title: string
  message: string
  type: string | null
  is_read: boolean
  created_at: string
}

export type RecentOwnerNotificationsResponse = {
  success: boolean
  message: string
  data: OwnerNotification[]
}

export type ApproveOwnerBookingResponse = {
  success: boolean
  message: string
  data: unknown
}

export type RejectOwnerBookingResponse = {
  success: boolean
  message: string
  data: unknown
}

export function getOwnerDashboardSummary() {
  return apiRequest<OwnerDashboardSummaryResponse>("/owner/dashboard/summary", {
    method: "GET",
    requireAuth: true,
  })
}

export function getRecentOwnerBookings() {
  return apiRequest<RecentOwnerBookingsResponse>(
    "/owner/dashboard/recent-bookings",
    {
      method: "GET",
      requireAuth: true,
    },
  )
}

export function getRecentOwnerNotifications() {
  return apiRequest<RecentOwnerNotificationsResponse>(
    "/owner/dashboard/recent-notifications",
    {
      method: "GET",
      requireAuth: true,
    },
  )
}

export function approveOwnerBooking(bookingId: number) {
  return apiRequest<ApproveOwnerBookingResponse>(
    `/owner/bookings/${bookingId}/approve`,
    {
      method: "PATCH",
      requireAuth: true,
    },
  )
}

export function rejectOwnerBooking(bookingId: number, note = "Rejected from owner dashboard") {
  return apiRequest<RejectOwnerBookingResponse>(
    `/owner/bookings/${bookingId}/reject`,
    {
      method: "PATCH",
      requireAuth: true,
      body: JSON.stringify({ note }),
    },
  )
}