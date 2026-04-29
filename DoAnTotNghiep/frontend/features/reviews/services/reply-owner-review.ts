import { apiRequest } from "@/lib/api-client"
import type { OwnerReviewItem } from "./get-owner-reviews"

export type ReplyOwnerReviewPayload = {
  reply_text: string
}

export type ReplyOwnerReviewResponse = {
  success: boolean
  message: string
  data: OwnerReviewItem
}

export function replyOwnerReview(
  reviewId: number,
  payload: ReplyOwnerReviewPayload,
) {
  return apiRequest<ReplyOwnerReviewResponse>(
    `/owner/reviews/${reviewId}/reply`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requireAuth: true,
    },
  )
}