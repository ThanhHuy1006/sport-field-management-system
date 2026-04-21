import {
  ConflictError,
  NotFoundError,
} from "../../core/errors/index.js";
import { ownerFieldsRepository } from "./owner.fields.repository.js";

export const ownerFieldsService = {
  async getOwnerFields(ownerId) {
    return ownerFieldsRepository.findOwnerFields(ownerId);
  },

  async getOwnerFieldDetail(ownerId, fieldId) {
    const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return field;
  },

  async createOwnerField(ownerId, payload) {
    return ownerFieldsRepository.createOwnerField(ownerId, payload);
  },

  async updateOwnerField(ownerId, fieldId, payload) {
    const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return ownerFieldsRepository.updateOwnerField(fieldId, payload);
  },

  async updateOwnerFieldStatus(ownerId, fieldId, payload) {
    const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    if (field.status === payload.status) {
      throw new ConflictError("Sân đã ở trạng thái này");
    }

    return ownerFieldsRepository.updateOwnerFieldStatus(fieldId, payload.status);
  },
};