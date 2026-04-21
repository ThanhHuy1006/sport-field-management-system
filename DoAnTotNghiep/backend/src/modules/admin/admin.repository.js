import prisma from "../../config/prisma.js";
import {
  FIELD_STATUS,
  OWNER_PROFILE_STATUS,
  USER_STATUS,
} from "../../config/constant.js";

export const adminRepository = {
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

  updateUserStatus(userId, status) {
    return prisma.users.update({
      where: { id: userId },
      data: { status },
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
      await tx.users.update({
        where: { id: userId },
        data: {
          role: "OWNER",
          status: USER_STATUS.ACTIVE,
        },
      });

      await tx.owner_profiles.update({
        where: { user_id: userId },
        data: {
          status: OWNER_PROFILE_STATUS.APPROVED,
          reject_reason: null,
          approved_by: adminId,
          approved_at: new Date(),
        },
      });

      return tx.owner_profiles.findUnique({
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
    });
  },

  rejectOwnerRegistration(adminId, userId, rejectReason) {
    return prisma.owner_profiles.update({
      where: { user_id: userId },
      data: {
        status: OWNER_PROFILE_STATUS.REJECTED,
        reject_reason: rejectReason,
        approved_by: adminId,
        approved_at: null,
      },
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

  updateFieldStatus(fieldId, status) {
    return prisma.fields.update({
      where: { id: fieldId },
      data: { status },
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

  countUsers() {
    return prisma.users.count();
  },

  countApprovedOwners() {
    return prisma.owner_profiles.count({
      where: {
        status: OWNER_PROFILE_STATUS.APPROVED,
      },
    });
  },

  countFields() {
    return prisma.fields.count();
  },

  countBookings() {
    return prisma.bookings.count();
  },

  findRevenueBookings() {
    return prisma.bookings.findMany({
      where: {
        status: {
          in: ["PAID", "COMPLETED"],
        },
      },
      select: {
        total_price: true,
      },
    });
  },
};