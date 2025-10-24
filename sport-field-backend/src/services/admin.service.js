// src/services/admin.service.js
import { prisma } from "./_prisma.js";

// 🔹 Lấy danh sách người dùng
export async function listUsers() {
  return await prisma.users.findMany({
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
}

// 🔹 Cập nhật trạng thái user
export async function updateUserStatus(id, status) {
  const updated = await prisma.users.update({
    where: { id: Number(id) },
    data: { status },
  });
  return { message: "Cập nhật trạng thái thành công", user: updated };
}

// 🔹 Lấy danh sách sân để admin duyệt
export async function listFieldsForAdmin() {
  return await prisma.fields.findMany({
    orderBy: { created_at: "desc" },
    include: {
      owner: {
        select: { id: true, name: true, email: true },
      },
    },
  });
}

// 🔹 Duyệt / từ chối sân
export async function approveField(id, status) {
  const updated = await prisma.fields.update({
    where: { id: Number(id) },
    data: { status },
  });
  return { message: `Sân đã được cập nhật trạng thái: ${status}`, field: updated };
}

// 🔹 Dashboard thống kê hệ thống
export async function dashboard() {
  const [totalUsers, totalFields, totalBookings, totalRevenue] = await Promise.all([
    prisma.users.count(),
    prisma.fields.count(),
    prisma.bookings.count(),
    prisma.payments.aggregate({ _sum: { amount: true } }),
  ]);

  return {
    totalUsers,
    totalFields,
    totalBookings,
    totalRevenue: totalRevenue._sum.amount || 0,
  };
}
