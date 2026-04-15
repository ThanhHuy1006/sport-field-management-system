import { successResponse } from "../../core/utils/response.js";
import { adminService } from "./admin.service.js";

export const adminController = {
  async getUsers(req, res, next) {
    try {
      const items = await adminService.getUsers();
      return successResponse(res, items, "Lấy danh sách users thành công");
    } catch (error) {
      next(error);
    }
  },

  async getUserDetail(req, res, next) {
    try {
      const item = await adminService.getUserDetail(req.params.userId);
      return successResponse(res, item, "Lấy chi tiết user thành công");
    } catch (error) {
      next(error);
    }
  },

  async updateUserStatus(req, res, next) {
    try {
      const item = await adminService.updateUserStatus(req.params.userId, req.body);
      return successResponse(res, item, "Cập nhật trạng thái user thành công");
    } catch (error) {
      next(error);
    }
  },

  async getOwnerRegistrations(req, res, next) {
    try {
      const items = await adminService.getOwnerRegistrations();
      return successResponse(res, items, "Lấy danh sách hồ sơ owner thành công");
    } catch (error) {
      next(error);
    }
  },

  async getOwnerRegistrationDetail(req, res, next) {
    try {
      const item = await adminService.getOwnerRegistrationDetail(req.params.userId);
      return successResponse(res, item, "Lấy chi tiết hồ sơ owner thành công");
    } catch (error) {
      next(error);
    }
  },

  async approveOwnerRegistration(req, res, next) {
    try {
      const item = await adminService.approveOwnerRegistration(
        req.user.id,
        req.params.userId
      );
      return successResponse(res, item, "Duyệt hồ sơ owner thành công");
    } catch (error) {
      next(error);
    }
  },

  async rejectOwnerRegistration(req, res, next) {
    try {
      const item = await adminService.rejectOwnerRegistration(
        req.user.id,
        req.params.userId,
        req.body
      );
      return successResponse(res, item, "Từ chối hồ sơ owner thành công");
    } catch (error) {
      next(error);
    }
  },

  async getAdminFields(req, res, next) {
    try {
      const items = await adminService.getAdminFields();
      return successResponse(res, items, "Lấy danh sách sân thành công");
    } catch (error) {
      next(error);
    }
  },

  async approveField(req, res, next) {
    try {
      const item = await adminService.approveField(req.params.fieldId);
      return successResponse(res, item, "Duyệt sân thành công");
    } catch (error) {
      next(error);
    }
  },

  async rejectField(req, res, next) {
    try {
      const item = await adminService.rejectField(req.params.fieldId);
      return successResponse(res, item, "Từ chối sân thành công");
    } catch (error) {
      next(error);
    }
  },

  async getAdminBookings(req, res, next) {
    try {
      const items = await adminService.getAdminBookings();
      return successResponse(res, items, "Lấy danh sách booking thành công");
    } catch (error) {
      next(error);
    }
  },

  async getAdminBookingDetail(req, res, next) {
    try {
      const item = await adminService.getAdminBookingDetail(req.params.bookingId);
      return successResponse(res, item, "Lấy chi tiết booking thành công");
    } catch (error) {
      next(error);
    }
  },
};