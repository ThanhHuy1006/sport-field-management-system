import { fieldsRepository } from "./fields.repository.js";
import { NotFoundError } from "../../core/errors/index.js";

export const fieldsService = {
  async getPublicFields(query) {
    const filters = query;

    const { items, total } = await fieldsRepository.findPublicFields(filters);

    return {
      items,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  },

  async getPublicFieldDetail(fieldId) {
    const field = await fieldsRepository.findPublicFieldById(fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    return field;
  },

  async getPublicFieldImages(fieldId) {
    const field = await fieldsRepository.findPublicFieldById(fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    return field.field_images || [];
  },
};