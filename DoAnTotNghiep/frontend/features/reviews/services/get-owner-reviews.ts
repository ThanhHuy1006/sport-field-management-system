import { apiGet } from "@/lib/api-client"

export type OwnerReviewItem = {
  id: number
  booking_id: number
  field_id: number
  user_id: number
  rating: number
  comment: string | null
  visible: boolean
  reply_text: string | null
  reply_at: string | null
  created_at: string
  user: {
    id: number
    name: string | null
    avatar_url: string | null
  } | null
  field: {
    id: number
    field_name: string
  } | null
}

export type GetOwnerReviewsResponse = {
  success: boolean
  message: string
  data: OwnerReviewItem[]
}

export function getOwnerReviews() {
  return apiGet<GetOwnerReviewsResponse>("/owner/reviews", undefined, {
    requireAuth: true,
  })
}