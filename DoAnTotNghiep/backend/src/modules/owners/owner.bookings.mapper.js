export function mapOwnerBooking(item) {
  if (!item) return null;

  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,

    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    notes: item.notes,

    approval_mode_snapshot: item.approval_mode_snapshot || null,
    requested_payment_method: item.requested_payment_method || null,

    contact_name: item.contact_name || null,
    contact_email: item.contact_email || null,
    contact_phone: item.contact_phone || null,

    original_price: item.original_price ?? null,
    discount_amount: item.discount_amount ?? null,
    total_price: item.total_price,

    voucher_id: item.voucher_id ?? null,
    voucher: item.voucher
      ? {
          id: item.voucher.id,
          code: item.voucher.code,
          type: item.voucher.type,
          discount_value: item.voucher.discount_value,
          max_discount_amount: item.voucher.max_discount_amount,
        }
      : null,

    checked_in_at: item.checked_in_at || null,
    checked_in_by: item.checked_in_by || null,
    checkin_method: item.checkin_method || null,

    payment_expires_at: item.payment_expires_at || null,
    created_at: item.created_at,
    updated_at: item.updated_at,

    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
        }
      : item.field
        ? {
            id: item.field.id,
            field_name: item.field.field_name,
            address: item.field.address,
            sport_type: item.field.sport_type,
          }
        : null,

    user: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
          phone: item.users.phone,
        }
      : item.user
        ? {
            id: item.user.id,
            name: item.user.name,
            email: item.user.email,
            phone: item.user.phone,
          }
        : null,

    status_history: (
      item.booking_status_history ||
      item.status_history ||
      []
    ).map((h) => ({
      id: h.id,
      from_status: h.from_status,
      to_status: h.to_status,
      changed_at: h.changed_at,
      reason: h.reason ?? h.note ?? null,
    })),
  };
}

export function mapOwnerBookings(items) {
  return Array.isArray(items) ? items.map(mapOwnerBooking) : [];
}