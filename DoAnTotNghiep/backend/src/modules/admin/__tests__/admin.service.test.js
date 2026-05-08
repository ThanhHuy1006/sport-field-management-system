// src/modules/admin/__tests__/admin.service.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../admin.repository.js", () => ({
  adminRepository: {
    findUsers: vi.fn(),
    findUserById: vi.fn(),
    updateUserStatus: vi.fn(),

    findOwnerRegistrations: vi.fn(),
    findOwnerRegistrationByUserId: vi.fn(),
    approveOwnerRegistration: vi.fn(),
    rejectOwnerRegistration: vi.fn(),

    findAdminFields: vi.fn(),
    findFieldById: vi.fn(),
    updateFieldStatus: vi.fn(),
    rejectField: vi.fn(),

    findAdminBookings: vi.fn(),
    findAdminBookingById: vi.fn(),

    countUsers: vi.fn(),
    countApprovedOwners: vi.fn(),
    countFields: vi.fn(),
    countBookings: vi.fn(),
    findRevenueBookings: vi.fn(),
  },
}));

vi.mock("../../../config/constant.js", () => ({
  FIELD_STATUS: {
    PENDING: "pending",
    ACTIVE: "active",
  },
  OWNER_PROFILE_STATUS: {
    PENDING: "pending",
  },
}));

import { adminService } from "../admin.service.js";
import { adminRepository } from "../admin.repository.js";

