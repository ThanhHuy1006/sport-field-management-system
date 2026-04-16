import {
  ConflictError,
  NotFoundError,
} from "../../core/errors/index.js";
import { ownerFieldsRepository } from "./owner.fields.repository.js";
import {
  validateFieldIdParam,
  validateCreateOwnerFieldPayload,
  validateUpdateOwnerFieldPayload,
  validateOwnerFieldStatusPayload,
} from "./owner.fields.validator.js";

export const ownerFieldsService = {
  async getOwnerFields(ownerId) {
    return ownerFieldsRepository.findOwnerFields(ownerId);
  },

  async getOwnerFieldDetail(ownerId, params) {
    const { fieldId } = validateFieldIdParam(params);

    const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return field;
  },

  async createOwnerField(ownerId, payload) {
    const valid = validateCreateOwnerFieldPayload(payload);
    return ownerFieldsRepository.createOwnerField(ownerId, valid);
  },

  async updateOwnerField(ownerId, params, payload) {
    const { fieldId } = validateFieldIdParam(params);

    const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const valid = validateUpdateOwnerFieldPayload(payload);
    return ownerFieldsRepository.updateOwnerField(fieldId, valid);
  },

  async updateOwnerFieldStatus(ownerId, params, payload) {
    const { fieldId } = validateFieldIdParam(params);

    const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const valid = validateOwnerFieldStatusPayload(payload);

    if (field.status === valid.status) {
      throw new ConflictError("Sân đã ở trạng thái này");
    }

    return ownerFieldsRepository.updateOwnerFieldStatus(fieldId, valid.status);
  },
};