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
  field_images: {
    orderBy: [{ is_primary: "desc" }, { order_no: "asc" }, { id: "asc" }],
    take: 1,
    select: {
      id: true,
      url: true,
      is_primary: true,
      order_no: true,
    },
  },
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
    voucher: {
      select: {
        id: true,
        code: true,
        type: true,
        discount_value: true,
        max_discount_amount: true,
      },
    },
    reviews: {
      where: {
        visible: true,
      },
      select: {
        id: true,
        rating: true,
        comment: true,
        created_at: true,
      },
      take: 1,
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
    voucher: {
      select: {
        id: true,
        code: true,
        type: true,
        discount_value: true,
        max_discount_amount: true,
      },
    },
    booking_status_history: {
      orderBy: { changed_at: "desc" },
    },
  };
}

function rescheduleRequestInclude() {
  return {
    bookings: {
      include: {
        fields: {
          select: ownerFieldSelect,
        },
        users: {
          select: userSelect,
        },
      },
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
        approval_mode: true,
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

  findConflictingBookingsExceptSelf(fieldId, start, end, bookingId) {
    return prisma.bookings.findMany({
      where: {
        id: {
          not: bookingId,
        },
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
          approval_mode_snapshot: data.approval_mode_snapshot ?? "MANUAL",

          requested_payment_method: data.requested_payment_method ?? "ONSITE",
          payment_expires_at: data.payment_expires_at ?? null,

          original_price: data.original_price ?? data.total_price,
          discount_amount: data.discount_amount ?? 0,
          total_price: data.total_price,
          voucher_id: data.voucher_id ?? null,

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
          voucher: {
            select: {
              id: true,
              code: true,
              type: true,
              discount_value: true,
              max_discount_amount: true,
            },
          },
          reviews: {
            where: {
              visible: true,
            },
            select: {
              id: true,
              rating: true,
              comment: true,
              created_at: true,
            },
            take: 1,
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
          voucher: {
            select: {
              id: true,
              code: true,
              type: true,
              discount_value: true,
              max_discount_amount: true,
            },
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

  approveOwnerBooking(ownerId, bookingId, nextStatus = "APPROVED") {
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
          status: nextStatus,
          payment_expires_at:
            nextStatus === "AWAITING_PAYMENT"
              ? new Date(Date.now() + 30 * 60 * 1000)
              : null,
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: nextStatus,
          reason:
            nextStatus === "AWAITING_PAYMENT"
              ? "Approved by owner, awaiting payment"
              : "Approved by owner",
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
          reason: note || "Checked in by owner",
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

  expireAwaitingPaymentBooking(bookingId, reason = "Payment expired") {
    return prisma.$transaction(async (tx) => {
      const booking = await tx.bookings.findUnique({
        where: { id: bookingId },
      });

      if (!booking) return null;

      if (booking.status !== "AWAITING_PAYMENT") {
        return booking;
      }

      await tx.bookings.update({
        where: { id: bookingId },
        data: {
          status: "PAYMENT_EXPIRED",
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: bookingId,
          from_status: booking.status,
          to_status: "PAYMENT_EXPIRED",
          reason,
        },
      });

      return hydrateMemberBooking(tx, bookingId);
    });
  },

  findPendingRescheduleRequestByBookingId(bookingId) {
    return prisma.booking_reschedule_requests.findFirst({
      where: {
        booking_id: bookingId,
        status: "PENDING",
      },
    });
  },

  createRescheduleRequest(data) {
    return prisma.booking_reschedule_requests.create({
      data: {
        booking_id: data.booking_id,
        requested_by: data.requested_by,
        old_start_datetime: data.old_start_datetime,
        old_end_datetime: data.old_end_datetime,
        new_start_datetime: data.new_start_datetime,
        new_end_datetime: data.new_end_datetime,
        status: "PENDING",
        reason: data.reason ?? null,
      },
      include: rescheduleRequestInclude(),
    });
  },

  autoApproveRescheduleRequest(data) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.booking_reschedule_requests.create({
        data: {
          booking_id: data.booking_id,
          requested_by: data.requested_by,
          old_start_datetime: data.old_start_datetime,
          old_end_datetime: data.old_end_datetime,
          new_start_datetime: data.new_start_datetime,
          new_end_datetime: data.new_end_datetime,
          status: "APPROVED",
          reason: data.reason ?? null,
          decided_by: null,
          decided_at: new Date(),
        },
      });

      await tx.bookings.update({
        where: {
          id: data.booking_id,
        },
        data: {
          start_datetime: data.new_start_datetime,
          end_datetime: data.new_end_datetime,
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: data.booking_id,
          from_status: data.booking_status,
          to_status: data.booking_status,
          reason: "Booking rescheduled automatically",
        },
      });

      return tx.booking_reschedule_requests.findUnique({
        where: {
          id: request.id,
        },
        include: rescheduleRequestInclude(),
      });
    });
  },

  findOwnerRescheduleRequests(ownerId, filters = {}) {
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);

    const where = {
      bookings: {
        fields: {
          owner_id: ownerId,
        },
      },
      ...(filters.status ? { status: filters.status } : {}),
    };

    return Promise.all([
      prisma.booking_reschedule_requests.findMany({
        where,
        orderBy: { created_at: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: rescheduleRequestInclude(),
      }),
      prisma.booking_reschedule_requests.count({ where }),
    ]).then(([items, total]) => ({
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }));
  },

  findOwnerRescheduleRequestById(ownerId, requestId) {
    return prisma.booking_reschedule_requests.findFirst({
      where: {
        id: requestId,
        bookings: {
          fields: {
            owner_id: ownerId,
          },
        },
      },
      include: rescheduleRequestInclude(),
    });
  },

  approveRescheduleRequest(ownerId, requestId) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.booking_reschedule_requests.findFirst({
        where: {
          id: requestId,
          status: "PENDING",
          bookings: {
            fields: {
              owner_id: ownerId,
            },
          },
        },
        include: {
          bookings: true,
        },
      });

      if (!request) return null;

      await tx.bookings.update({
        where: {
          id: request.booking_id,
        },
        data: {
          start_datetime: request.new_start_datetime,
          end_datetime: request.new_end_datetime,
        },
      });

      await tx.booking_reschedule_requests.update({
        where: {
          id: requestId,
        },
        data: {
          status: "APPROVED",
          decided_by: ownerId,
          decided_at: new Date(),
        },
      });

      await tx.booking_status_history.create({
        data: {
          booking_id: request.booking_id,
          from_status: request.bookings.status,
          to_status: request.bookings.status,
          reason: "Booking rescheduled by owner approval",
        },
      });

      return tx.booking_reschedule_requests.findUnique({
        where: {
          id: requestId,
        },
        include: rescheduleRequestInclude(),
      });
    });
  },

  rejectRescheduleRequest(ownerId, requestId, ownerNote) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.booking_reschedule_requests.findFirst({
        where: {
          id: requestId,
          status: "PENDING",
          bookings: {
            fields: {
              owner_id: ownerId,
            },
          },
        },
        include: {
          bookings: true,
        },
      });

      if (!request) return null;

      await tx.booking_reschedule_requests.update({
        where: {
          id: requestId,
        },
        data: {
          status: "REJECTED",
          owner_note: ownerNote || "Rejected by owner",
          decided_by: ownerId,
          decided_at: new Date(),
        },
      });

      return tx.booking_reschedule_requests.findUnique({
        where: {
          id: requestId,
        },
        include: rescheduleRequestInclude(),
      });
    });
  },

  async syncBookingLifecycle(now = new Date()) {
    const GRACE_MINUTES = 5;
    const threshold = new Date(now.getTime() - GRACE_MINUTES * 60 * 1000);

    return prisma.$transaction(async (tx) => {
      const expiredPendingBookings = await tx.bookings.findMany({
        where: {
          status: "PENDING_CONFIRM",
          start_datetime: {
            lte: now,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      const expiredPaymentBookings = await tx.bookings.findMany({
        where: {
          status: "AWAITING_PAYMENT",
          payment_expires_at: {
            not: null,
            lte: now,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      const noShowBookings = await tx.bookings.findMany({
        where: {
          status: {
            in: ["APPROVED", "PAID"],
          },
          checked_in_at: null,
          end_datetime: {
            lte: threshold,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      const completedBookings = await tx.bookings.findMany({
        where: {
          status: "CHECKED_IN",
          end_datetime: {
            lte: threshold,
          },
        },
        select: {
          id: true,
          status: true,
        },
      });

      let rejectedResult = { count: 0 };
      let paymentExpiredResult = { count: 0 };
      let noShowResult = { count: 0 };
      let completedResult = { count: 0 };

      if (expiredPendingBookings.length > 0) {
        const ids = expiredPendingBookings.map((item) => item.id);

        rejectedResult = await tx.bookings.updateMany({
          where: {
            id: { in: ids },
            status: "PENDING_CONFIRM",
            start_datetime: {
              lte: now,
            },
          },
          data: {
            status: "REJECTED",
            updated_at: now,
          },
        });

        await tx.booking_status_history.createMany({
          data: expiredPendingBookings.map((item) => ({
            booking_id: item.id,
            from_status: item.status,
            to_status: "REJECTED",
            reason: "AUTO_REJECTED_AFTER_START_TIME",
          })),
        });
      }

      if (expiredPaymentBookings.length > 0) {
        const ids = expiredPaymentBookings.map((item) => item.id);

        paymentExpiredResult = await tx.bookings.updateMany({
          where: {
            id: { in: ids },
            status: "AWAITING_PAYMENT",
            payment_expires_at: {
              not: null,
              lte: now,
            },
          },
          data: {
            status: "PAYMENT_EXPIRED",
            updated_at: now,
          },
        });

        await tx.booking_status_history.createMany({
          data: expiredPaymentBookings.map((item) => ({
            booking_id: item.id,
            from_status: item.status,
            to_status: "PAYMENT_EXPIRED",
            reason: "AUTO_PAYMENT_EXPIRED",
          })),
        });
      }

      if (noShowBookings.length > 0) {
        const ids = noShowBookings.map((item) => item.id);

        noShowResult = await tx.bookings.updateMany({
          where: {
            id: { in: ids },
            status: {
              in: ["APPROVED", "PAID"],
            },
            checked_in_at: null,
            end_datetime: {
              lte: threshold,
            },
          },
          data: {
            status: "NO_SHOW",
            updated_at: now,
          },
        });

        await tx.booking_status_history.createMany({
          data: noShowBookings.map((item) => ({
            booking_id: item.id,
            from_status: item.status,
            to_status: "NO_SHOW",
            reason: "AUTO_NO_SHOW_AFTER_END_TIME_WITHOUT_CHECKIN",
          })),
        });
      }

      if (completedBookings.length > 0) {
        const ids = completedBookings.map((item) => item.id);

        completedResult = await tx.bookings.updateMany({
          where: {
            id: { in: ids },
            status: "CHECKED_IN",
            end_datetime: {
              lte: threshold,
            },
          },
          data: {
            status: "COMPLETED",
            updated_at: now,
          },
        });

        await tx.booking_status_history.createMany({
          data: completedBookings.map((item) => ({
            booking_id: item.id,
            from_status: item.status,
            to_status: "COMPLETED",
            reason: "AUTO_COMPLETED_AFTER_END_TIME",
          })),
        });
      }

      return {
        rejected: rejectedResult.count,
        payment_expired: paymentExpiredResult.count,
        no_show: noShowResult.count,
        completed: completedResult.count,
      };
    });
  },
};