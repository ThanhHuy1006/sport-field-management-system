const ALLOWED_PROVIDERS = ["VNPAY", "MOMO", "ZALOPAY", "ONSITE", "BANK_TRANSFER"];

export function validateCreatePaymentPayload(payload) {
  const booking_id = Number(payload.booking_id);
  const provider = String(payload.provider || "").trim();

  if (Number.isNaN(booking_id) || booking_id <= 0) {
    throw new Error("booking_id không hợp lệ");
  }

  if (!ALLOWED_PROVIDERS.includes(provider)) {
    throw new Error("provider không hợp lệ");
  }

  return {
    booking_id,
    provider,
  };
}