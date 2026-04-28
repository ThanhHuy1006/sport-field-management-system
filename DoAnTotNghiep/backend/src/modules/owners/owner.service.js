import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";
import { ownerRepository } from "./owner.repository.js";

function getMonthRange() {
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const endDate = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
    23,
    59,
    59,
  );
  return { startDate, endDate };
}

export const ownerService = {
  async createOwnerRegistration(userId, payload) {
    const user = await ownerRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError("Không tìm thấy user");
    }

    if (user.role !== "USER") {
      throw new ForbiddenError(
        "Chỉ tài khoản USER mới được đăng ký làm chủ sân",
      );
    }

    const existing = await ownerRepository.findOwnerProfileByUserId(userId);

    if (existing) {
      throw new ConflictError("Bạn đã có hồ sơ đăng ký owner");
    }

    return ownerRepository.createOwnerRegistration(userId, payload);
  },
  async getMyOwnerRegistration(userId) {
    const ownerProfile = await ownerRepository.findOwnerProfileByUserId(userId);

    if (!ownerProfile) {
      throw new NotFoundError("Bạn chưa có hồ sơ đăng ký owner");
    }

    return ownerProfile;
  },

  async updateMyOwnerRegistration(userId, payload) {
  const user = await ownerRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("Không tìm thấy user");
  }

  if (user.role !== "USER") {
    throw new ForbiddenError("Chỉ tài khoản USER mới được cập nhật hồ sơ đăng ký owner");
  }

  const ownerProfile = await ownerRepository.findOwnerProfileByUserId(userId);

  if (!ownerProfile) {
    throw new NotFoundError("Bạn chưa có hồ sơ đăng ký owner");
  }

  if (ownerProfile.status === "approved") {
    throw new ForbiddenError(
      "Hồ sơ owner đã được duyệt, không thể cập nhật lại đăng ký"
    );
  }

  return ownerRepository.updateOwnerRegistration(userId, payload);
},

  async getMyOwnerProfile(userId) {
    const user = await ownerRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError("Không tìm thấy user");
    }

    const ownerProfile = await ownerRepository.findOwnerProfileByUserId(userId);

    return { user, ownerProfile };
  },

  async updateMyOwnerProfile(userId, payload) {
    const user = await ownerRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError("Không tìm thấy user");
    }

    const updatedUser = await ownerRepository.updateUserProfile(
      userId,
      payload,
    );
    const ownerProfile = await ownerRepository.findOwnerProfileByUserId(userId);

    return {
      user: updatedUser,
      ownerProfile,
    };
  },

  async getOwnerDashboardSummary(userId) {
    const { startDate, endDate } = getMonthRange();

    const [totalFields, pendingBookings, monthlyBookings] = await Promise.all([
      ownerRepository.countFieldsByOwner(userId),
      ownerRepository.countPendingBookingsByOwner(userId),
      ownerRepository.findOwnerBookingsThisMonth(userId, startDate, endDate),
    ]);

    const totalRevenueThisMonth = monthlyBookings
      .filter((x) => ["PAID", "COMPLETED"].includes(x.status))
      .reduce((sum, x) => sum + Number(x.total_price || 0), 0);

    return {
      total_fields: totalFields,
      pending_bookings: pendingBookings,
      total_bookings_this_month: monthlyBookings.length,
      total_revenue_this_month: totalRevenueThisMonth,
    };
  },

  async getRecentOwnerBookings(userId) {
    return ownerRepository.findRecentOwnerBookings(userId, 5);
  },

  async getRecentOwnerNotifications(userId) {
    return ownerRepository.findRecentOwnerNotifications(userId, 5);
  },
};
