import { apiRequest } from "@/lib/api-client"

export type OwnerFieldStatus = "pending" | "active" | "hidden" | "maintenance"
export type OwnerApprovalMode = "MANUAL" | "AUTO"

export type OwnerOperatingWindowPayload = {
  start_time: string
  end_time: string
}

export type OwnerOperatingHourPayload = {
  day_of_week: number
  is_closed: boolean

  /**
   * Format mới:
   * Một ngày có thể có nhiều ca mở cửa.
   */
  windows?: OwnerOperatingWindowPayload[]

  /**
   * Optional để không làm vỡ code cũ nếu chỗ nào còn gửi open_time/close_time.
   */
  open_time?: string | null
  close_time?: string | null
}

export type OwnerOperatingWindowApi = {
  id?: number | string | null
  start_time: string
  end_time: string
}

export type OwnerOperatingHourApi = {
  day_of_week: number
  is_closed: boolean
  windows: OwnerOperatingWindowApi[]

  /**
   * Optional fallback cho response cũ nếu còn page nào dùng.
   */
  id?: number | null
  field_id?: number
  open_time?: string | null
  close_time?: string | null
}

export type OwnerFieldApi = {
  id: number
  owner_id: number
  field_name: string | null
  sport_type: string | null
  description: string | null

  address: string | null
  address_line: string | null
  ward: string | null
  district: string | null
  province: string | null

  latitude: number | null
  longitude: number | null
  base_price_per_hour: number
  currency: string | null
  status: OwnerFieldStatus
  approval_mode?: OwnerApprovalMode | string | null

  min_duration_minutes: number | null
  slot_step_minutes?: number | null
  advance_booking_days?: number | null
  max_players: number | null

  created_at?: string | null
  updated_at?: string | null

  pricing_rules?: Array<{
    id: number
    day_type: "WEEKDAY" | "WEEKEND" | "HOLIDAY" | "CUSTOM"
    start_time: string
    end_time: string
    price: number
    currency: string | null
    priority: number | null
    active: boolean | null
  }>

  operating_hours?: OwnerOperatingHourApi[]

  amenities?: Array<{
    id: number
    name: string | null
    icon?: string | null
    note?: string | null
  }>

  images?: Array<{
    id: number
    url: string
    is_primary: boolean | null
    order_no: number | null
  }>

  hidden_by_role?: string | null
  hidden_reason?: string | null
  hidden_at?: string | null
}

export type CreateOwnerFieldPayload = {
  field_name: string
  sport_type: string
  description?: string | null

  address?: string
  address_line?: string | null
  ward?: string | null
  district?: string | null
  province?: string | null

  latitude?: number | null
  longitude?: number | null

  base_price_per_hour?: number
  weekday_price?: number
  weekend_price?: number

  currency?: string
  min_duration_minutes?: number
  slot_step_minutes?: number
  advance_booking_days?: number
  max_players?: number | null

  approval_mode?: OwnerApprovalMode
  amenities?: string[]

  /**
   * Format mới:
   * operating_hours gồm 7 ngày.
   * Mỗi ngày có thể đóng cửa hoặc có nhiều windows.
   */
  operating_hours: OwnerOperatingHourPayload[]
}

export type UpdateOwnerFieldPayload = Partial<
  Omit<CreateOwnerFieldPayload, "operating_hours">
> & {
  operating_hours?: OwnerOperatingHourPayload[]
}

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export function getOwnerFields() {
  return apiRequest<ApiResponse<OwnerFieldApi[]>>("/owner/fields", {
    method: "GET",
  })
}

export function getOwnerFieldDetail(fieldId: number | string) {
  return apiRequest<ApiResponse<OwnerFieldApi>>(`/owner/fields/${fieldId}`, {
    method: "GET",
  })
}

export function createOwnerField(payload: CreateOwnerFieldPayload) {
  return apiRequest<ApiResponse<OwnerFieldApi>>("/owner/fields", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export function updateOwnerField(
  fieldId: number | string,
  payload: UpdateOwnerFieldPayload,
) {
  return apiRequest<ApiResponse<OwnerFieldApi>>(`/owner/fields/${fieldId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}

export function updateOwnerFieldStatus(
  fieldId: number | string,
  status: OwnerFieldStatus,
) {
  return apiRequest<ApiResponse<OwnerFieldApi>>(
    `/owner/fields/${fieldId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
  )
}

/**
 * API này giữ lại để các page cũ không bị lỗi import.
 * Nếu sau này có route riêng để cập nhật giờ hoạt động thì payload cũng nên dùng windows[].
 */
export function updateOwnerOperatingHour(
  fieldId: number | string,
  payload: OwnerOperatingHourPayload,
) {
  return apiRequest<ApiResponse<OwnerOperatingHourApi>>(
    `/owner/fields/${fieldId}/operating-hours`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
  )
}

export function setOwnerFieldPrimaryImage(
  fieldId: number | string,
  imageId: number | string,
) {
  return apiRequest<ApiResponse<OwnerFieldApi>>(
    `/owner/fields/${fieldId}/images/${imageId}/primary`,
    {
      method: "PATCH",
    },
  )
}

export function uploadOwnerFieldImages(fieldId: number | string, files: File[]) {
  const formData = new FormData()

  files.forEach((file) => {
    formData.append("images", file)
  })

  return apiRequest<ApiResponse<OwnerFieldApi>>(
    `/owner/fields/${fieldId}/images`,
    {
      method: "POST",
      body: formData,
    },
  )
}

export function deleteOwnerFieldImage(
  fieldId: number | string,
  imageId: number | string,
) {
  return apiRequest<ApiResponse<OwnerFieldApi>>(
    `/owner/fields/${fieldId}/images/${imageId}`,
    {
      method: "DELETE",
    },
  )
}