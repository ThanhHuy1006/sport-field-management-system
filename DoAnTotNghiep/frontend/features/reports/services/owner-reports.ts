import { apiRequest } from "@/lib/api-client"

export type OwnerReportRange = "today" | "7d" | "30d" | "month" | "year" | "custom"

export type OwnerReportsParams = {
  range?: OwnerReportRange
  field_id?: number | "all" | null
  from?: string
  to?: string
}

export type OwnerReportSummary = {
  total_revenue: number
  total_bookings: number
  revenue_bookings: number
  total_customers: number
  avg_rating: number
  voucher_discount_total: number
  revenue_growth_percent: number
  booking_growth_percent: number
}

export type RevenueSeriesItem = {
  key?: string
  label: string
  revenue: number
  bookings: number
}

export type BookingStatusItem = {
  status: string
  count: number
}

export type BookingsByFieldItem = {
  field_id: number
  name: string
  value: number
}

export type BookingsByTimeItem = {
  time: string
  bookings: number
}

export type BookingsByDayItem = {
  day: string
  bookings: number
  revenue: number
}

export type FieldPerformanceItem = {
  field_id: number
  field_name: string
  sport_type: string | null
  district: string | null
  status: string
  bookings: number
  revenue: number
  voucher_discount: number
  avg_rating: number
  review_count: number
}

export type TopCustomerItem = {
  user_id: number
  name: string
  phone: string | null
  email: string | null
  bookings: number
  total_spent: number
  last_booking_at: string | null
}

export type PaymentMethodItem = {
  method: string
  count: number
  amount: number
}

export type VoucherImpact = {
  original_revenue: number
  final_revenue: number
  discount_total: number
  voucher_booking_count: number
  voucher_usage_rate: number
}

export type OwnerReportsData = {
  range: {
    key: string
    from: string
    to: string
  }
  filters: {
    field_id: number | null
  }
  summary: OwnerReportSummary
  revenue_series: RevenueSeriesItem[]
  booking_status: BookingStatusItem[]
  bookings_by_field: BookingsByFieldItem[]
  bookings_by_time: BookingsByTimeItem[]
  bookings_by_day: BookingsByDayItem[]
  field_performance: FieldPerformanceItem[]
  top_customers: TopCustomerItem[]
  payment_methods: PaymentMethodItem[]
  voucher_impact: VoucherImpact
}

export type OwnerReportsResponse = {
  success: boolean
  message: string
  data: OwnerReportsData
}

export function getOwnerReports(params: OwnerReportsParams = {}) {
  const searchParams = new URLSearchParams()

  searchParams.set("range", params.range || "month")

  if (params.field_id !== undefined && params.field_id !== null) {
    searchParams.set("field_id", String(params.field_id))
  } else {
    searchParams.set("field_id", "all")
  }

  if (params.from) {
    searchParams.set("from", params.from)
  }

  if (params.to) {
    searchParams.set("to", params.to)
  }

  return apiRequest<OwnerReportsResponse>(`/owner/reports?${searchParams.toString()}`, {
    method: "GET",
    requireAuth: true,
  })
}