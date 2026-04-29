import { apiRequest } from "@/lib/api-client"

export type CreateReviewPayload = {
  booking_id: number
  rating: number
  comment?: string | null
}

export type ReviewItem = {
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
  user?: {
    id: number
    name: string | null
    avatar_url?: string | null
  } | null
  field?: {
    id: number
    field_name: string
  } | null
}

export type CreateReviewResponse = {
  success: boolean
  message: string
  data: ReviewItem
}

export function createReview(payload: CreateReviewPayload) {
  return apiRequest<CreateReviewResponse>("/reviews", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true,
  })
}