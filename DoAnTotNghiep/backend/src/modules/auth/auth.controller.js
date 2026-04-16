import { authService } from "./auth.service.js";
import { successResponse } from "../../core/utils/response.js";
import { asyncHandler } from "../../core/utils/asyncHandler.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const result = await authService.register(req.body);
    return successResponse(res, result, "Đăng ký thành công", 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login(req.body);
    return successResponse(res, result, "Đăng nhập thành công");
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, user, "Lấy thông tin cá nhân thành công");
  }),

  changePassword: asyncHandler(async (req, res) => {
    await authService.changePassword(req.user.id, req.body);
    return successResponse(res, null, "Đổi mật khẩu thành công");
  }),
};