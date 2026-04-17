import { authService } from "./auth.service.js";
import {
  successResponse,
  createdResponse,
} from "../../core/utils/response.js";
import { asyncHandler } from "../../core/utils/asyncHandler.js";

export const authController = {
  register: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;
    const result = await authService.register(payload);
    return createdResponse(res, result, "Đăng ký thành công");
  }),

  login: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;
    const result = await authService.login(payload);
    return successResponse(res, result, "Đăng nhập thành công");
  }),

  me: asyncHandler(async (req, res) => {
    const user = await authService.getMe(req.user.id);
    return successResponse(res, user, "Lấy thông tin cá nhân thành công");
  }),

  changePassword: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;
    await authService.changePassword(req.user.id, payload);
    return successResponse(res, null, "Đổi mật khẩu thành công");
  }),
};