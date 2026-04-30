///todo
import prisma from "../../config/prisma.js";

const userSafeSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatar_url: true,
  role: true,
  status: true,
  created_at: true,
  updated_at: true,
};

export const usersRepository = {
  findById(userId) {
    return prisma.users.findUnique({
      where: { id: userId },
      select: userSafeSelect,
    });
  },

  updateById(userId, data) {
    return prisma.users.update({
      where: { id: userId },
      data: {
        ...data,
        updated_at: new Date(),
      },
      select: userSafeSelect,
    });
  },
};