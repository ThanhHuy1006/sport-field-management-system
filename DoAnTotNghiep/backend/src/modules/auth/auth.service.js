import bcrypt from "bcrypt";
import { authRepository } from "./auth.repository.js";
import { signAccessToken } from "../../config/jwt.js";
import {
  APP_ROLES,
  USER_STATUS,
  SECURITY,
} from "../../config/constant.js";
import {
  AuthError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";

export const authService = {
  async register(payload) {
    const existingUser = await authRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new ConflictError("Email đã tồn tại");
    }

    const password_hash = await bcrypt.hash(
      payload.password,
      SECURITY.BCRYPT_SALT_ROUNDS
    );

    const user = await authRepository.createUser({
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      password_hash,
      role: APP_ROLES.USER,
      status: USER_STATUS.ACTIVE,
    });

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return { user, token };
  },

  async login(payload) {
    const user = await authRepository.findByEmail(payload.email);
    if (!user) {
      throw new AuthError("Sai email hoặc mật khẩu");
    }

    if (user.status === USER_STATUS.DELETED) {
      throw new ForbiddenError("Tài khoản đã bị xóa");
    }

    if (user.status === USER_STATUS.LOCKED) {
      throw new ForbiddenError("Tài khoản đã bị khóa");
    }

    const isMatch = await bcrypt.compare(payload.password, user.password_hash);
    if (!isMatch) {
      throw new AuthError("Sai email hoặc mật khẩu");
    }

    const token = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

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
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    return user;
  },

  async changePassword(userId, payload) {
    const user = await authRepository.findFullById(userId);
    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    const isMatch = await bcrypt.compare(payload.oldPassword, user.password_hash);
    if (!isMatch) {
      throw new AuthError("Mật khẩu cũ không đúng");
    }

    const password_hash = await bcrypt.hash(
      payload.newPassword,
      SECURITY.BCRYPT_SALT_ROUNDS
    );

    await authRepository.updatePassword(userId, password_hash);
    return true;
  },
};