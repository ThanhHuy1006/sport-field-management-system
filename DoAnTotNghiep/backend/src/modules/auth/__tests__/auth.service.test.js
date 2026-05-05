// src/modules/auth/__tests__/auth.service.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../auth.repository.js", () => ({
  authRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    findFullById: vi.fn(),
    createUser: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock("../../../config/jwt.js", () => ({
  signAccessToken: vi.fn(),
}));

import bcrypt from "bcrypt";
import { authService } from "../auth.service.js";
import { authRepository } from "../auth.repository.js";
import { signAccessToken } from "../../../config/jwt.js";

describe("auth.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("đăng ký thành công nếu email chưa tồn tại", async () => {
      authRepository.findByEmail.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue("hashed_password");

      authRepository.createUser.mockResolvedValue({
        id: 1,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        avatar_url: null,
        role: "USER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
      });

      signAccessToken.mockReturnValue("fake_access_token");

      const result = await authService.register({
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        password: "123456",
      });

      expect(authRepository.findByEmail).toHaveBeenCalledWith("user@gmail.com");
      expect(bcrypt.hash).toHaveBeenCalledWith("123456", expect.any(Number));

      expect(authRepository.createUser).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "Nguyễn Văn A",
          email: "user@gmail.com",
          phone: "0909123456",
          password_hash: "hashed_password",
          role: "USER",
          status: "active",
        }),
      );

      expect(signAccessToken).toHaveBeenCalledWith({
        sub: 1,
        role: "USER",
        email: "user@gmail.com",
      });

      expect(result.token).toBe("fake_access_token");

      expect(result.user).toEqual({
        id: 1,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        avatar_url: null,
        role: "USER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
      });
    });

    it("báo lỗi nếu email đã tồn tại", async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "user@gmail.com",
      });

      await expect(
        authService.register({
          name: "Nguyễn Văn A",
          email: "user@gmail.com",
          phone: "0909123456",
          password: "123456",
        }),
      ).rejects.toThrow("Email đã tồn tại");

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(authRepository.createUser).not.toHaveBeenCalled();
      expect(signAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("đăng nhập thành công nếu email và password đúng", async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 1,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        avatar_url: null,
        role: "USER",
        status: "active",
        password_hash: "hashed_password",
      });

      bcrypt.compare.mockResolvedValue(true);
      signAccessToken.mockReturnValue("fake_access_token");

      const result = await authService.login({
        email: "user@gmail.com",
        password: "123456",
      });

      expect(authRepository.findByEmail).toHaveBeenCalledWith("user@gmail.com");
      expect(bcrypt.compare).toHaveBeenCalledWith("123456", "hashed_password");

      expect(signAccessToken).toHaveBeenCalledWith({
        sub: 1,
        role: "USER",
        email: "user@gmail.com",
      });

      expect(result.token).toBe("fake_access_token");

      expect(result.user).toEqual({
        id: 1,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        avatar_url: null,
        role: "USER",
        status: "active",
      });
    });

    it("báo lỗi nếu email không tồn tại", async () => {
      authRepository.findByEmail.mockResolvedValue(null);

      await expect(
        authService.login({
          email: "notfound@gmail.com",
          password: "123456",
        }),
      ).rejects.toThrow("Sai email hoặc mật khẩu");

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(signAccessToken).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu mật khẩu sai", async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "user@gmail.com",
        status: "active",
        password_hash: "hashed_password",
      });

      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.login({
          email: "user@gmail.com",
          password: "wrong-password",
        }),
      ).rejects.toThrow("Sai email hoặc mật khẩu");

      expect(signAccessToken).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu tài khoản đã bị khóa", async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "user@gmail.com",
        status: "locked",
        password_hash: "hashed_password",
      });

      await expect(
        authService.login({
          email: "user@gmail.com",
          password: "123456",
        }),
      ).rejects.toThrow("Tài khoản đã bị khóa");

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(signAccessToken).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu tài khoản đã bị xóa", async () => {
      authRepository.findByEmail.mockResolvedValue({
        id: 1,
        email: "user@gmail.com",
        status: "deleted",
        password_hash: "hashed_password",
      });

      await expect(
        authService.login({
          email: "user@gmail.com",
          password: "123456",
        }),
      ).rejects.toThrow("Tài khoản đã bị xóa");

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(signAccessToken).not.toHaveBeenCalled();
    });
  });

  describe("getMe", () => {
    it("trả về thông tin user nếu user tồn tại", async () => {
      authRepository.findById.mockResolvedValue({
        id: 1,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        avatar_url: null,
        role: "USER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
        updated_at: new Date("2099-01-02T00:00:00"),
      });

      const result = await authService.getMe(1);

      expect(authRepository.findById).toHaveBeenCalledWith(1);

      expect(result).toEqual({
        id: 1,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456",
        avatar_url: null,
        role: "USER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
        updated_at: new Date("2099-01-02T00:00:00"),
      });
    });

    it("báo lỗi nếu không tìm thấy user", async () => {
      authRepository.findById.mockResolvedValue(null);

      await expect(authService.getMe(999)).rejects.toThrow(
        "Không tìm thấy người dùng",
      );
    });
  });

  describe("changePassword", () => {
    it("đổi mật khẩu thành công nếu oldPassword đúng", async () => {
      authRepository.findFullById.mockResolvedValue({
        id: 1,
        password_hash: "old_hashed_password",
      });

      bcrypt.compare.mockResolvedValue(true);
      bcrypt.hash.mockResolvedValue("new_hashed_password");

      authRepository.updatePassword.mockResolvedValue({
        id: 1,
      });

      const result = await authService.changePassword(1, {
        oldPassword: "123456",
        newPassword: "654321",
      });

      expect(authRepository.findFullById).toHaveBeenCalledWith(1);

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "123456",
        "old_hashed_password",
      );

      expect(bcrypt.hash).toHaveBeenCalledWith("654321", expect.any(Number));

      expect(authRepository.updatePassword).toHaveBeenCalledWith(
        1,
        "new_hashed_password",
      );

      expect(result).toBe(true);
    });

    it("báo lỗi nếu user không tồn tại khi đổi mật khẩu", async () => {
      authRepository.findFullById.mockResolvedValue(null);

      await expect(
        authService.changePassword(999, {
          oldPassword: "123456",
          newPassword: "654321",
        }),
      ).rejects.toThrow("Không tìm thấy người dùng");

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(authRepository.updatePassword).not.toHaveBeenCalled();
    });

    it("báo lỗi nếu mật khẩu cũ không đúng", async () => {
      authRepository.findFullById.mockResolvedValue({
        id: 1,
        password_hash: "old_hashed_password",
      });

      bcrypt.compare.mockResolvedValue(false);

      await expect(
        authService.changePassword(1, {
          oldPassword: "wrong-password",
          newPassword: "654321",
        }),
      ).rejects.toThrow("Mật khẩu cũ không đúng");

      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(authRepository.updatePassword).not.toHaveBeenCalled();
    });
  });
});