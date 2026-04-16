export function toOwnerFieldResponse(item) {
  if (!item) return null;

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
    min_duration_minutes: item.min_duration_minutes,
    max_players: item.max_players,
    created_at: item.created_at,
    images: (item.field_images || []).map((img) => ({
      id: img.id,
      url: img.url,
      is_primary: img.is_primary,
      order_no: img.order_no,
    })),
  };
}