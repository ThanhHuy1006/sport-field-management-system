import { apiRequest } from "@/lib/api-client";

export type RejectOwnerBookingResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    status: string;
    rejection_reason?: string | null;
  };
};

export function rejectOwnerBooking(bookingId: number, reason: string) {
  return apiRequest<RejectOwnerBookingResponse>(
    `/owner/bookings/${bookingId}/reject`,
    {
      method: "PATCH",
      body: JSON.stringify({ reason }),
      requireAuth: true,
    }
  );
}