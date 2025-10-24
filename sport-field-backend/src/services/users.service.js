import { prisma } from "./_prisma.js";

// Lấy thông tin cá nhân
export async function getProfile(userId) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
      updated_at: true,
    },
  });
  if (!user) throw { status: 404, message: "Không tìm thấy người dùng" };
  return user;
}

// Cập nhật hồ sơ
export async function updateProfile(userId, data) {
  const updated = await prisma.users.update({
    where: { id: userId },
    data: {
      name: data.name,
      email: data.email,
    },
    select: {
      id: true,
      name: true,
      email: true,
      updated_at: true,
    },
  });
  return { message: "Cập nhật thành công", user: updated };
}

// Lấy danh sách người dùng (Admin)
export async function getAllUsers() {
  const users = await prisma.users.findMany({
    orderBy: { created_at: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      created_at: true,
    },
  });
  return users;
}

// Cập nhật trạng thái user (Admin)
export async function updateStatus(id, status) {
  const user = await prisma.users.update({
    where: { id },
    data: { status },
  });
  return { message: `User ${status === "active" ? "được mở khóa" : "đã bị khóa"}`, user };
}
