import { apiRequest } from "@/lib/api-client";

export type OwnerBookingDetail = {
  id: number;
  field_id: number;
  user_id: number;
  start_datetime: string;
  end_datetime: string;
  status: string;
  notes: string | null;
  approval_mode_snapshot: "AUTO" | "MANUAL" | null;
  requested_payment_method: "ONSITE" | "BANK_TRANSFER" | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  total_price: string | number;
  checked_in_at: string | null;
  checked_in_by: number | null;
  checkin_method: string | null;
  created_at: string;
  field: {
    id: number;
    field_name: string | null;
    address: string | null;
    sport_type: string | null;
  } | null;
  user: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
};

export type OwnerBookingResponse = {
  success: boolean;
  message: string;
  data: OwnerBookingDetail;
};

export type OwnerBookingsResponse = {
  success: boolean;
  message: string;
  data: {
    items: OwnerBookingDetail[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
};

export async function getOwnerBookings(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const searchParams = new URLSearchParams();

  searchParams.set("page", String(params?.page ?? 1));
  searchParams.set("limit", String(params?.limit ?? 50));

  if (params?.status) {
    searchParams.set("status", params.status);
  }

  return apiRequest<OwnerBookingsResponse>(
    `/owner/bookings?${searchParams.toString()}`,
    {
      method: "GET",
      requireAuth: true,
    }
  );
}

export async function getOwnerBookingDetail(bookingId: number) {
  return apiRequest<OwnerBookingResponse>(`/owner/bookings/${bookingId}`, {
    method: "GET",
    requireAuth: true,
  });
}

export async function checkInOwnerBooking(bookingId: number) {
  return apiRequest<OwnerBookingResponse>(
    `/owner/bookings/${bookingId}/check-in`,
    {
      method: "PATCH",
      body: JSON.stringify({
        note: "Checked in manually by owner",
      }),
      requireAuth: true,
    }
  );
}

export async function completeOwnerBooking(bookingId: number) {
  return apiRequest<OwnerBookingResponse>(
    `/owner/bookings/${bookingId}/complete`,
    {
      method: "PATCH",
      body: JSON.stringify({
        note: "Completed by owner",
      }),
      requireAuth: true,
    }
  );
}

export async function scanOwnerBookingQr(qrToken: string) {
  return apiRequest<OwnerBookingResponse>("/owner/bookings/check-in/scan", {
    method: "POST",
    body: JSON.stringify({
      qr_token: qrToken,
    }),
    requireAuth: true,
  });
}