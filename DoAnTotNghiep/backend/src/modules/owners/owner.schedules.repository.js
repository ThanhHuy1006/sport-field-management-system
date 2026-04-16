import prisma from "../../config/prisma.js";

export const ownerSchedulesRepository = {
  findOwnerFieldById(ownerId, fieldId) {
    return prisma.fields.findFirst({
      where: {
        id: fieldId,
        owner_id: ownerId,
      },
      select: {
        id: true,
        owner_id: true,
        field_name: true,
        status: true,
      },
    });
  },

  findOperatingHoursByFieldId(fieldId) {
    return prisma.operating_hours.findMany({
      where: { field_id: fieldId },
      orderBy: { day_of_week: "asc" },
    });
  },

  replaceOperatingHours(fieldId, items) {
    return prisma.$transaction(async (tx) => {
      await tx.operating_hours.deleteMany({
        where: { field_id: fieldId },
      });

      if (items.length > 0) {
        await tx.operating_hours.createMany({
          data: items.map((item) => ({
            field_id: fieldId,
            day_of_week: item.day_of_week,
            open_time: item.open_time,
            close_time: item.close_time,
            is_closed: item.is_closed,
          })),
        });
      }

      return tx.operating_hours.findMany({
        where: { field_id: fieldId },
        orderBy: { day_of_week: "asc" },
      });
    });
  },

  findBlackoutDatesByFieldId(fieldId) {
    return prisma.blackout_dates.findMany({
      where: { field_id: fieldId },
      orderBy: { start_datetime: "asc" },
    });
  },

  createBlackoutDate(fieldId, data) {
    return prisma.blackout_dates.create({
      data: {
        field_id: fieldId,
        ...data,
      },
    });
  },

  findOwnerBlackoutDateById(ownerId, blackoutDateId) {
    return prisma.blackout_dates.findFirst({
      where: {
        id: blackoutDateId,
        fields: {
          owner_id: ownerId,
        },
      },
      select: {
        id: true,
        field_id: true,
        start_datetime: true,
        end_datetime: true,
        reason: true,
      },
    });
  },

  deleteBlackoutDate(blackoutDateId) {
    return prisma.blackout_dates.delete({
      where: { id: blackoutDateId },
    });
  },
};