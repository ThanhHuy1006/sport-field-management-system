import { apiRequest } from "@/lib/api-client"

export type CancelOwnerBookingPayload = {
  reason: string
}

export async function cancelOwnerBooking(
  bookingId: number,
  payload: CancelOwnerBookingPayload,
) {
  return apiRequest(`/owner/bookings/${bookingId}/cancel`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  })
}