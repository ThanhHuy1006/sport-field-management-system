import { apiGet, apiRequest } from "@/lib/api-client";

export type PaymentProvider = "BANK_TRANSFER";

export type PaymentStatus = "pending" | "success" | "failed";

export type PaymentResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    booking_id: number;
    provider: PaymentProvider;
    amount: string | number;
    currency: string;
    status: PaymentStatus;
    transaction_code: string;
    paid_at: string | null;
    raw_response: string | null;
    created_at: string;
    updated_at: string;
    booking: {
      id: number;
      status: string;
      total_price: string | number;
      start_datetime: string;
      end_datetime: string;
      requested_payment_method?: "ONSITE" | "BANK_TRANSFER" | null;
    } | null;
  };
};

export async function getPaymentByBooking(bookingId: number) {
  return apiGet<PaymentResponse>(`/payments/by-booking/${bookingId}`, undefined, {
    requireAuth: true,
  });
}

export async function createPayment(bookingId: number) {
  return apiRequest<PaymentResponse>("/payments/create", {
    method: "POST",
    body: JSON.stringify({
      booking_id: bookingId,
      provider: "BANK_TRANSFER",
    }),
    requireAuth: true,
  });
}

export async function simulatePaymentSuccess(paymentId: number) {
  return apiRequest<PaymentResponse>(`/payments/${paymentId}/simulate-success`, {
    method: "POST",
    requireAuth: true,
  });
}

export async function simulatePaymentFailed(paymentId: number) {
  return apiRequest<PaymentResponse>(`/payments/${paymentId}/simulate-failed`, {
    method: "POST",
    requireAuth: true,
  });
}