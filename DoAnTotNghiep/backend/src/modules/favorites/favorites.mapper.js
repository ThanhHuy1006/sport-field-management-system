function toNumber(value, fallback = 0) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const num = Number(value);

  return Number.isFinite(num) ? num : fallback;
}

function getPrimaryImage(field) {
  return field?.field_images?.[0]?.url ?? null;
}

function calculateRating(field) {
  const reviews = field?.reviews ?? [];

  if (reviews.length === 0) {
    return 0;
  }

  const total = reviews.reduce((sum, review) => {
    return sum + toNumber(review.rating, 0);
  }, 0);

  return Number((total / reviews.length).toFixed(1));
}

export function toFavoriteFieldItem(item) {
  const field = item.fields;

  if (!field) {
    return null;
  }

  return {
    id: field.id,
    field_id: field.id,
    field_name: field.field_name,
    address: field.address,
    district: field.district ?? null,
    ward: field.ward ?? null,
    province: field.province ?? null,
    sport_type: field.sport_type,
    base_price_per_hour: field.base_price_per_hour,
    currency: field.currency ?? "VND",
    status: field.status,
    image_url: getPrimaryImage(field),
    rating: calculateRating(field),
    review_count: field._count?.reviews ?? 0,
    favorited_at: item.created_at ?? null,
  };
}
