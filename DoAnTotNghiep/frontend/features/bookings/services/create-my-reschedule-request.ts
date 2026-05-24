import { apiRequest } from "@/lib/api-client";

export type CreateMyRescheduleRequestPayload = {
  start_datetime: string;
  end_datetime: string;
  reason?: string | null;
};

export type CreateMyRescheduleRequestResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    booking_id: number;
    status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | string;
    old_start_datetime: string;
    old_end_datetime: string;
    new_start_datetime: string;
    new_end_datetime: string;
    reason?: string | null;
  };
};

export async function createMyRescheduleRequest(
  bookingId: number,
  payload: CreateMyRescheduleRequestPayload,
) {
  return apiRequest<CreateMyRescheduleRequestResponse>(
    `/bookings/my/${bookingId}/reschedule-requests`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );
}