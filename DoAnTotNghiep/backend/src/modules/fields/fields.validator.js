export function validatePublicFieldQuery(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);

  if (Number.isNaN(page) || page < 1) {
    throw new Error("page không hợp lệ");
  }

  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    throw new Error("limit không hợp lệ");
  }

  return {
    page,
    limit,
    keyword: query.keyword ? String(query.keyword).trim() : "",
    sport_type: query.sport_type ? String(query.sport_type).trim() : "",
    minPrice: query.minPrice ? Number(query.minPrice) : undefined,
    maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
  };
}