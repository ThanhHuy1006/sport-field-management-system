export function toBookingListItem(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    notes: item.notes,
    approval_mode_snapshot: item.approval_mode_snapshot ?? null,
    requested_payment_method: item.requested_payment_method ?? null,

    original_price: item.original_price,
    discount_amount: item.discount_amount ?? 0,
    total_price: item.total_price,
    voucher_id: item.voucher_id ?? null,
    voucher: toBookingVoucher(item),
    checked_in_at: item.checked_in_at || null,
    checked_in_by: item.checked_in_by || null,
    checkin_method: item.checkin_method || null,
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
    payment_expires_at: item.payment_expires_at || null,
    review: item.reviews?.[0]
      ? {
          id: item.reviews[0].id,
          rating: item.reviews[0].rating,
          comment: item.reviews[0].comment,
          created_at: item.reviews[0].created_at,
        }
      : null,
  };
}
function toBookingVoucher(item) {
  return item.voucher
    ? {
        id: item.voucher.id,
        code: item.voucher.code,
        type: item.voucher.type,
        discount_value: item.voucher.discount_value
          ? Number(item.voucher.discount_value)
          : null,
        max_discount_amount: item.voucher.max_discount_amount
          ? Number(item.voucher.max_discount_amount)
          : null,
      }
    : null;
}

export function toBookingDetail(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    notes: item.notes,

    approval_mode_snapshot: item.approval_mode_snapshot ?? null,
    requested_payment_method: item.requested_payment_method ?? null,
    contact_name: item.contact_name ?? null,
    contact_email: item.contact_email ?? null,
    contact_phone: item.contact_phone ?? null,
    original_price: item.original_price,
    discount_amount: item.discount_amount ?? 0,
    total_price: item.total_price,
    voucher_id: item.voucher_id ?? null,
    voucher: toBookingVoucher(item),
    checked_in_at: item.checked_in_at || null,
    checked_in_by: item.checked_in_by || null,
    checkin_method: item.checkin_method || null,
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
      reason: h.reason ?? null,
    })),
    payment_expires_at: item.payment_expires_at || null,
    review: item.reviews?.[0]
      ? {
          id: item.reviews[0].id,
          rating: item.reviews[0].rating,
          comment: item.reviews[0].comment,
          created_at: item.reviews[0].created_at,
        }
      : null,
  };
}

export function toOwnerBookingListItem(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    notes: item.notes,
    approval_mode_snapshot: item.approval_mode_snapshot ?? null,
    requested_payment_method: item.requested_payment_method ?? null,
    contact_name: item.contact_name ?? null,
    contact_email: item.contact_email ?? null,
    contact_phone: item.contact_phone ?? null,
    original_price: item.original_price,
    discount_amount: item.discount_amount ?? 0,
    total_price: item.total_price,
    voucher_id: item.voucher_id ?? null,
    voucher: toBookingVoucher(item),
    checked_in_at: item.checked_in_at || null,
    checked_in_by: item.checked_in_by || null,
    checkin_method: item.checkin_method || null,
    created_at: item.created_at,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
        }
      : null,
    user: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
          phone: item.users.phone,
        }
      : null,
    payment_expires_at: item.payment_expires_at || null,
  };
}

export function toOwnerBookingDetail(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    notes: item.notes,
    approval_mode_snapshot: item.approval_mode_snapshot ?? null,
    requested_payment_method: item.requested_payment_method ?? null,
    contact_name: item.contact_name ?? null,
    contact_email: item.contact_email ?? null,
    contact_phone: item.contact_phone ?? null,
    original_price: item.original_price,
    discount_amount: item.discount_amount ?? 0,
    total_price: item.total_price,
    voucher_id: item.voucher_id ?? null,
    voucher: toBookingVoucher(item),
    checked_in_at: item.checked_in_at || null,
    checked_in_by: item.checked_in_by || null,
    checkin_method: item.checkin_method || null,
    created_at: item.created_at,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
        }
      : null,
    user: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
          phone: item.users.phone,
        }
      : null,
    status_history: (item.booking_status_history || []).map((h) => ({
      id: h.id,
      from_status: h.from_status,
      to_status: h.to_status,
      changed_at: h.changed_at,
      reason: h.reason ?? null,
    })),
    payment_expires_at: item.payment_expires_at || null,
  };
}

export function toAvailabilitySlot(item) {
  return {
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    start_time: item.start_time,
    end_time: item.end_time,
    available: item.available,
    reason: item.reason ?? null,
    booking_status: item.booking_status ?? null,
  };
}
