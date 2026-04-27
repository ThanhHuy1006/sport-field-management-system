export function toOwnerFieldResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    owner_id: item.owner_id,
    field_name: item.field_name,
    sport_type: item.sport_type,
    description: item.description,

    address: item.address,
    address_line: item.address_line,
    ward: item.ward,
    district: item.district,
    province: item.province,

    latitude: item.latitude ? Number(item.latitude) : null,
    longitude: item.longitude ? Number(item.longitude) : null,
    base_price_per_hour: item.base_price_per_hour
      ? Number(item.base_price_per_hour)
      : 0,
    currency: item.currency,
    status: item.status,
    approval_mode: item.approval_mode,
    min_duration_minutes: item.min_duration_minutes,
    max_players: item.max_players,
    created_at: item.created_at,
    updated_at: item.updated_at,

    pricing_rules: (item.field_pricing_rules || []).map((rule) => ({
      id: rule.id,
      day_type: rule.day_type,
      start_time: rule.start_time,
      end_time: rule.end_time,
      price: rule.price ? Number(rule.price) : 0,
      currency: rule.currency,
      priority: rule.priority,
      active: rule.active,
    })),

    operating_hours: (item.operating_hours || []).map((hour) => ({
      id: hour.id,
      day_of_week: hour.day_of_week,
      open_time: hour.open_time,
      close_time: hour.close_time,
    })),

    amenities: (item.field_facilities || []).map((item) => ({
      id: item.facility_id,
      name: item.facilities?.name ?? null,
      icon: item.facilities?.icon ?? null,
      note: item.note ?? null,
    })),

    images: (item.field_images || []).map((img) => ({
      id: img.id,
      url: img.url,
      is_primary: img.is_primary,
      order_no: img.order_no,
    })),
  };
}