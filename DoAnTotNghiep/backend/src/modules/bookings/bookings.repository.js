import prisma from "../../config/prisma.js";

export const bookingsRepository = {
  findFieldById(fieldId) {
    return prisma.fields.findUnique({
      where: { id: fieldId },
      select: {
        id: true,
        owner_id: true,
        field_name: true,
        address: true,
        sport_type: true,
        base_price_per_hour: true,
        currency: true,
        min_duration_minutes: true,
        status: true,
      },
    });
  },

  findBlackoutByFieldAndRange(fieldId, start, end) {
    return prisma.blackout_dates.findFirst({
      where: {
        field_id: fieldId,
        start_datetime: { lt: end },
        end_datetime: { gt: start },
      },
    });
  },

  findConflictingBookings(fieldId, start, end) {
    return prisma.bookings.findMany({
      where: {
        field_id: fieldId,
        start_datetime: { lt: end },
        end_datetime: { gt: start },
        status: {
          in: ["PENDING_CONFIRM", "APPROVED", "AWAITING_PAYMENT", "PAID", "COMPLETED"],
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

  createBookingWithHistory(data) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.create({
        data: {
          field_id: data.field_id,
          user_id: data.user_id,
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          notes: data.notes,
          total_price: data.total_price,
          status: data.status,
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: booking.id,
          from_status: null,
          to_status: data.status,
          reason: "Booking created",
        },
      });

      return booking;
    });
  },

  findMyBookings(userId) {
    return prisma.bookings.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      include: {
        fields: {
          select: {
            id: true,
            field_name: true,
            address: true,
            sport_type: true,
            base_price_per_hour: true,
            currency: true,
          },
        },
      },
    });
  },

  findMyBookingById(userId, bookingId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
      },
      include: {
        fields: {
          select: {
            id: true,
            field_name: true,
            address: true,
            sport_type: true,
            base_price_per_hour: true,
            currency: true,
          },
        },
        booking_status_history: {
          orderBy: { changed_at: "desc" },
        },
      },
    });
  },

  cancelMyBooking(userId, bookingId) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findFirst({
        where: {
          id: bookingId,
          user_id: userId,
        },
      });

      if (!booking) return null;

      const updated = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: "CANCELLED",
          reason: "Cancelled by member",
        },
      });

      return updated;
    });
  },
};