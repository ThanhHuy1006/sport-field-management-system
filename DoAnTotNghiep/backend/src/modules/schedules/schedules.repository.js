import prisma from "../../config/prisma.js";

const ACTIVE_BOOKING_STATUSES = [
  "PENDING_CONFIRM",
  "APPROVED",
  "AWAITING_PAYMENT",
  "PAID",
  "COMPLETED",
  "CHECKED_IN",
];

function buildOperatingHourRows(fieldId, payload) {
  if (!payload || payload.is_closed) {
    return [];
  }

  const windows = Array.isArray(payload.windows)
    ? payload.windows
    : payload.open_time && payload.close_time
      ? [
          {
            start_time: payload.open_time,
            end_time: payload.close_time,
          },
        ]
      : [];

  return windows.map((window) => ({
    field_id: Number(fieldId),
    day_of_week: Number(payload.day_of_week),
    open_time: window.start_time,
    close_time: window.end_time,
    is_active: true,
  }));
}

export const schedulesRepository = {
  findFieldById(fieldId) {
    return prisma.fields.findUnique({
      where: { id: Number(fieldId) },
      select: {
        id: true,
        owner_id: true,
        status: true,
        min_duration_minutes: true,
        slot_step_minutes: true,
        advance_booking_days: true,
      },
    });
  },

  findOperatingHoursByField(fieldId) {
    return prisma.operating_hours.findMany({
      where: {
        field_id: Number(fieldId),
        is_active: true,
      },
      orderBy: [{ day_of_week: "asc" }, { open_time: "asc" }],
    });
  },

  findOperatingHoursByFieldAndDay(fieldId, dayOfWeek) {
    return prisma.operating_hours.findMany({
      where: {
        field_id: Number(fieldId),
        day_of_week: Number(dayOfWeek),
        is_active: true,
      },
      orderBy: { open_time: "asc" },
    });
  },

  /**
   * Giữ lại để tránh vỡ code cũ.
   * Nhưng logic mới nên dùng findOperatingHoursByFieldAndDay().
   */
  findOperatingHourByFieldAndDay(fieldId, dayOfWeek) {
    return prisma.operating_hours.findFirst({
      where: {
        field_id: Number(fieldId),
        day_of_week: Number(dayOfWeek),
        is_active: true,
      },
      orderBy: { open_time: "asc" },
    });
  },

  /**
   * Dùng cho API owner cập nhật giờ hoạt động của 1 ngày.
   * Xóa toàn bộ ca cũ của ngày đó rồi insert lại windows[] mới.
   */
  replaceOperatingHoursByDay(fieldId, payload) {
    return prisma.$transaction(async (tx) => {
      const numericFieldId = Number(fieldId);
      const dayOfWeek = Number(payload.day_of_week);

      await tx.operating_hours.deleteMany({
        where: {
          field_id: numericFieldId,
          day_of_week: dayOfWeek,
        },
      });

      const rows = buildOperatingHourRows(numericFieldId, payload);

      if (rows.length > 0) {
        await tx.operating_hours.createMany({
          data: rows,
        });
      }

      return tx.operating_hours.findMany({
        where: {
          field_id: numericFieldId,
          day_of_week: dayOfWeek,
          is_active: true,
        },
        orderBy: { open_time: "asc" },
      });
    });
  },

  createOperatingHour(fieldId, payload) {
    return prisma.operating_hours.create({
      data: {
        field_id: Number(fieldId),
        day_of_week: Number(payload.day_of_week),
        open_time: payload.open_time,
        close_time: payload.close_time,
        is_active: true,
      },
    });
  },

  updateOperatingHour(id, payload) {
    return prisma.operating_hours.update({
      where: { id: Number(id) },
      data: {
        open_time: payload.open_time,
        close_time: payload.close_time,
        is_active: payload.is_active ?? true,
      },
    });
  },

  deleteOperatingHour(id) {
    return prisma.operating_hours.delete({
      where: { id: Number(id) },
    });
  },

  findBlackoutByFieldAndDate(fieldId, startOfDay, endOfDay) {
    return prisma.blackout_dates.findFirst({
      where: {
        field_id: Number(fieldId),
        start_datetime: { lte: endOfDay },
        end_datetime: { gte: startOfDay },
      },
    });
  },

  createBlackoutDate(fieldId, payload) {
    return prisma.blackout_dates.create({
      data: {
        field_id: Number(fieldId),
        start_datetime: new Date(`${payload.date}T00:00:00`),
        end_datetime: new Date(`${payload.date}T23:59:59`),
        reason: payload.reason,
      },
    });
  },

  findBlackoutDateById(id) {
    return prisma.blackout_dates.findUnique({
      where: { id: Number(id) },
    });
  },

  deleteBlackoutDate(id) {
    return prisma.blackout_dates.delete({
      where: { id: Number(id) },
    });
  },

  findBookingsByFieldAndDate(fieldId, startOfDay, endOfDay) {
    return prisma.bookings.findMany({
      where: {
        field_id: Number(fieldId),
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