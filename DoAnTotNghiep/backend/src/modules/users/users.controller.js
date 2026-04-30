///todo
import { successResponse } from "../../core/utils/response.js";
import { usersService } from "./users.service.js";
import { toMeResponse } from "./users.mapper.js";

export const usersController = {
  async getMe(req, res, next) {
    try {
      const user = await usersService.getMe(req.user.id);

      return successResponse(
        res,
        toMeResponse(user),
        "Lấy thông tin cá nhân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async updateMe(req, res, next) {
    try {
      const payload = req.validated?.body ?? req.body;
      const user = await usersService.updateMe(req.user.id, payload);

      return successResponse(
        res,
        toMeResponse(user),
        "Cập nhật thông tin cá nhân thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};