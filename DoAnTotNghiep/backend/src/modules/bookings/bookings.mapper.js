export function toBookingListItem(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    note: item.note,
    total_price: item.total_price,
    created_at: item.created_at,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
          base_price_per_hour: item.fields.base_price_per_hour,
          currency: item.fields.currency,
        }
      : null,
  };
}

export function toBookingDetail(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    note: item.note,
    total_price: item.total_price,
    created_at: item.created_at,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
          base_price_per_hour: item.fields.base_price_per_hour,
          currency: item.fields.currency,
        }
      : null,
    status_history: (item.booking_status_history || []).map((h) => ({
      id: h.id,
      from_status: h.from_status,
      to_status: h.to_status,
      changed_at: h.changed_at,
      note: h.note,
    })),
  };
}