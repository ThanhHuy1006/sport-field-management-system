import prisma from "../../config/prisma.js";

const ACTIVE_BOOKING_STATUSES = [
  "PENDING_CONFIRM",
  "APPROVED",
  "AWAITING_PAYMENT",
  "PAID",
  "COMPLETED",
  "CHECKED_IN",
];

export const schedulesRepository = {
  findFieldById(fieldId) {
    return prisma.fields.findUnique({
      where: { id: fieldId },
      select: {
        id: true,
        owner_id: true,
        status: true,
        min_duration_minutes: true,
      },
    });
  },

  findOperatingHoursByField(fieldId) {
    return prisma.operating_hours.findMany({
      where: { field_id: fieldId },
      orderBy: { day_of_week: "asc" },
    });
  },

  findOperatingHourByFieldAndDay(fieldId, dayOfWeek) {
    return prisma.operating_hours.findFirst({
      where: {
        field_id: fieldId,
        day_of_week: dayOfWeek,
      },
    });
  },

  createOperatingHour(fieldId, payload) {
    return prisma.operating_hours.create({
      data: {
        field_id: fieldId,
        day_of_week: payload.day_of_week,
        open_time: payload.open_time,
        close_time: payload.close_time,
      },
    });
  },

  updateOperatingHour(id, payload) {
    return prisma.operating_hours.update({
      where: { id },
      data: {
        open_time: payload.open_time,
        close_time: payload.close_time,
      },
    });
  },

  deleteOperatingHour(id) {
    return prisma.operating_hours.delete({
      where: { id },
    });
  },

  findBlackoutByFieldAndDate(fieldId, startOfDay, endOfDay) {
    return prisma.blackout_dates.findFirst({
      where: {
        field_id: fieldId,
        start_datetime: { lte: endOfDay },
        end_datetime: { gte: startOfDay },
      },
    });
  },

  createBlackoutDate(fieldId, payload) {
    return prisma.blackout_dates.create({
      data: {
        field_id: fieldId,
        start_datetime: new Date(`${payload.date}T00:00:00`),
        end_datetime: new Date(`${payload.date}T23:59:59`),
        reason: payload.reason,
      },
    });
  },

  findBlackoutDateById(id) {
    return prisma.blackout_dates.findUnique({
      where: { id },
    });
  },

  deleteBlackoutDate(id) {
    return prisma.blackout_dates.delete({
      where: { id },
    });
  },

  findBookingsByFieldAndDate(fieldId, startOfDay, endOfDay) {
    return prisma.bookings.findMany({
      where: {
        field_id: fieldId,
        start_datetime: { lt: endOfDay },
        end_datetime: { gt: startOfDay },
        status: {
          in: ACTIVE_BOOKING_STATUSES,
        },
      },
      orderBy: { start_datetime: "asc" },
      select: {
        id: true,
        start_datetime: true,
        end_datetime: true,
        status: true,
      },
    });
  },
};