//todo
import { usersRepository } from "./users.repository.js";
import { NotFoundError } from "../../core/errors/index.js";

export const usersService = {
  async getMe(userId) {
    const user = await usersRepository.findById(userId);

    if (!user) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    return user;
  },

  async updateMe(userId, payload) {
    const existingUser = await usersRepository.findById(userId);

    if (!existingUser) {
      throw new NotFoundError("Không tìm thấy người dùng");
    }

    return usersRepository.updateById(userId, payload);
  },
};