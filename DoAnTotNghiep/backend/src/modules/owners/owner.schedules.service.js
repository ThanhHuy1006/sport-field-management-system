import {
  ConflictError,
  NotFoundError,
} from "../../core/errors/index.js";
import { ownerSchedulesRepository } from "./owner.schedules.repository.js";

function startOfDay(dateStr) {
  return new Date(`${dateStr}T00:00:00`);
}

function endOfDay(dateStr) {
  return new Date(`${dateStr}T23:59:59`);
}

async function ensureOwnerField(ownerId, fieldId) {
  const field = await ownerSchedulesRepository.findOwnerFieldById(ownerId, fieldId);

  if (!field) {
    throw new NotFoundError("Không tìm thấy sân của owner");
  }

  return field;
}

export const ownerSchedulesService = {
  async getOwnerOperatingHours(ownerId, fieldId) {
    await ensureOwnerField(ownerId, fieldId);

    const existing = await ownerSchedulesRepository.findOperatingHoursByField(fieldId);
    const byDay = new Map(existing.map((item) => [item.day_of_week, item]));

    return Array.from({ length: 7 }, (_, day) => {
      const item = byDay.get(day);

      if (item) {
        return {
          ...item,
          is_closed: false,
        };
      }

      return {
        id: null,
        field_id: fieldId,
        day_of_week: day,
        open_time: null,
        close_time: null,
        is_closed: true,
      };
    });
  },

  async upsertOwnerOperatingHours(ownerId, fieldId, payload) {
    await ensureOwnerField(ownerId, fieldId);

    const existed = await ownerSchedulesRepository.findOperatingHourByFieldAndDay(
      fieldId,
      payload.day_of_week
    );

    if (payload.is_closed) {
      if (existed) {
        await ownerSchedulesRepository.deleteOperatingHour(existed.id);
      }

      return {
        id: existed?.id ?? null,
        field_id: fieldId,
        day_of_week: payload.day_of_week,
        open_time: null,
        close_time: null,
        is_closed: true,
      };
    }

    const item = existed
      ? await ownerSchedulesRepository.updateOperatingHour(existed.id, payload)
      : await ownerSchedulesRepository.createOperatingHour(fieldId, payload);

    return {
      ...item,
      is_closed: false,
    };
  },

  async createBlackoutDate(ownerId, fieldId, payload) {
    await ensureOwnerField(ownerId, fieldId);

    const existed = await ownerSchedulesRepository.findBlackoutByFieldAndDate(
      fieldId,
      startOfDay(payload.date),
      endOfDay(payload.date)
    );

    if (existed) {
      throw new ConflictError("Ngày này đã bị khóa trước đó");
    }

    return ownerSchedulesRepository.createBlackoutDate(fieldId, payload);
  },

  async deleteBlackoutDate(ownerId, blackoutDateId) {
    const blackoutDate = await ownerSchedulesRepository.findBlackoutDateById(
      blackoutDateId
    );

    if (!blackoutDate) {
      throw new NotFoundError("Không tìm thấy ngày khóa");
    }

    await ensureOwnerField(ownerId, blackoutDate.field_id);

    return ownerSchedulesRepository.deleteBlackoutDate(blackoutDateId);
  },
};