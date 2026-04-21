import { ValidationError } from "../../core/errors/index.js";

export function validatePublicFieldQuery(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 10);

  if (Number.isNaN(page) || page < 1) {
    throw new ValidationError("page không hợp lệ");
  }

  if (Number.isNaN(limit) || limit < 1 || limit > 100) {
    throw new ValidationError("limit không hợp lệ");
  }

  const minPrice =
    query.minPrice !== undefined && query.minPrice !== ""
      ? Number(query.minPrice)
      : undefined;

  const maxPrice =
    query.maxPrice !== undefined && query.maxPrice !== ""
      ? Number(query.maxPrice)
      : undefined;

  if (minPrice !== undefined && Number.isNaN(minPrice)) {
    throw new ValidationError("minPrice không hợp lệ");
  }

  if (maxPrice !== undefined && Number.isNaN(maxPrice)) {
    throw new ValidationError("maxPrice không hợp lệ");
  }

  const sort = String(query.sort || "newest").trim();
  const allowedSort = ["newest", "price_asc", "price_desc", "name", "rating"];

  if (!allowedSort.includes(sort)) {
    throw new ValidationError("sort không hợp lệ");
  }

  return {
    page,
    limit,
    keyword: String(query.keyword ?? query.q ?? "").trim(),
    sport_type: String(query.sport_type ?? query.sport ?? "").trim(),
    district: String(query.district ?? "").trim(),
    sort,
    minPrice,
    maxPrice,
  };
}

export function validateFieldIdParams(params) {
  const fieldId = Number(params.fieldId);

  if (Number.isNaN(fieldId) || fieldId < 1) {
    throw new ValidationError("fieldId không hợp lệ");
  }

  return { fieldId };
}

export function validatePublicFieldReviewsQuery(query) {
  const page = Number(query.page || 1);
  const limit = Number(query.limit || 3);

  if (Number.isNaN(page) || page < 1) {
    throw new ValidationError("page không hợp lệ");
  }

  if (Number.isNaN(limit) || limit < 1 || limit > 50) {
    throw new ValidationError("limit không hợp lệ");
  }

  const rating =
    query.rating !== undefined && query.rating !== ""
      ? Number(query.rating)
      : undefined;

  if (
    rating !== undefined &&
    (Number.isNaN(rating) || rating < 1 || rating > 5)
  ) {
    throw new ValidationError("rating không hợp lệ");
  }

  const sort = String(query.sort || "newest").trim();
  const allowedSort = ["newest", "oldest", "rating_desc", "rating_asc"];

  if (!allowedSort.includes(sort)) {
    throw new ValidationError("sort không hợp lệ");
  }

  return {
    page,
    limit,
    rating,
    sort,
  };
}