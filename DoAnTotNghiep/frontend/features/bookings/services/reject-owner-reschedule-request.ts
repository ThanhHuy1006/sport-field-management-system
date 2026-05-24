import { apiRequest } from "@/lib/api-client";

export async function rejectOwnerRescheduleRequest(
  requestId: number,
  ownerNote: string,
) {
  return apiRequest(`/owner/bookings/reschedule-requests/${requestId}/reject`, {
    method: "PATCH",
    body: JSON.stringify({
      owner_note: ownerNote,
    }),
  });
}