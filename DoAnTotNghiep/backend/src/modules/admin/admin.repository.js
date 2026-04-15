import prisma from "../../config/prisma.js";

export const adminRepository = {
  // USERS
  findUsers() {
    return prisma.users.findMany({
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
        created_at: true,
        owner_profiles_owner_profiles_user_idTousers: {
          select: {
            status: true,
            business_name: true,
            approved_at: true,
            reject_reason: true,
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
        created_at: true,
        updated_at: true,
        owner_profiles_owner_profiles_user_idTousers: true,
      },
    });
  },

  updateUserStatus(userId, status) {
    return prisma.users.update({
      where: { id: userId },
      data: { status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });
  },

  // OWNER REGISTRATIONS
  findOwnerRegistrations() {
    return prisma.owner_profiles.findMany({
      orderBy: { created_at: "desc" },
      include: {
        users_owner_profiles_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        users_owner_profiles_approved_byTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  findOwnerRegistrationByUserId(userId) {
    return prisma.owner_profiles.findUnique({
      where: { user_id: userId },
      include: {
        users_owner_profiles_user_idTousers: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        users_owner_profiles_approved_byTousers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  },

  approveOwnerRegistration(adminId, userId) {
    return prisma.$transaction(async (tx) => {
      const profile = await tx.owner_profiles.update({
        where: { user_id: userId },
        data: {
          status: "approved",
          reject_reason: null,
          approved_by: adminId,
          approved_at: new Date(),
        },
      });

      await tx.users.update({
        where: { id: userId },
        data: {
          role: "OWNER",
          status: "active",
        },
      });

      return profile;
    });
  },

  rejectOwnerRegistration(adminId, userId, reason) {
    return prisma.owner_profiles.update({
      where: { user_id: userId },
      data: {
        status: "rejected",
        reject_reason: reason,
        approved_by: adminId,
        approved_at: new Date(),
      },
    });
  },

  // FIELDS
  findAdminFields() {
    return prisma.fields.findMany({
      orderBy: { created_at: "desc" },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
          take: 1,
        },
      },
    });
  },

  findFieldById(fieldId) {
    return prisma.fields.findUnique({
      where: { id: fieldId },
    });
  },

  updateFieldStatus(fieldId, status) {
    return prisma.fields.update({
      where: { id: fieldId },
      data: { status },
    });
  },

  // BOOKINGS
  findAdminBookings() {
    return prisma.bookings.findMany({
      orderBy: { created_at: "desc" },
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
            sport_type: true,
            owner_id: true,
          },
        },
      },
    });
  },

  findAdminBookingById(bookingId) {
    return prisma.bookings.findUnique({
      where: { id: bookingId },
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
            sport_type: true,
            owner_id: true,
          },
        },
        booking_status_history: {
          orderBy: { changed_at: "desc" },
        },
        payments: true,
      },
    });
  },
};