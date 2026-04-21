import prisma from "../../config/prisma.js";

const ACTIVE_BOOKING_STATUSES = [
  "PENDING_CONFIRM",
  "APPROVED",
  "AWAITING_PAYMENT",
  "PAID",
  "CHECKED_IN",
  "COMPLETED",
];

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

  findOperatingHourByFieldAndDay(fieldId, dayOfWeek) {
    return prisma.operating_hours.findFirst({
      where: {
        field_id: fieldId,
        day_of_week: dayOfWeek,
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

      return tx.bookings.findUnique({
        where: { id: booking.id },
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
            owner_id: true,
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

  findOwnerBookings(ownerId) {
    return prisma.bookings.findMany({
      where: {
        fields: {
          owner_id: ownerId,
        },
      },
      orderBy: { created_at: "desc" },
      include: {
        fields: {
          select: {
            id: true,
            field_name: true,
            address: true,
            sport_type: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });
  },

  findOwnerBookingById(ownerId, bookingId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        fields: {
          owner_id: ownerId,
        },
      },
      include: {
        fields: {
          select: {
            id: true,
            field_name: true,
            address: true,
            sport_type: true,
            owner_id: true,
          },
        },
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        booking_status_history: {
          orderBy: { changed_at: "desc" },
        },
      },
    });
  },

  approveOwnerBooking(ownerId, bookingId) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findFirst({
        where: {
          id: bookingId,
          fields: {
            owner_id: ownerId,
          },
        },
      });

      if (!booking) return null;

      const updated = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: "APPROVED",
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: "APPROVED",
          reason: "Approved by owner",
        },
      });

      return updated;
    });
  },

  rejectOwnerBooking(ownerId, bookingId, note) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findFirst({
        where: {
          id: bookingId,
          fields: {
            owner_id: ownerId,
          },
        },
      });

      if (!booking) return null;

      const updated = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: "REJECTED",
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: "REJECTED",
          reason: note || "Rejected by owner",
        },
      });

      return updated;
    });
  },

  markOwnerBookingCheckedIn(ownerId, bookingId, method, note) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findFirst({
        where: {
          id: bookingId,
          fields: {
            owner_id: ownerId,
          },
        },
      });

      if (!booking) return null;

      const updated = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: "CHECKED_IN",
          checked_in_at: new Date(),
          checked_in_by: ownerId,
          checkin_method: method,
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: "CHECKED_IN",
          reason: note,
        },
      });

      return updated;
    });
  },

  completeOwnerBooking(ownerId, bookingId, note) {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findFirst({
        where: {
          id: bookingId,
          fields: {
            owner_id: ownerId,
          },
        },
      });

      if (!booking) return null;

      const updated = await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: "COMPLETED",
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: "COMPLETED",
          reason: note,
        },
      });

      return updated;
    });
  },
};