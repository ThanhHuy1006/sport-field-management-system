import { apiGet } from "@/lib/api-client";

export type OwnerBookingStatus =
  | "PENDING_CONFIRM"
  | "APPROVED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "PAY_FAILED"
  | "CHECKED_IN";

// export type OwnerBookingListItem = {
//   id: number;
//   field_id: number;
//   user_id: number;
//   start_datetime: string;
//   end_datetime: string;
//   status: OwnerBookingStatus;
//   total_price: string | number;
//   notes?: string | null;
//   rejection_reason?: string | null;
//   checked_in_at?: string | null;
//   user?: {
//     id: number;
//     full_name?: string | null;
//     phone_number?: string | null;
//     email?: string | null;
//   } | null;
//   field?: {
//     id: number;
//     field_name?: string | null;
//     address?: string | null;
//     sport_type?: string | null;
//     base_price_per_hour?: string | number | null;
//   } | null;
// };
export type OwnerBookingListItem = {
  id: number;
  field_id: number;
  user_id: number;
  start_datetime: string;
  end_datetime: string;
  status: OwnerBookingStatus;
  total_price: string | number;
  notes?: string | null;
  contact_name?: string | null
  contact_email?: string | null
  contact_phone?: string | null
  rejection_reason?: string | null;
  checked_in_at?: string | null;
  user?: {
    id: number;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    full_name?: string | null;
    phone_number?: string | null;
  } | null;
  field?: {
    id: number;
    field_name?: string | null;
    address?: string | null;
    sport_type?: string | null;
    base_price_per_hour?: string | number | null;
  } | null;
};

export type GetOwnerBookingsResponse = {
  success: boolean;
  message: string;
  data: {
    items: OwnerBookingListItem[];
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
  status?: OwnerBookingStatus;
};

export function getOwnerBookings(params: Params = {}) {
  return apiGet<GetOwnerBookingsResponse>("/owner/bookings", params, {
    requireAuth: true,
  });
}