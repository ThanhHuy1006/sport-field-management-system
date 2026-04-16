import prisma from "../../config/prisma.js";

export const authRepository = {
  findByEmail(email) {
    return prisma.users.findUnique({
      where: { email },
    });
  },

  findById(id) {
    return prisma.users.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
        created_at: true,
        updated_at: true,
      },
    });
  },

  findFullById(id) {
    return prisma.users.findUnique({
      where: { id },
    });
  },

  createUser(data) {
    return prisma.users.create({
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar_url: true,
        role: true,
        status: true,
        created_at: true,
      },
    });
  },

  updatePassword(id, password_hash) {
    return prisma.users.update({
      where: { id },
      data: {
        password_hash,
      },
    });
  },
};