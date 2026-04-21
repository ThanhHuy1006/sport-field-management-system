function getPrimaryImage(field) {
  return (
    field.field_images?.find((img) => img.is_primary) ||
    field.field_images?.[0] ||
    null
  );
}

function getRatingInfo(field) {
  const ratings = (field.reviews || [])
    .map((r) => Number(r.rating))
    .filter((x) => !Number.isNaN(x));

  const count = ratings.length;
  const avg =
    count > 0
      ? Number((ratings.reduce((sum, x) => sum + x, 0) / count).toFixed(1))
      : 0;

  return { avg, count };
}

function getOperatingTime(field) {
  const hours = field.operating_hours || [];

  const openTimes = hours
    .map((x) => x.open_time)
    .filter(Boolean)
    .sort();

  const closeTimes = hours
    .map((x) => x.close_time)
    .filter(Boolean)
    .sort();

  return {
    openTime: openTimes[0] ?? null,
    closeTime: closeTimes[closeTimes.length - 1] ?? null,
  };
}

export function toFieldListItem(field) {
  const primaryImage = getPrimaryImage(field);
  const { avg, count } = getRatingInfo(field);
  const { openTime, closeTime } = getOperatingTime(field);

  return {
    id: field.id,

    // shape FE-friendly
    name: field.field_name,
    type: field.sport_type,
    location: field.address,
    district: field.district,
    price: Number(field.base_price_per_hour ?? 0),
    image: primaryImage?.url ?? null,
    available: field.status === "active",
    rating: avg,
    reviews: count,
    openTime,
    closeTime,

    // shape cũ giữ tương thích
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
    primary_image: primaryImage,
  };
}

export function toFieldDetail(field) {
  const { avg, count } = getRatingInfo(field);
  const { openTime, closeTime } = getOperatingTime(field);

  return {
    id: field.id,
    field_name: field.field_name,
    sport_type: field.sport_type,
    description: field.description,
    address: field.address,
    district: field.district,
    ward: field.ward,
    province: field.province,
    latitude: field.latitude,
    longitude: field.longitude,
    base_price_per_hour: field.base_price_per_hour,
    currency: field.currency,
    status: field.status,
    min_duration_minutes: field.min_duration_minutes,
    max_players: field.max_players,
    created_at: field.created_at,
    updated_at: field.updated_at,
    rating: avg,
    reviews: count,
    openTime,
    closeTime,
    images: field.field_images || [],
    facilities:
      field.field_facilities?.map((item) => ({
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