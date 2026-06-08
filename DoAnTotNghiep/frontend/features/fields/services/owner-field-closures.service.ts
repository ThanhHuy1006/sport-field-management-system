import { apiPost } from "@/lib/api-client";

export type FieldClosureAction = "NOTIFY_ONLY" | "CANCEL_BOOKINGS";

export type FieldClosurePayload = {
  date: string;
  start_time: string;
  end_time: string;
  reason?: string;
  action?: FieldClosureAction;
};

export type AffectedClosureBooking = {
  id: number;
  customer_name?: string | null;
  start_datetime: string;
  end_datetime: string;
  status: string;
  total_price?: number | string | null;
};

export type PreviewFieldClosureResponse = {
  success: boolean;
  message: string;
  data: {
    total_affected: number;
    total_paid_amount?: number;
    bookings: AffectedClosureBooking[];
  };
};

export type CreateFieldClosureResponse = {
  success: boolean;
  message: string;
  data: {
    closure: unknown;
    total_affected: number;
    cancelled_count: number;
  };
};

export function previewOwnerFieldClosure(
  fieldId: number | string,
  payload: FieldClosurePayload,
): Promise<PreviewFieldClosureResponse> {
  return apiPost(`/owner/fields/${fieldId}/closures/preview`, payload);
}

export function createOwnerFieldClosure(
  fieldId: number | string,
  payload: Required<FieldClosurePayload>,
): Promise<CreateFieldClosureResponse> {
  return apiPost(`/owner/fields/${fieldId}/closures`, payload);
}
