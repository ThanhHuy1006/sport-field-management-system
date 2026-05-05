// src/modules/auth/__tests__/auth.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateRegisterPayload,
  validateLoginPayload,
  validateChangePasswordPayload,
} from "../auth.validator.js";

describe("auth.validator", () => {
  describe("validateRegisterPayload", () => {
    it("trả về dữ liệu đã chuẩn hóa khi register payload hợp lệ", () => {
      const result = validateRegisterPayload({
        name: " Nguyễn Văn A ",
        email: " USER@GMAIL.COM ",
        password: "123456",
        phone: " 0909123456 ",
      });

      expect(result).toEqual({
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        password: "123456",
        phone: "0909123456",
      });
    });

    it("trả phone null nếu không truyền phone", () => {
      const result = validateRegisterPayload({
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        password: "123456",
      });

      expect(result.phone).toBeNull();
    });

    it("báo lỗi nếu thiếu name", () => {
      expect(() => {
        validateRegisterPayload({
          email: "user@gmail.com",
          password: "123456",
        });
      }).toThrow("name là bắt buộc");
    });

    it("báo lỗi nếu thiếu email", () => {
      expect(() => {
        validateRegisterPayload({
          name: "Nguyễn Văn A",
          password: "123456",
        });
      }).toThrow("email là bắt buộc");
    });

    it("báo lỗi nếu email không hợp lệ", () => {
      expect(() => {
        validateRegisterPayload({
          name: "Nguyễn Văn A",
          email: "email-sai",
          password: "123456",
        });
      }).toThrow("email không hợp lệ");
    });

    it("báo lỗi nếu thiếu password", () => {
      expect(() => {
        validateRegisterPayload({
          name: "Nguyễn Văn A",
          email: "user@gmail.com",
        });
      }).toThrow("password là bắt buộc");
    });

    it("báo lỗi nếu password dưới 6 ký tự", () => {
      expect(() => {
        validateRegisterPayload({
          name: "Nguyễn Văn A",
          email: "user@gmail.com",
          password: "123",
        });
      }).toThrow("password phải có ít nhất 6 ký tự");
    });
  });

  describe("validateLoginPayload", () => {
    it("trả về email lowercase khi login payload hợp lệ", () => {
      const result = validateLoginPayload({
        email: " USER@GMAIL.COM ",
        password: "123456",
      });

      expect(result).toEqual({
        email: "user@gmail.com",
        password: "123456",
      });
    });

    it("báo lỗi nếu thiếu email khi login", () => {
      expect(() => {
        validateLoginPayload({
          password: "123456",
        });
      }).toThrow("email là bắt buộc");
    });

    it("báo lỗi nếu thiếu password khi login", () => {
      expect(() => {
        validateLoginPayload({
          email: "user@gmail.com",
        });
      }).toThrow("password là bắt buộc");
    });
  });

  describe("validateChangePasswordPayload", () => {
    it("trả về payload đổi mật khẩu hợp lệ", () => {
      const result = validateChangePasswordPayload({
        oldPassword: "123456",
        newPassword: "654321",
      });

      expect(result).toEqual({
        oldPassword: "123456",
        newPassword: "654321",
      });
    });

    it("báo lỗi nếu thiếu oldPassword", () => {
      expect(() => {
        validateChangePasswordPayload({
          newPassword: "654321",
        });
      }).toThrow("oldPassword và newPassword là bắt buộc");
    });

    it("báo lỗi nếu thiếu newPassword", () => {
      expect(() => {
        validateChangePasswordPayload({
          oldPassword: "123456",
        });
      }).toThrow("oldPassword và newPassword là bắt buộc");
    });

    it("báo lỗi nếu newPassword dưới 6 ký tự", () => {
      expect(() => {
        validateChangePasswordPayload({
          oldPassword: "123456",
          newPassword: "123",
        });
      }).toThrow("newPassword phải có ít nhất 6 ký tự");
    });

    it("báo lỗi nếu newPassword trùng oldPassword", () => {
      expect(() => {
        validateChangePasswordPayload({
          oldPassword: "123456",
          newPassword: "123456",
        });
      }).toThrow("newPassword phải khác oldPassword");
    });
  });
});