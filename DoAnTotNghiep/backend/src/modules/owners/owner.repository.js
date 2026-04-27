import prisma from "../../config/prisma.js";

const ownerProfileInclude = {
  users_owner_profiles_user_idTousers: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      avatar_url: true,
      role: true,
      status: true,
    },
  },
};

export const ownerRepository = {
  findOwnerProfileByUserId(userId) {
    return prisma.owner_profiles.findUnique({
      where: { user_id: userId },
      include: ownerProfileInclude,
    });
  },

  createOwnerRegistration(userId, data) {
    return prisma.owner_profiles.create({
      data: {
        user_id: userId,
        business_name: data.business_name,
        tax_code: data.tax_code ?? null,
        address: data.address,
        license_url: data.license_url,
        id_front_url: data.id_front_url,
        id_back_url: data.id_back_url,
        status: "pending",
      },
      include: ownerProfileInclude,
    });
  },

  updateOwnerRegistration(userId, data) {
    return prisma.owner_profiles.update({
      where: { user_id: userId },
      data: {
        ...data,
        status: "pending",
        approved_at: null,
        approved_by: null,
        reject_reason: null,
      },
      include: ownerProfileInclude,
    });
  },

  findUserById(userId) {
    return prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
      },
    });
  },

  updateUserProfile(userId, data) {
    return prisma.users.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
      },
    });
  },

  countFieldsByOwner(userId) {
    return prisma.fields.count({
      where: { owner_id: userId },
    });
  },

  countPendingBookingsByOwner(userId) {
    return prisma.bookings.count({
      where: {
        status: "PENDING_CONFIRM",
        fields: {
          owner_id: userId,
        },
      },
    });
  },

  findOwnerBookingsThisMonth(userId, startDate, endDate) {
    return prisma.bookings.findMany({
      where: {
        fields: {
          owner_id: userId,
        },
        created_at: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        status: true,
        total_price: true,
      },
    });
  },

  findRecentOwnerBookings(userId, limit = 5) {
    return prisma.bookings.findMany({
      where: {
        fields: {
          owner_id: userId,
        },
      },
      orderBy: { created_at: "desc" },
      take: limit,
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
            field_name: true,
            address: true,
          },
        },
      },
    });
  },

  findRecentOwnerNotifications(userId, limit = 5) {
    return prisma.notifications.findMany({
      where: {
        user_id: userId,
      },
      orderBy: { created_at: "desc" },
      take: limit,
    });
  },
};