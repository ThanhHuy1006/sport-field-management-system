import { apiGet } from "@/lib/api-client";

export type BookingStatus =
  | "PENDING_CONFIRM"
  | "APPROVED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "PAY_FAILED"
  | "CHECKED_IN"
  | "PAYMENT_EXPIRED";

export type BookingPaymentMethod = "ONSITE" | "BANK_TRANSFER";

export type MyBookingListItem = {
  id: number;
  field_id: number;
  user_id: number;
  start_datetime: string;
  end_datetime: string;
  status: BookingStatus;
  requested_payment_method: BookingPaymentMethod | null;
  notes: string | null;
  total_price: string | number;
  checked_in_at: string | null;
  checked_in_by: number | null;
  checkin_method: string | null;
  created_at: string;
  field: {
    id: number;
    field_name: string;
    address: string | null;
    sport_type: string | null;
    base_price_per_hour: string | number | null;
    currency: string | null;
  } | null;
  payment_expires_at?: string | null;
};

export type GetMyBookingsResponse = {
  success: boolean;
  message: string;
  data: {
    items: MyBookingListItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

type Params = {
  page?: number;
  limit?: number;
  status?: BookingStatus;
};

export function getMyBookings(params: Params = {}) {
  return apiGet<GetMyBookingsResponse>("/bookings/my", params, {
    requireAuth: true,
  });
}