import { fieldsRepository } from "./fields.repository.js";
import { validatePublicFieldQuery } from "./fields.validator.js";

export const fieldsService = {
  async getPublicFields(query) {
    const filters = validatePublicFieldQuery(query);

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
    const id = Number(fieldId);
    if (Number.isNaN(id)) {
      throw new Error("fieldId không hợp lệ");
    }

    const field = await fieldsRepository.findPublicFieldById(id);

    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    return field;
  },

  async getPublicFieldImages(fieldId) {
    const id = Number(fieldId);
    if (Number.isNaN(id)) {
      throw new Error("fieldId không hợp lệ");
    }

    const images = await fieldsRepository.findFieldImages(id);
    return images;
  },
};