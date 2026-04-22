import { apiGet } from "@/lib/api-client";

export type GetMyBookingCheckInQrResponse = {
  success: boolean;
  message: string;
  data: {
    booking_id: number;
    qr_token: string;
    expires_at: string;
  };
};

export function getMyBookingCheckInQr(bookingId: number) {
  return apiGet<GetMyBookingCheckInQrResponse>(
    `/bookings/my/${bookingId}/check-in-qr`,
    undefined,
    { requireAuth: true }
  );
}