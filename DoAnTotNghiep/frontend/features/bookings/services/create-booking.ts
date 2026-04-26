import { apiRequest } from "@/lib/api-client";

export type BookingPaymentMethod = "ONSITE" | "BANK_TRANSFER";
export type BookingApprovalMode = "AUTO" | "MANUAL";

export type CreateBookingPayload = {
  field_id: number;
  start_datetime: string;
  end_datetime: string;
  contact_name?: string | null;
  contact_email?: string | null;
  contact_phone?: string | null;
  requested_payment_method?: BookingPaymentMethod;
  notes?: string | null;
};

export type CreateBookingResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    field_id: number;
    user_id: number;
    start_datetime: string;
    end_datetime: string;
    status: string;
    notes: string | null;
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
    approval_mode_snapshot?: BookingApprovalMode | null;
    requested_payment_method?: BookingPaymentMethod | null;
    total_price: string | number;
    checked_in_at: string | null;
    checked_in_by: number | null;
    checkin_method: string | null;
    created_at: string;
    field: {
      id: number;
      field_name?: string | null;
      address?: string | null;
      sport_type?: string | null;
      base_price_per_hour?: string | number | null;
      currency?: string | null;
    } | null;
    status_history: {
      id: number;
      from_status: string | null;
      to_status: string | null;
      changed_at: string | null;
      reason: string | null;
    }[];
  };
};

export function createBooking(payload: CreateBookingPayload) {
  return apiRequest<CreateBookingResponse>("/bookings", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true,
  });
}