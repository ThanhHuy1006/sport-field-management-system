import { apiRequest } from "@/lib/api-client";
import type {
  CreateFieldReportPayload,
  FieldReport,
} from "@/types";

type CreateFieldReportResponse = {
  success: boolean;
  message: string;
  data: FieldReport;
};

export async function createFieldReport(
  payload: CreateFieldReportPayload
): Promise<CreateFieldReportResponse> {
  const formData = new FormData();

  formData.append("field_id", String(payload.field_id));
  formData.append("reason", payload.reason);

  if (payload.booking_id) {
    formData.append("booking_id", String(payload.booking_id));
  }

  if (payload.description) {
    formData.append("description", payload.description);
  }

  payload.images?.forEach((file) => {
    formData.append("images", file);
  });

  return apiRequest<CreateFieldReportResponse>("/field-reports", {
    method: "POST",
    body: formData,
    requireAuth: true,
  });
}