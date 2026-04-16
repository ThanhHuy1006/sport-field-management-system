import { NotFoundError } from "../../core/errors/index.js";
import { ownerSchedulesRepository } from "./owner.schedules.repository.js";
import {
  validateOwnerFieldIdParam,
  validateBlackoutDateIdParam,
  validateOperatingHoursPayload,
  validateCreateBlackoutPayload,
} from "./owner.schedules.validator.js";

export const ownerSchedulesService = {
  async getOperatingHours(ownerId, params) {
    const { fieldId } = validateOwnerFieldIdParam(params);

    const field = await ownerSchedulesRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return ownerSchedulesRepository.findOperatingHoursByFieldId(fieldId);
  },

  async replaceOperatingHours(ownerId, params, payload) {
    const { fieldId } = validateOwnerFieldIdParam(params);

    const field = await ownerSchedulesRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const valid = validateOperatingHoursPayload(payload);
    return ownerSchedulesRepository.replaceOperatingHours(fieldId, valid);
  },

  async getBlackoutDates(ownerId, params) {
    const { fieldId } = validateOwnerFieldIdParam(params);

    const field = await ownerSchedulesRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return ownerSchedulesRepository.findBlackoutDatesByFieldId(fieldId);
  },

  async createBlackoutDate(ownerId, params, payload) {
    const { fieldId } = validateOwnerFieldIdParam(params);

    const field = await ownerSchedulesRepository.findOwnerFieldById(ownerId, fieldId);
    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const valid = validateCreateBlackoutPayload(payload);
    return ownerSchedulesRepository.createBlackoutDate(fieldId, valid);
  },

  async deleteBlackoutDate(ownerId, params) {
    const { blackoutDateId } = validateBlackoutDateIdParam(params);

    const item = await ownerSchedulesRepository.findOwnerBlackoutDateById(
      ownerId,
      blackoutDateId
    );

    if (!item) {
      throw new NotFoundError("Không tìm thấy blackout date của owner");
    }

    return ownerSchedulesRepository.deleteBlackoutDate(blackoutDateId);
  },
};