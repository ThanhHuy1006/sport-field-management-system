import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";
import {
  validateRegisterPayload,
  validateLoginPayload,
  validateChangePasswordPayload,
} from "./auth.validator.js";

function getJwtSecret() {
  return env.JWT_SECRET || process.env.JWT_SECRET || process.env.JWT_ACCESS_SECRET;
}

function signToken(user) {
  const secret = getJwtSecret();

  if (!secret) {
    throw new Error("JWT secret chưa được cấu hình");
  }

  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    secret,
    { expiresIn: env.JWT_EXPIRES_IN || "7d" }
  );
}

export const authService = {
  async register(payload) {
    const valid = validateRegisterPayload(payload);

    const existingUser = await authRepository.findByEmail(valid.email);
    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }

    const password_hash = await bcrypt.hash(valid.password, 10);

    const user = await authRepository.createUser({
      name: valid.name,
      email: valid.email,
      phone: valid.phone,
      password_hash,
      role: "USER",
      status: "active",
    });

    const token = signToken(user);

    return { user, token };
  },

  async login(payload) {
    const valid = validateLoginPayload(payload);

    const user = await authRepository.findByEmail(valid.email);
    if (!user) {
      throw new Error("Sai email hoặc mật khẩu");
    }

    if (user.status === "locked" || user.status === "deleted") {
      throw new Error("Tài khoản đã bị khóa hoặc không còn hoạt động");
    }

    const isMatch = await bcrypt.compare(valid.password, user.password_hash);
    if (!isMatch) {
      throw new Error("Sai email hoặc mật khẩu");
    }

    const token = signToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar_url: user.avatar_url,
        role: user.role,
        status: user.status,
      },
    };
  },

  async getMe(userId) {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    return user;
  },

  async changePassword(userId, payload) {
    const valid = validateChangePasswordPayload(payload);

    const user = await authRepository.findFullById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    const isMatch = await bcrypt.compare(valid.oldPassword, user.password_hash);
    if (!isMatch) {
      throw new Error("Mật khẩu cũ không đúng");
    }

    const password_hash = await bcrypt.hash(valid.newPassword, 10);
    await authRepository.updatePassword(userId, password_hash);

    return true;
  },
};