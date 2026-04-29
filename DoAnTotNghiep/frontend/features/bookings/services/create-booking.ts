import { apiRequest } from "@/lib/api-client"

export type BookingPaymentMethod = "ONSITE" | "BANK_TRANSFER"
export type BookingApprovalMode = "AUTO" | "MANUAL"

export type CreateBookingPayload = {
  field_id: number
  start_datetime: string
  end_datetime: string
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  requested_payment_method?: BookingPaymentMethod
  notes?: string | null
  voucher_code?: string | null
}

export type BookingVoucher = {
  id: number
  code: string
  type: "FIXED" | "PERCENT" | string
  discount_value: string | number | null
  max_discount_amount?: string | number | null
}

export type CreateBookingResponse = {
  success: boolean
  message: string
  data: {
    id: number
    field_id: number
    user_id: number
    start_datetime: string
    end_datetime: string
    status: string
    notes: string | null
    contact_name?: string | null
    contact_email?: string | null
    contact_phone?: string | null
    approval_mode_snapshot?: BookingApprovalMode | null
    requested_payment_method?: BookingPaymentMethod | null

    original_price?: string | number | null
    discount_amount?: string | number | null
    total_price: string | number
    voucher_id?: number | null
    voucher?: BookingVoucher | null

    checked_in_at: string | null
    checked_in_by: number | null
    checkin_method: string | null
    created_at: string
    payment_expires_at?: string | null

    field: {
      id: number
      field_name?: string | null
      address?: string | null
      sport_type?: string | null
      base_price_per_hour?: string | number | null
      currency?: string | null
    } | null

    status_history: {
      id: number
      from_status: string | null
      to_status: string | null
      changed_at: string | null
      reason: string | null
    }[]

    review?: {
      id: number
      rating: number
      comment: string | null
      created_at: string
    } | null
  }
}

export function createBooking(payload: CreateBookingPayload) {
  return apiRequest<CreateBookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true,
  })
}