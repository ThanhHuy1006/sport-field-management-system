import { ValidationError } from "../../core/errors/index.js";

function parsePositiveInt(value, fieldName) {
  const num = Number(value);

  if (Number.isNaN(num) || num < 1 || !Number.isInteger(num)) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return num;
}

export function validateFavoriteFieldIdParams(params) {
  const fieldId = parsePositiveInt(params.fieldId, "fieldId");

  return { fieldId };
}

export function validateFavoriteListQuery(query) {
  const page = query.page ? parsePositiveInt(query.page, "page") : 1;
  const limit = query.limit ? parsePositiveInt(query.limit, "limit") : 20;

  if (limit > 100) {
    throw new ValidationError("limit không được vượt quá 100");
  }

  return {
    page,
    limit,
  };
}
