import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.js";
import { authRepository } from "./auth.repository.js";

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      role: user.role,
      email: user.email,
    },
    env.JWT_SECRET,
    { expiresIn: env.JWT_EXPIRES_IN }
  );
}

export const authService = {
  async register(payload) {
    const { name, email, password, phone } = payload;

    if (!name || !email || !password) {
      throw new Error("Name, email và password là bắt buộc");
    }

    const existingUser = await authRepository.findByEmail(email);
    if (existingUser) {
      throw new Error("Email đã tồn tại");
    }

    const password_hash = await bcrypt.hash(password, 10);

    const user = await authRepository.createUser({
      name,
      email,
      phone: phone || null,
      password_hash,
      role: "USER",
      status: "active",
    });

    const token = signToken(user);

    return { user, token };
  },

  async login(payload) {
    const { email, password } = payload;

    if (!email || !password) {
      throw new Error("Email và password là bắt buộc");
    }

    const user = await authRepository.findByEmail(email);
    if (!user) {
      throw new Error("Sai email hoặc mật khẩu");
    }

    if (user.status === "locked" || user.status === "deleted") {
      throw new Error("Tài khoản đã bị khóa hoặc không còn hoạt động");
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
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
    const { oldPassword, newPassword } = payload;

    if (!oldPassword || !newPassword) {
      throw new Error("oldPassword và newPassword là bắt buộc");
    }

    const user = await authRepository.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // findById ở trên không select password_hash, nên gọi lại theo email
    const fullUser = await authRepository.findByEmail(user.email);

    const isMatch = await bcrypt.compare(oldPassword, fullUser.password_hash);
    if (!isMatch) {
      throw new Error("Mật khẩu cũ không đúng");
    }

    const password_hash = await bcrypt.hash(newPassword, 10);
    await authRepository.updatePassword(userId, password_hash);

    return true;
  },
};