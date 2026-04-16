import prisma from "../../config/prisma.js";

export const ownerBookingsRepository = {
  findOwnerBookings(ownerId, filters = {}) {
    const where = {
      fields: {
        owner_id: ownerId,
      },
    };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.field_id) {
      where.field_id = filters.field_id;
    }

    if (filters.date_from || filters.date_to) {
      where.start_datetime = {};
      if (filters.date_from) where.start_datetime.gte = filters.date_from;
      if (filters.date_to) where.start_datetime.lte = filters.date_to;
    }

    return prisma.bookings.findMany({
      where,
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
            address: true,
            sport_type: true,
            owner_id: true,
          },
        },
        payments: {
          select: {
            id: true,
            provider: true,
            amount: true,
            status: true,
            paid_at: true,
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
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
            address: true,
            sport_type: true,
            owner_id: true,
          },
        },
        payments: true,
        booking_status_history: {
          orderBy: { changed_at: "desc" },
        },
      },
    });
  },

  findMemberBookingById(userId, bookingId) {
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
            owner_id: true,
          },
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
          note: "Approved by owner",
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
          note,
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
          note,
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
          note,
        },
      });

      return updated;
    });
  },
};