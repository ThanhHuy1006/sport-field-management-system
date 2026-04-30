import prisma from "../../config/prisma.js";

function buildBookingDateWhere({ from, to }) {
  return {
    start_datetime: {
      gte: from,
      lte: to,
    },
  };
}

export const reportsRepository = {
  getOwnerFields(ownerId) {
    return prisma.fields.findMany({
      where: { owner_id: ownerId },
      select: {
        id: true,
        owner_id: true,
        field_name: true,
        sport_type: true,
        district: true,
        status: true,
        base_price_per_hour: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  getAllFields({ sportType = null, district = null } = {}) {
    return prisma.fields.findMany({
      where: {
        ...(sportType ? { sport_type: sportType } : {}),
        ...(district ? { district } : {}),
      },
      select: {
        id: true,
        owner_id: true,
        field_name: true,
        sport_type: true,
        district: true,
        status: true,
        base_price_per_hour: true,
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { created_at: "desc" },
    });
  },

  getOwnerBookings(ownerId, { from, to, fieldId = null }) {
    return prisma.bookings.findMany({
      where: {
        ...buildBookingDateWhere({ from, to }),
        ...(fieldId ? { field_id: fieldId } : {}),
        fields: {
          is: {
            owner_id: ownerId,
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        fields: {
          select: {
            id: true,
            owner_id: true,
            field_name: true,
            sport_type: true,
            district: true,
            status: true,
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { start_datetime: "asc" },
    });
  },

  getAdminBookings({ from, to, sportType = null, district = null }) {
    return prisma.bookings.findMany({
      where: {
        ...buildBookingDateWhere({ from, to }),
        fields: {
          is: {
            ...(sportType ? { sport_type: sportType } : {}),
            ...(district ? { district } : {}),
          },
        },
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        fields: {
          select: {
            id: true,
            owner_id: true,
            field_name: true,
            sport_type: true,
            district: true,
            status: true,
            users: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        payments: true,
      },
      orderBy: { start_datetime: "asc" },
    });
  },

  getOwnerReviews(ownerId, { from, to, fieldId = null }) {
    return prisma.reviews.findMany({
      where: {
        created_at: {
          gte: from,
          lte: to,
        },
        visible: true,
        ...(fieldId ? { field_id: fieldId } : {}),
        fields: {
          is: {
            owner_id: ownerId,
          },
        },
      },
      select: {
        id: true,
        field_id: true,
        rating: true,
        created_at: true,
      },
    });
  },

  getAdminReviews({ from, to, sportType = null, district = null }) {
    return prisma.reviews.findMany({
      where: {
        created_at: {
          gte: from,
          lte: to,
        },
        visible: true,
        fields: {
          is: {
            ...(sportType ? { sport_type: sportType } : {}),
            ...(district ? { district } : {}),
          },
        },
      },
      select: {
        id: true,
        field_id: true,
        rating: true,
        created_at: true,
        fields: {
          select: {
            id: true,
            owner_id: true,
            sport_type: true,
            district: true,
          },
        },
      },
    });
  },

  countUsersByRole(role) {
    return prisma.users.count({
      where: { role },
    });
  },

  countUsersByStatus(status) {
    return prisma.users.count({
      where: { status },
    });
  },
};