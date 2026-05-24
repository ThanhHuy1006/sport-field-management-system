import { apiRequest } from "@/lib/api-client";

export async function approveOwnerRescheduleRequest(requestId: number) {
  return apiRequest(`/owner/bookings/reschedule-requests/${requestId}/approve`, {
    method: "PATCH",
  });
}