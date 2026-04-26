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
    total_price: item.total_price,
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
    notes: item.notes,

    approval_mode_snapshot: item.approval_mode_snapshot ?? null,
requested_payment_method: item.requested_payment_method ?? null,
    contact_name: item.contact_name ?? null,
    contact_email: item.contact_email ?? null,
    contact_phone: item.contact_phone ?? null,
    total_price: item.total_price,
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
    total_price: item.total_price,
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
    total_price: item.total_price,
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
