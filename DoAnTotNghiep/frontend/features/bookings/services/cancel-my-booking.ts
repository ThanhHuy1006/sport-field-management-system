import { apiRequest } from "@/lib/api-client";

export type CancelMyBookingResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    cancelled_at?: string | null;
  };
};

export function cancelMyBooking(bookingId: number) {
  return apiRequest<CancelMyBookingResponse>(`/bookings/my/${bookingId}/cancel`, {
    method: "PATCH",
    requireAuth: true,
  });
}