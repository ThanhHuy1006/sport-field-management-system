// src/services/payments.service.js
import { prisma } from "./_prisma.js";

// 🔹 Tạo thanh toán
export async function createPayment(userId, data) {
  const booking = await prisma.bookings.findUnique({
    where: { id: Number(data.booking_id) },
  });
  if (!booking || booking.user_id !== userId)
    throw { status: 403, message: "Không thể thanh toán cho đơn này" };

  const payment = await prisma.payments.create({
    data: {
      booking_id: data.booking_id,
      user_id: userId,
      amount: booking.total_price,
      method: data.method || "cash",
      status: "success",
    },
  });

  // Cập nhật booking đã thanh toán
  await prisma.bookings.update({
    where: { id: booking.id },
    data: { status: "paid" },
  });

  return { message: "Thanh toán thành công", payment };
}

// 🔹 Lịch sử thanh toán người dùng
export async function getUserPayments(userId) {
  return await prisma.payments.findMany({
    where: { user_id: userId },
    include: {
      booking: {
        include: { field: { select: { name: true } } },
      },
    },
    orderBy: { created_at: "desc" },
  });
}

// 🔹 Doanh thu của Owner
export async function getOwnerRevenue(ownerId) {
  const payments = await prisma.payments.findMany({
    where: {
      booking: { field: { owner_id: ownerId } },
    },
    include: { booking: true },
  });

  const total = payments.reduce((sum, p) => sum + p.amount, 0);
  return { totalRevenue: total, totalPayments: payments.length, payments };
}
