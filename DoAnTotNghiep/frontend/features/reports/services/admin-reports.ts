import { apiRequest } from "@/lib/api-client"

export type AdminReportRange =
  | "today"
  | "7d"
  | "30d"
  | "month"
  | "year"
  | "custom"

export type AdminReportsParams = {
  range?: AdminReportRange
  sport_type?: string | null
  district?: string | null
  from?: string
  to?: string
}

export type AdminReportSummary = {
  total_revenue: number
  total_bookings: number
  revenue_bookings: number
  total_users: number
  total_owners: number
  locked_users: number
  total_fields: number
  active_fields: number
  pending_fields: number
  maintenance_fields: number
  avg_rating: number
  voucher_discount_total: number
  revenue_growth_percent: number
  booking_growth_percent: number

  // optional: nếu backend sau này có thì tự nhận
  pending_owners?: number
  hidden_reviews?: number
}

export type AdminReportsData = {
  range: {
    key: string
    from: string
    to: string
  }
  filters: {
    sport_type: string | null
    district: string | null
  }
  summary: AdminReportSummary
  revenue_series: Array<{
    key?: string
    label: string
    revenue: number
    bookings: number
  }>
  booking_status: Array<{
    status: string
    count: number
  }>
  field_status: Array<{
    status: string
    count: number
  }>
  top_fields: Array<{
    field_id: number
    field_name: string
    owner_id: number | null
    owner_name: string
    sport_type: string | null
    district: string | null
    bookings: number
    revenue: number
  }>
  top_owners: Array<{
    owner_id: number
    owner_name: string
    bookings: number
    revenue: number
    field_count: number
  }>
  sport_breakdown: Array<{
    sport_type: string
    bookings: number
    revenue: number
  }>
  district_breakdown: Array<{
    district: string
    bookings: number
    revenue: number
  }>
  payment_methods: Array<{
    method: string
    count: number
    amount: number
  }>
  voucher_impact: {
    original_revenue: number
    final_revenue: number
    discount_total: number
    voucher_booking_count: number
    voucher_usage_rate: number
  }
}

export type AdminReportsResponse = {
  success: boolean
  message: string
  data: AdminReportsData
}

export function getAdminReports(params: AdminReportsParams = {}) {
  const searchParams = new URLSearchParams()

  searchParams.set("range", params.range || "month")

  if (params.sport_type) {
    searchParams.set("sport_type", params.sport_type)
  }

  if (params.district) {
    searchParams.set("district", params.district)
  }

  if (params.from) {
    searchParams.set("from", params.from)
  }

  if (params.to) {
    searchParams.set("to", params.to)
  }

  return apiRequest<AdminReportsResponse>(
    `/admin/reports?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    },
  )
}