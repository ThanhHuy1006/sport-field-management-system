import { apiRequest } from "@/lib/api-client";
export type CreateMyRescheduleRequestPayload = {
  start_datetime: string;
  end_datetime: string;
  reason?: string | null;
};

export async function createMyRescheduleRequest(
  bookingId: number,
  payload: CreateMyRescheduleRequestPayload,
) {
  return apiRequest(`/bookings/my/${bookingId}/reschedule-requests`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}