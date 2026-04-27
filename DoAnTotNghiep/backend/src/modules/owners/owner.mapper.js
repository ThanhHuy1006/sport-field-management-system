export function toOwnerRegistrationResponse(item) {
  if (!item) return null;

  return {
    user_id: item.user_id,
    business_name: item.business_name,
    tax_code: item.tax_code,
    address: item.address,
    license_url: item.license_url,
    id_front_url: item.id_front_url,
    id_back_url: item.id_back_url,
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
          avatar_url: item.users_owner_profiles_user_idTousers.avatar_url,
          role: item.users_owner_profiles_user_idTousers.role,
          status: item.users_owner_profiles_user_idTousers.status,
        }
      : null,
  };
}

export function toOwnerProfileResponse({ user, ownerProfile }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    avatar_url: user.avatar_url,
    role: user.role,
    status: user.status,
    owner_profile: ownerProfile
      ? {
          user_id: ownerProfile.user_id,
          business_name: ownerProfile.business_name,
          tax_code: ownerProfile.tax_code,
          address: ownerProfile.address,
          license_url: ownerProfile.license_url,
          id_front_url: ownerProfile.id_front_url,
          id_back_url: ownerProfile.id_back_url,
          status: ownerProfile.status,
          approved_by: ownerProfile.approved_by,
          approved_at: ownerProfile.approved_at,
          reject_reason: ownerProfile.reject_reason,
          created_at: ownerProfile.created_at,
        }
      : null,
  };
}

export function toOwnerDashboardSummary(data) {
  return {
    total_fields: data.total_fields,
    pending_bookings: data.pending_bookings,
    total_bookings_this_month: data.total_bookings_this_month,
    total_revenue_this_month: data.total_revenue_this_month,
  };
}