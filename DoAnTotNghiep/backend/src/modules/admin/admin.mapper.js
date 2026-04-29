function mapOwnerProfileBrief(relation) {
  if (!relation) return null;

  const item = Array.isArray(relation) ? relation[0] : relation;
  if (!item) return null;

  return {
    status: item.status,
    business_name: item.business_name,
    tax_code: item.tax_code ?? null,
    address: item.address ?? null,
    license_url: item.license_url ?? null,
    id_front_url: item.id_front_url ?? null,
    id_back_url: item.id_back_url ?? null,
    approved_at: item.approved_at,
    reject_reason: item.reject_reason,
  };
}

export function toAdminUserResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone,
    avatar_url: item.avatar_url,
    role: item.role,
    status: item.status,
    created_at: item.created_at,
    updated_at: item.updated_at ?? null,
    owner_profile: mapOwnerProfileBrief(
      item.owner_profiles_owner_profiles_user_idTousers
    ),
  };
}

export function toAdminOwnerRegistrationResponse(item) {
  if (!item) return null;

  return {
    user_id: item.user_id,
    business_name: item.business_name,
    tax_code: item.tax_code ?? null,
    address: item.address ?? null,
    license_url: item.license_url ?? null,
    id_front_url: item.id_front_url ?? null,
    id_back_url: item.id_back_url ?? null,
    status: item.status,
    approved_by: item.approved_by,
    approved_at: item.approved_at,
    reject_reason: item.reject_reason,
    created_at: item.created_at,
    user: item.users_owner_profiles_user_idTousers
      ? {
          id: item.users_owner_profiles_user_idTousers.id,
          name: item.users_owner_profiles_user_idTousers.name,
          email: item.users_owner_profiles_user_idTousers.email,
          phone: item.users_owner_profiles_user_idTousers.phone,
          role: item.users_owner_profiles_user_idTousers.role,
          status: item.users_owner_profiles_user_idTousers.status,
        }
      : null,
    reviewed_by: item.users_owner_profiles_approved_byTousers
      ? {
          id: item.users_owner_profiles_approved_byTousers.id,
          name: item.users_owner_profiles_approved_byTousers.name,
          email: item.users_owner_profiles_approved_byTousers.email,
        }
      : null,
  };
}

export function toAdminFieldResponse(item) {
  if (!item) return null;

  const primaryImage = Array.isArray(item.field_images)
    ? item.field_images[0] || null
    : null;

  return {
    id: item.id,
    owner_id: item.owner_id,
    field_name: item.field_name,
    sport_type: item.sport_type,
    description: item.description,
    address: item.address,
    latitude: item.latitude ? Number(item.latitude) : null,
    longitude: item.longitude ? Number(item.longitude) : null,
    base_price_per_hour: item.base_price_per_hour
      ? Number(item.base_price_per_hour)
      : 0,
    currency: item.currency,
    status: item.status,
    reject_reason: item.reject_reason ?? null,
    min_duration_minutes: item.min_duration_minutes,
    max_players: item.max_players,
    created_at: item.created_at,
    
    owner: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
        }
      : null,
    primary_image: primaryImage
      ? {
          id: primaryImage.id,
          url: primaryImage.url,
          is_primary: primaryImage.is_primary,
          order_no: primaryImage.order_no,
        }
      : null,
  };
}

export function toAdminBookingResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    field_id: item.field_id,
    user_id: item.user_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    status: item.status,
    total_price: item.total_price ? Number(item.total_price) : 0,
    notes: item.notes ?? null,
    checked_in_at: item.checked_in_at ?? null,
    checked_in_by: item.checked_in_by ?? null,
    checkin_method: item.checkin_method ?? null,
    created_at: item.created_at,
    updated_at: item.updated_at ?? null,
    user: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          email: item.users.email,
          phone: item.users.phone,
        }
      : null,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
          address: item.fields.address,
          sport_type: item.fields.sport_type,
          owner_id: item.fields.owner_id,
        }
      : null,
    payments: Array.isArray(item.payments)
      ? item.payments.map((payment) => ({
          id: payment.id,
          provider: payment.provider,
          amount: payment.amount ? Number(payment.amount) : 0,
          currency: payment.currency,
          status: payment.status,
          transaction_code: payment.transaction_code,
          paid_at: payment.paid_at ?? null,
          created_at: payment.created_at,
        }))
      : [],
    status_history: Array.isArray(item.booking_status_history)
      ? item.booking_status_history.map((history) => ({
          id: history.id,
          from_status: history.from_status,
          to_status: history.to_status,
          changed_at: history.changed_at,
          reason: history.reason ?? history.note ?? null,
        }))
      : [],
  };
}

export function toAdminDashboardSummaryResponse(data) {
  return {
    total_users: data.total_users,
    total_approved_owners: data.total_approved_owners,
    total_fields: data.total_fields,
    total_bookings: data.total_bookings,
    total_revenue: data.total_revenue,
  };
}