import prisma from "../../config/prisma.js";

export const ownerBookingsRepository = {
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

      return tx.bookings.findUnique({
        where: { id: updated.id },
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

      return tx.bookings.findUnique({
        where: { id: updated.id },
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

      return tx.bookings.findUnique({
        where: { id: updated.id },
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

      return tx.bookings.findUnique({
        where: { id: updated.id },
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
    });
  },
};