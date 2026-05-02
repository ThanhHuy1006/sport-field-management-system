import { apiRequest } from "@/lib/api-client"
import type {
  ReviewReport,
  ReviewReportReason,
  ReviewReportStatus,
} from "@/types/review-report"

export type AdminReviewReportsParams = {
  page?: number
  limit?: number
  status?: ReviewReportStatus
  reason?: ReviewReportReason
}

type AdminReviewReportsResponse = {
  success: boolean
  message: string
  data: {
    items: ReviewReport[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }
}

type UpdateReviewReportStatusPayload = {
  status: ReviewReportStatus
  admin_note?: string | null
  hide_review?: boolean
}

type UpdateReviewReportStatusResponse = {
  success: boolean
  message: string
  data: ReviewReport
}

export function getAdminReviewReports(params: AdminReviewReportsParams = {}) {
  const searchParams = new URLSearchParams()

  searchParams.set("page", String(params.page ?? 1))
  searchParams.set("limit", String(params.limit ?? 100))

  if (params.status) {
    searchParams.set("status", params.status)
  }

  if (params.reason) {
    searchParams.set("reason", params.reason)
  }

  return apiRequest<AdminReviewReportsResponse>(
    `/admin/review-reports?${searchParams.toString()}`,
    {
      requireAuth: true,
    },
  )
}

export function updateReviewReportStatus(
  reportId: number,
  payload: UpdateReviewReportStatusPayload,
) {
  return apiRequest<UpdateReviewReportStatusResponse>(
    `/admin/review-reports/${reportId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requireAuth: true,
    },
  )
}