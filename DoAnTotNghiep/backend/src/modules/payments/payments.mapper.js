export function toPaymentResponse(item) {
  return {
    id: item.id,
    booking_id: item.booking_id,
    provider: item.provider,
    amount: item.amount,
    currency: item.currency,
    status: item.status,
    transaction_code: item.transaction_code,
    paid_at: item.paid_at || null,
    raw_response: item.raw_response || null,
    created_at: item.created_at,
    updated_at: item.updated_at,
    booking: item.bookings
      ? {
          id: item.bookings.id,
          status: item.bookings.status,
          total_price: item.bookings.total_price,
          start_datetime: item.bookings.start_datetime,
          end_datetime: item.bookings.end_datetime,
        }
      : null,
  };
}