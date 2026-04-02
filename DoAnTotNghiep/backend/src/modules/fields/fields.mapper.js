export function toFieldListItem(field) {
  return {
    id: field.id,
    field_name: field.field_name,
    sport_type: field.sport_type,
    description: field.description,
    address: field.address,
    latitude: field.latitude,
    longitude: field.longitude,
    base_price_per_hour: field.base_price_per_hour,
    currency: field.currency,
    status: field.status,
    min_duration_minutes: field.min_duration_minutes,
    max_players: field.max_players,
    created_at: field.created_at,
    updated_at: field.updated_at,
    primary_image:
      field.field_images?.find((img) => img.is_primary) ||
      field.field_images?.[0] ||
      null,
  };
}

export function toFieldDetail(field) {
  return {
    id: field.id,
    field_name: field.field_name,
    sport_type: field.sport_type,
    description: field.description,
    address: field.address,
    latitude: field.latitude,
    longitude: field.longitude,
    base_price_per_hour: field.base_price_per_hour,
    currency: field.currency,
    status: field.status,
    min_duration_minutes: field.min_duration_minutes,
    max_players: field.max_players,
    created_at: field.created_at,
    updated_at: field.updated_at,
    images: field.field_images || [],
    facilities: field.field_facilities?.map((item) => ({
      id: item.facilities.id,
      name: item.facilities.name,
      icon: item.facilities.icon,
      note: item.note,
    })) || [],
  };
}

export function toFieldImageList(images) {
  return images.map((img) => ({
    id: img.id,
    url: img.url,
    is_primary: img.is_primary,
    order_no: img.order_no,
  }));
}