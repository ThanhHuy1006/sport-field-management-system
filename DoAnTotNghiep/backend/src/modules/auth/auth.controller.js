import { authService } from "./auth.service.js";
import { successResponse } from "../../core/utils/response.js";

export const authController = {
  async register(req, res, next) {
    try {
      const result = await authService.register(req.body);
      return successResponse(res, result, "Đăng ký thành công", 201);
    } catch (error) {
      next(error);
    }
  },

  async login(req, res, next) {
    try {
      const result = await authService.login(req.body);
      return successResponse(res, result, "Đăng nhập thành công");
    } catch (error) {
      next(error);
    }
  },

  async me(req, res, next) {
    try {
      const user = await authService.getMe(req.user.id);
      return successResponse(res, user, "Lấy thông tin cá nhân thành công");
    } catch (error) {
      next(error);
    }
  },

  async changePassword(req, res, next) {
    try {
      await authService.changePassword(req.user.id, req.body);
      return successResponse(res, null, "Đổi mật khẩu thành công");
    } catch (error) {
      next(error);
    }
  },
};