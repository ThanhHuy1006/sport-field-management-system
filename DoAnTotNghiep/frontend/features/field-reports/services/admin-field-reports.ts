import { apiGet, apiRequest } from "@/lib/api-client"
import type {
  FieldReport,
  FieldReportReason,
  FieldReportStatus,
} from "@/types/field-report"

export type AdminFieldReportsParams = {
  page?: number
  limit?: number
  status?: FieldReportStatus | "all"
  reason?: FieldReportReason | "all"
}

export type AdminFieldReportsResponse = {
  success: boolean
  message: string
  data: {
    items: FieldReport[]
    pagination: {
      page: number
      limit: number
      total: number
      total_pages: number
    }
  }
}

export type UpdateFieldReportStatusPayload = {
  status: FieldReportStatus
  admin_note?: string | null
  hide_field?: boolean
}

export type UpdateFieldReportStatusResponse = {
  success: boolean
  message: string
  data: FieldReport
}

export function getAdminFieldReports(params: AdminFieldReportsParams = {}) {
  return apiGet<AdminFieldReportsResponse>(
    "/admin/field-reports",
    {
      page: params.page ?? 1,
      limit: params.limit ?? 10,
      status: params.status === "all" ? undefined : params.status,
      reason: params.reason === "all" ? undefined : params.reason,
    },
    {
      requireAuth: true,
    },
  )
}

export function getAdminFieldReportDetail(reportId: number) {
  return apiGet<{
    success: boolean
    message: string
    data: FieldReport
  }>(`/admin/field-reports/${reportId}`, undefined, {
    requireAuth: true,
  })
}

export function updateFieldReportStatus(
  reportId: number,
  payload: UpdateFieldReportStatusPayload,
) {
  return apiRequest<UpdateFieldReportStatusResponse>(
    `/admin/field-reports/${reportId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      requireAuth: true,
    },
  )
}