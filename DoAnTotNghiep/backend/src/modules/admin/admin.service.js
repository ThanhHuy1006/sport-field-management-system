import { adminRepository } from "./admin.repository.js";
import {
  validateUserStatusPayload,
  validateRejectOwnerPayload,
  validateId,
} from "./admin.validator.js";

export const adminService = {
  async getUsers() {
    return adminRepository.findUsers();
  },

  async getUserDetail(userId) {
    const id = validateId(userId, "userId");
    const user = await adminRepository.findUserById(id);

    if (!user) {
      throw new Error("Không tìm thấy user");
    }

    return user;
  },

  async updateUserStatus(userId, payload) {
    const id = validateId(userId, "userId");
    const valid = validateUserStatusPayload(payload);

    const user = await adminRepository.findUserById(id);
    if (!user) {
      throw new Error("Không tìm thấy user");
    }

    return adminRepository.updateUserStatus(id, valid.status);
  },

  async getOwnerRegistrations() {
    return adminRepository.findOwnerRegistrations();
  },

  async getOwnerRegistrationDetail(userId) {
    const id = validateId(userId, "userId");
    const item = await adminRepository.findOwnerRegistrationByUserId(id);

    if (!item) {
      throw new Error("Không tìm thấy hồ sơ owner");
    }

    return item;
  },

  async approveOwnerRegistration(adminId, userId) {
    const id = validateId(userId, "userId");
    const item = await adminRepository.findOwnerRegistrationByUserId(id);

    if (!item) {
      throw new Error("Không tìm thấy hồ sơ owner");
    }

    if (item.status !== "pending") {
      throw new Error("Chỉ hồ sơ pending mới được duyệt");
    }

    return adminRepository.approveOwnerRegistration(adminId, id);
  },

  async rejectOwnerRegistration(adminId, userId, payload) {
    const id = validateId(userId, "userId");
    const valid = validateRejectOwnerPayload(payload);

    const item = await adminRepository.findOwnerRegistrationByUserId(id);

    if (!item) {
      throw new Error("Không tìm thấy hồ sơ owner");
    }

    if (item.status !== "pending") {
      throw new Error("Chỉ hồ sơ pending mới được từ chối");
    }

    return adminRepository.rejectOwnerRegistration(adminId, id, valid.reason);
  },

  async getAdminFields() {
    return adminRepository.findAdminFields();
  },

  async approveField(fieldId) {
    const id = validateId(fieldId, "fieldId");
    const field = await adminRepository.findFieldById(id);

    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (field.status !== "pending") {
      throw new Error("Chỉ sân pending mới được duyệt");
    }

    return adminRepository.updateFieldStatus(id, "active");
  },

  async rejectField(fieldId) {
    const id = validateId(fieldId, "fieldId");
    const field = await adminRepository.findFieldById(id);

    if (!field) {
      throw new Error("Không tìm thấy sân");
    }

    if (field.status !== "pending") {
      throw new Error("Chỉ sân pending mới được từ chối");
    }

    return adminRepository.updateFieldStatus(id, "hidden");
  },

  async getAdminBookings() {
    return adminRepository.findAdminBookings();
  },

  async getAdminBookingDetail(bookingId) {
    const id = validateId(bookingId, "bookingId");
    const booking = await adminRepository.findAdminBookingById(id);

    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    return booking;
  },
};