describe("admin.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getUsers", () => {
    it("trả danh sách users", async () => {
      adminRepository.findUsers.mockResolvedValue([
        { id: 1, email: "user@gmail.com" },
      ]);

      const result = await adminService.getUsers();

      expect(adminRepository.findUsers).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe("getUserDetail", () => {
    it("trả user detail nếu tồn tại", async () => {
      adminRepository.findUserById.mockResolvedValue({
        id: 1,
        email: "user@gmail.com",
      });

      const result = await adminService.getUserDetail(1);

      expect(adminRepository.findUserById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it("báo lỗi nếu không tìm thấy user", async () => {
      adminRepository.findUserById.mockResolvedValue(null);

      await expect(adminService.getUserDetail(999)).rejects.toThrow(
        "Không tìm thấy user",
      );
    });
  });

  describe("updateUserStatus", () => {
    it("báo lỗi nếu không tìm thấy user", async () => {
      adminRepository.findUserById.mockResolvedValue(null);

      await expect(
        adminService.updateUserStatus(1, 999, { status: "locked" }),
      ).rejects.toThrow("Không tìm thấy user");

      expect(adminRepository.updateUserStatus).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu admin tự đổi trạng thái tài khoản của mình", async () => {
      adminRepository.findUserById.mockResolvedValue({
        id: 1,
        role: "ADMIN",
        status: "active",
      });

      await expect(
        adminService.updateUserStatus(1, 1, { status: "locked" }),
      ).rejects.toThrow(
        "Admin không thể tự thay đổi trạng thái tài khoản của mình",
      );

      expect(adminRepository.updateUserStatus).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu đổi trạng thái tài khoản ADMIN khác", async () => {
      adminRepository.findUserById.mockResolvedValue({
        id: 2,
        role: "ADMIN",
        status: "active",
      });

      await expect(
        adminService.updateUserStatus(1, 2, { status: "locked" }),
      ).rejects.toThrow("Không thể thay đổi trạng thái tài khoản ADMIN");

      expect(adminRepository.updateUserStatus).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu user đã ở trạng thái này", async () => {
      adminRepository.findUserById.mockResolvedValue({
        id: 2,
        role: "USER",
        status: "locked",
      });

      await expect(
        adminService.updateUserStatus(1, 2, { status: "locked" }),
      ).rejects.toThrow("User đã ở trạng thái này");

      expect(adminRepository.updateUserStatus).not.toHaveBeenCalled();
    });

    it("cập nhật trạng thái user thành công", async () => {
      adminRepository.findUserById.mockResolvedValue({
        id: 2,
        role: "USER",
        status: "active",
      });

      adminRepository.updateUserStatus.mockResolvedValue({
        id: 2,
        status: "locked",
      });

      const result = await adminService.updateUserStatus(1, 2, {
        status: "locked",
      });

      expect(adminRepository.updateUserStatus).toHaveBeenCalledWith(
        2,
        "locked",
      );

      expect(result.status).toBe("locked");
    });
  });

  describe("owner registrations", () => {
    it("getOwnerRegistrations trả danh sách hồ sơ owner", async () => {
      adminRepository.findOwnerRegistrations.mockResolvedValue([
        { user_id: 2, status: "pending" },
      ]);

      const result = await adminService.getOwnerRegistrations();

      expect(adminRepository.findOwnerRegistrations).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it("getOwnerRegistrationDetail báo lỗi nếu không tìm thấy hồ sơ", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue(null);

      await expect(
        adminService.getOwnerRegistrationDetail(999),
      ).rejects.toThrow("Không tìm thấy hồ sơ owner");
    });

    it("approveOwnerRegistration báo lỗi nếu admin tự duyệt chính mình", async () => {
      await expect(
        adminService.approveOwnerRegistration(1, 1),
      ).rejects.toThrow("Admin không thể duyệt hồ sơ owner của chính mình");

      expect(
        adminRepository.findOwnerRegistrationByUserId,
      ).not.toHaveBeenCalled();
    });

    it("approveOwnerRegistration báo lỗi nếu không tìm thấy hồ sơ", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue(null);

      await expect(
        adminService.approveOwnerRegistration(1, 2),
      ).rejects.toThrow("Không tìm thấy hồ sơ owner");
    });

    it("approveOwnerRegistration báo lỗi nếu hồ sơ thuộc tài khoản ADMIN", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue({
        user_id: 2,
        status: "pending",
        users_owner_profiles_user_idTousers: {
          role: "ADMIN",
        },
      });

      await expect(
        adminService.approveOwnerRegistration(1, 2),
      ).rejects.toThrow("Không thể duyệt tài khoản ADMIN thành owner");
    });

    it("approveOwnerRegistration báo lỗi nếu hồ sơ không pending", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue({
        user_id: 2,
        status: "approved",
        users_owner_profiles_user_idTousers: {
          role: "USER",
        },
      });

      await expect(
        adminService.approveOwnerRegistration(1, 2),
      ).rejects.toThrow("Chỉ hồ sơ pending mới được duyệt");
    });

    it("approveOwnerRegistration duyệt hồ sơ owner thành công", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue({
        user_id: 2,
        status: "pending",
        users_owner_profiles_user_idTousers: {
          role: "USER",
        },
      });

      adminRepository.approveOwnerRegistration.mockResolvedValue({
        user_id: 2,
        status: "approved",
      });

      const result = await adminService.approveOwnerRegistration(1, 2);

      expect(adminRepository.approveOwnerRegistration).toHaveBeenCalledWith(
        1,
        2,
      );

      expect(result.status).toBe("approved");
    });

    it("rejectOwnerRegistration báo lỗi nếu admin tự từ chối chính mình", async () => {
      await expect(
        adminService.rejectOwnerRegistration(1, 1, {
          reject_reason: "Không hợp lệ",
        }),
      ).rejects.toThrow("Admin không thể từ chối hồ sơ owner của chính mình");

      expect(
        adminRepository.findOwnerRegistrationByUserId,
      ).not.toHaveBeenCalled();
    });

    it("rejectOwnerRegistration báo lỗi nếu không tìm thấy hồ sơ", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue(null);

      await expect(
        adminService.rejectOwnerRegistration(1, 2, {
          reject_reason: "Không hợp lệ",
        }),
      ).rejects.toThrow("Không tìm thấy hồ sơ owner");
    });

    it("rejectOwnerRegistration báo lỗi nếu hồ sơ thuộc tài khoản ADMIN", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue({
        user_id: 2,
        status: "pending",
        users_owner_profiles_user_idTousers: {
          role: "ADMIN",
        },
      });

      await expect(
        adminService.rejectOwnerRegistration(1, 2, {
          reject_reason: "Không hợp lệ",
        }),
      ).rejects.toThrow(
        "Không thể xử lý hồ sơ owner của tài khoản ADMIN",
      );
    });

    it("rejectOwnerRegistration báo lỗi nếu hồ sơ không pending", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue({
        user_id: 2,
        status: "approved",
        users_owner_profiles_user_idTousers: {
          role: "USER",
        },
      });

      await expect(
        adminService.rejectOwnerRegistration(1, 2, {
          reject_reason: "Không hợp lệ",
        }),
      ).rejects.toThrow("Chỉ hồ sơ pending mới được từ chối");
    });

    it("rejectOwnerRegistration từ chối hồ sơ owner thành công", async () => {
      adminRepository.findOwnerRegistrationByUserId.mockResolvedValue({
        user_id: 2,
        status: "pending",
        users_owner_profiles_user_idTousers: {
          role: "USER",
        },
      });

      adminRepository.rejectOwnerRegistration.mockResolvedValue({
        user_id: 2,
        status: "rejected",
        reject_reason: "Không hợp lệ",
      });

      const result = await adminService.rejectOwnerRegistration(1, 2, {
        reject_reason: "Không hợp lệ",
      });

      expect(adminRepository.rejectOwnerRegistration).toHaveBeenCalledWith(
        1,
        2,
        "Không hợp lệ",
      );

      expect(result.status).toBe("rejected");
    });
  });

  describe("admin fields", () => {
    it("getAdminFields trả danh sách sân admin", async () => {
      adminRepository.findAdminFields.mockResolvedValue([
        { id: 1, field_name: "Sân A" },
      ]);

      const result = await adminService.getAdminFields();

      expect(adminRepository.findAdminFields).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it("approveField báo lỗi nếu không tìm thấy sân", async () => {
      adminRepository.findFieldById.mockResolvedValue(null);

      await expect(adminService.approveField(999)).rejects.toThrow(
        "Không tìm thấy sân",
      );

      expect(adminRepository.updateFieldStatus).not.toHaveBeenCalled();
    });

    it("approveField báo lỗi nếu sân không pending", async () => {
      adminRepository.findFieldById.mockResolvedValue({
        id: 1,
        status: "active",
      });

      await expect(adminService.approveField(1)).rejects.toThrow(
        "Chỉ sân pending mới được duyệt",
      );
    });

    it("approveField duyệt sân thành công", async () => {
      adminRepository.findFieldById.mockResolvedValue({
        id: 1,
        status: "pending",
      });

      adminRepository.updateFieldStatus.mockResolvedValue({
        id: 1,
        status: "active",
      });

      const result = await adminService.approveField(1);

      expect(adminRepository.updateFieldStatus).toHaveBeenCalledWith(
        1,
        "active",
      );

      expect(result.status).toBe("active");
    });

    it("rejectField báo lỗi nếu không tìm thấy sân", async () => {
      adminRepository.findFieldById.mockResolvedValue(null);

      await expect(
        adminService.rejectField(999, {
          reject_reason: "Thiếu ảnh sân",
        }),
      ).rejects.toThrow("Không tìm thấy sân");

      expect(adminRepository.rejectField).not.toHaveBeenCalled();
    });

    it("rejectField báo lỗi nếu sân không pending", async () => {
      adminRepository.findFieldById.mockResolvedValue({
        id: 1,
        status: "active",
      });

      await expect(
        adminService.rejectField(1, {
          reject_reason: "Thiếu ảnh sân",
        }),
      ).rejects.toThrow("Chỉ sân pending mới được từ chối");
    });

    it("rejectField từ chối sân thành công", async () => {
      adminRepository.findFieldById.mockResolvedValue({
        id: 1,
        status: "pending",
      });

      adminRepository.rejectField.mockResolvedValue({
        id: 1,
        status: "rejected",
        reject_reason: "Thiếu ảnh sân",
      });

      const result = await adminService.rejectField(1, {
        reject_reason: "Thiếu ảnh sân",
      });

      expect(adminRepository.rejectField).toHaveBeenCalledWith(
        1,
        "Thiếu ảnh sân",
      );

      expect(result.status).toBe("rejected");
    });
  });

  describe("admin bookings", () => {
    it("getAdminBookings trả danh sách booking", async () => {
      adminRepository.findAdminBookings.mockResolvedValue([
        { id: 1, status: "PAID" },
      ]);

      const result = await adminService.getAdminBookings();

      expect(adminRepository.findAdminBookings).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it("getAdminBookingDetail báo lỗi nếu không tìm thấy booking", async () => {
      adminRepository.findAdminBookingById.mockResolvedValue(null);

      await expect(adminService.getAdminBookingDetail(999)).rejects.toThrow(
        "Không tìm thấy booking",
      );
    });

    it("getAdminBookingDetail trả booking nếu tồn tại", async () => {
      adminRepository.findAdminBookingById.mockResolvedValue({
        id: 1,
        status: "PAID",
      });

      const result = await adminService.getAdminBookingDetail(1);

      expect(adminRepository.findAdminBookingById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });
  });

  describe("getAdminDashboardSummary", () => {
    it("trả dashboard summary và tính đúng tổng doanh thu", async () => {
      adminRepository.countUsers.mockResolvedValue(10);
      adminRepository.countApprovedOwners.mockResolvedValue(3);
      adminRepository.countFields.mockResolvedValue(8);
      adminRepository.countBookings.mockResolvedValue(20);
      adminRepository.findRevenueBookings.mockResolvedValue([
        { total_price: "100000" },
        { total_price: 200000 },
        { total_price: null },
      ]);

      const result = await adminService.getAdminDashboardSummary();

      expect(adminRepository.countUsers).toHaveBeenCalled();
      expect(adminRepository.countApprovedOwners).toHaveBeenCalled();
      expect(adminRepository.countFields).toHaveBeenCalled();
      expect(adminRepository.countBookings).toHaveBeenCalled();
      expect(adminRepository.findRevenueBookings).toHaveBeenCalled();

      expect(result).toEqual({
        total_users: 10,
        total_approved_owners: 3,
        total_fields: 8,
        total_bookings: 20,
        total_revenue: 300000,
      });
    });
  });
});