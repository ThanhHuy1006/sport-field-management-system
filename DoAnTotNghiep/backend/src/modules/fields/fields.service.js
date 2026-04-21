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

  async getPublicFieldOwnerInfo(fieldId) {
    const ownerInfo = await fieldsRepository.findPublicFieldOwnerInfo(fieldId);

    if (!ownerInfo) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    return ownerInfo;
  },

  async getPublicFieldReviews(fieldId, query) {
    const field = await fieldsRepository.findPublicFieldById(fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    const { items, total, summary } =
      await fieldsRepository.findPublicFieldReviews(fieldId, query);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
      summary,
    };
  },
};