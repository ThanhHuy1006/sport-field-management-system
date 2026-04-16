import prisma from "../../config/prisma.js";

export const ownerRepository = {
  findOwnerProfileByUserId(userId) {
    return prisma.owner_profiles.findUnique({
      where: { user_id: userId },
      include: {
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
      },
    });
  },

  createOwnerRegistration(userId, businessName) {
    return prisma.owner_profiles.create({
      data: {
        user_id: userId,
        business_name: businessName,
        status: "pending",
      },
      include: {
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
      },
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
      include: {
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
      },
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