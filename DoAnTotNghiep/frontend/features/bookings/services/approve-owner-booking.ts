import { apiRequest } from "@/lib/api-client";

export type ApproveOwnerBookingResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    status: string;
  };
};

export function approveOwnerBooking(bookingId: number) {
  return apiRequest<ApproveOwnerBookingResponse>(
    `/owner/bookings/${bookingId}/approve`,
    {
      method: "PATCH",
      requireAuth: true,
    }
  );
}