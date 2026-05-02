import { apiRequest } from "@/lib/api-client";
import type {
  CreateReviewReportPayload,
  ReviewReport,
} from "@/types/review-report";

type CreateReviewReportResponse = {
  success: boolean;
  message: string;
  data: ReviewReport;
};

export function createReviewReport(payload: CreateReviewReportPayload) {
  return apiRequest<CreateReviewReportResponse>("/review-reports", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true,
  });
}