import { apiGet } from "@/lib/api-client"

export type OwnerFieldStatus = "pending" | "active" | "hidden" | "maintenance"

export type OwnerFieldImage = {
  id: number
  url: string
  is_primary?: boolean | null
  order_no?: number | null
}

export type OwnerFieldApi = {
  id: number
  owner_id: number
  field_name: string | null
  sport_type: string | null
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  base_price_per_hour: number
  currency: string | null
  status: OwnerFieldStatus
  min_duration_minutes: number | null
  max_players: number | null
  created_at: string | null
  images: OwnerFieldImage[]
}

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

export function getOwnerFields() {
  return apiGet("/owner/fields") as Promise<ApiResponse<OwnerFieldApi[]>>
}