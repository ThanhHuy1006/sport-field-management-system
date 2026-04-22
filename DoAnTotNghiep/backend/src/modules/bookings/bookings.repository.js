import prisma from "../../config/prisma.js";
import { ConflictError } from "../../core/errors/index.js";

const ACTIVE_BOOKING_STATUSES = [
  "PENDING_CONFIRM",
  "APPROVED",
  "AWAITING_PAYMENT",
  "PAID",
  "CHECKED_IN",
];

const memberFieldSelect = {
  id: true,
  field_name: true,
  address: true,
  sport_type: true,
  base_price_per_hour: true,
  currency: true,
  owner_id: true,
};

const ownerFieldSelect = {
  id: true,
  field_name: true,
  address: true,
  sport_type: true,
  owner_id: true,
};

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
};

function buildListWhere(baseWhere, status) {
  return {
    ...baseWhere,
    ...(status ? { status } : {}),
  };
}

function memberBookingDetailInclude() {
  return {
    fields: {
      select: memberFieldSelect,
    },
    booking_status_history: {
      orderBy: { changed_at: "desc" },
    },
  };
}

function ownerBookingDetailInclude() {
  return {
    fields: {
      select: ownerFieldSelect,
    },
    users: {
      select: userSelect,
    },
    booking_status_history: {
      orderBy: { changed_at: "desc" },
    },
  };
}

async function hydrateMemberBooking(tx, bookingId) {
  return tx.bookings.findUnique({
    where: { id: bookingId },
    include: memberBookingDetailInclude(),
  });
}

async function hydrateOwnerBooking(tx, bookingId) {
  return tx.bookings.findUnique({
    where: { id: bookingId },
    include: ownerBookingDetailInclude(),
  });
}

async function findConflictingBookingsTx(tx, fieldId, start, end) {
  return tx.bookings.findMany({
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
}

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

  findBlackoutsByFieldAndDate(fieldId, dayStart, dayEnd) {
    return prisma.blackout_dates.findMany({
      where: {
        field_id: fieldId,
        start_datetime: { lt: dayEnd },
        end_datetime: { gt: dayStart },
      },
      orderBy: { start_datetime: "asc" },
      select: {
        id: true,
        start_datetime: true,
        end_datetime: true,
        reason: true,
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

  findBookingsByFieldAndDate(fieldId, dayStart, dayEnd) {
    return prisma.bookings.findMany({
      where: {
        field_id: fieldId,
        start_datetime: { lt: dayEnd },
        end_datetime: { gt: dayStart },
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
      const conflicts = await findConflictingBookingsTx(
        tx,
        data.field_id,
        data.start_datetime,
        data.end_datetime,
      );

      if (conflicts.length > 0) {
        throw new ConflictError("Khung giờ đã được đặt");
      }

      // const booking = await tx.bookings.create({
      //   data: {
      //     field_id: data.field_id,
      //     user_id: data.user_id,
      //     start_datetime: data.start_datetime,
      //     end_datetime: data.end_datetime,
      //     notes: data.notes,
      //     total_price: data.total_price,
      //     status: data.status,
      //   },
      // });
      const booking = await tx.bookings.create({
        data: {
          field_id: data.field_id,
          user_id: data.user_id,
          start_datetime: data.start_datetime,
          end_datetime: data.end_datetime,
          notes: data.notes,
          contact_name: data.contact_name ?? null,
          contact_email: data.contact_email ?? null,
          contact_phone: data.contact_phone ?? null,
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

      return hydrateMemberBooking(tx, booking.id);
    });
  },

  findMyBookings(userId, filters) {
    const where = buildListWhere({ user_id: userId }, filters.status);

    return Promise.all([
      prisma.bookings.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          fields: {
            select: memberFieldSelect,
          },
        },
      }),
      prisma.bookings.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  },

  findMyBookingById(userId, bookingId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
      },
      include: memberBookingDetailInclude(),
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

      await tx.bookings.update({
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

      return hydrateMemberBooking(tx, bookingId);
    });
  },

  findOwnerBookings(ownerId, filters) {
    const where = buildListWhere(
      {
        fields: {
          owner_id: ownerId,
        },
      },
      filters.status,
    );

    return Promise.all([
      prisma.bookings.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: {
          fields: {
            select: ownerFieldSelect,
          },
          users: {
            select: userSelect,
          },
        },
      }),
      prisma.bookings.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  },

  findOwnerBookingById(ownerId, bookingId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        fields: {
          owner_id: ownerId,
        },
      },
      include: ownerBookingDetailInclude(),
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

      await tx.bookings.update({
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

      return hydrateOwnerBooking(tx, bookingId);
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

      await tx.bookings.update({
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

      return hydrateOwnerBooking(tx, bookingId);
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

      await tx.bookings.update({
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

      return hydrateOwnerBooking(tx, bookingId);
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

      await tx.bookings.update({
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

      return hydrateOwnerBooking(tx, bookingId);
    });
  },
};
