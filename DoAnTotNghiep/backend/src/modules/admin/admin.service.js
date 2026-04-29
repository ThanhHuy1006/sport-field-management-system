import { ConflictError, NotFoundError } from "../../core/errors/index.js";
import { FIELD_STATUS, OWNER_PROFILE_STATUS } from "../../config/constant.js";
import { adminRepository } from "./admin.repository.js";

export const adminService = {
  async getUsers() {
    return adminRepository.findUsers();
  },

  async getUserDetail(userId) {
    const user = await adminRepository.findUserById(userId);

    if (!user) {
      throw new NotFoundError("Không tìm thấy user");
    }

    return user;
  },
  async updateUserStatus(adminId, userId, payload) {
  const user = await adminRepository.findUserById(userId);

  if (!user) {
    throw new NotFoundError("Không tìm thấy user");
  }

  if (Number(adminId) === Number(userId)) {
    throw new ConflictError(
      "Admin không thể tự thay đổi trạng thái tài khoản của mình"
    );
  }

  if (user.role === "ADMIN") {
    throw new ConflictError(
      "Không thể thay đổi trạng thái tài khoản ADMIN"
    );
  }

  if (user.status === payload.status) {
    throw new ConflictError("User đã ở trạng thái này");
  }

  return adminRepository.updateUserStatus(userId, payload.status);
},



  async getOwnerRegistrations() {
    return adminRepository.findOwnerRegistrations();
  },

  async getOwnerRegistrationDetail(userId) {
    const item = await adminRepository.findOwnerRegistrationByUserId(userId);

    if (!item) {
      throw new NotFoundError("Không tìm thấy hồ sơ owner");
    }

    return item;
  },

  async approveOwnerRegistration(adminId, userId) {
    if (Number(adminId) === Number(userId)) {
      throw new ConflictError(
        "Admin không thể duyệt hồ sơ owner của chính mình",
      );
    }

    const item = await adminRepository.findOwnerRegistrationByUserId(userId);

    if (!item) {
      throw new NotFoundError("Không tìm thấy hồ sơ owner");
    }

    if (item.users_owner_profiles_user_idTousers?.role === "ADMIN") {
      throw new ConflictError("Không thể duyệt tài khoản ADMIN thành owner");
    }

    if (item.status !== OWNER_PROFILE_STATUS.PENDING) {
      throw new ConflictError("Chỉ hồ sơ pending mới được duyệt");
    }

    return adminRepository.approveOwnerRegistration(adminId, userId);
  },

  async rejectOwnerRegistration(adminId, userId, payload) {
    if (Number(adminId) === Number(userId)) {
      throw new ConflictError(
        "Admin không thể từ chối hồ sơ owner của chính mình",
      );
    }

    const item = await adminRepository.findOwnerRegistrationByUserId(userId);

    if (!item) {
      throw new NotFoundError("Không tìm thấy hồ sơ owner");
    }

    if (item.users_owner_profiles_user_idTousers?.role === "ADMIN") {
      throw new ConflictError(
        "Không thể xử lý hồ sơ owner của tài khoản ADMIN",
      );
    }

    if (item.status !== OWNER_PROFILE_STATUS.PENDING) {
      throw new ConflictError("Chỉ hồ sơ pending mới được từ chối");
    }

    return adminRepository.rejectOwnerRegistration(
      adminId,
      userId,
      payload.reject_reason,
    );
  },

  async getAdminFields() {
    return adminRepository.findAdminFields();
  },

  async approveField(fieldId) {
    const field = await adminRepository.findFieldById(fieldId);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    if (field.status !== FIELD_STATUS.PENDING) {
      throw new ConflictError("Chỉ sân pending mới được duyệt");
    }

    return adminRepository.updateFieldStatus(fieldId, FIELD_STATUS.ACTIVE);
  },

  async rejectField(fieldId, payload) {
  const field = await adminRepository.findFieldById(fieldId);

  if (!field) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  if (field.status !== FIELD_STATUS.PENDING) {
    throw new ConflictError("Chỉ sân pending mới được từ chối");
  }

  return adminRepository.rejectField(fieldId, payload.reject_reason);
},

  async getAdminBookings() {
    return adminRepository.findAdminBookings();
  },

  async getAdminBookingDetail(bookingId) {
    const booking = await adminRepository.findAdminBookingById(bookingId);

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    return booking;
  },

  async getAdminDashboardSummary() {
    const [
      totalUsers,
      totalApprovedOwners,
      totalFields,
      totalBookings,
      revenueItems,
    ] = await Promise.all([
      adminRepository.countUsers(),
      adminRepository.countApprovedOwners(),
      adminRepository.countFields(),
      adminRepository.countBookings(),
      adminRepository.findRevenueBookings(),
    ]);

    const totalRevenue = revenueItems.reduce(
      (sum, item) => sum + Number(item.total_price || 0),
      0,
    );

    return {
      total_users: totalUsers,
      total_approved_owners: totalApprovedOwners,
      total_fields: totalFields,
      total_bookings: totalBookings,
      total_revenue: totalRevenue,
    };
  },
};
