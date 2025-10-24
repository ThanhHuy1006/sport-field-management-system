// src/services/bookings.service.js
import { prisma } from "./_prisma.js";

// 🔹 User đặt sân
export async function createBooking(userId, data) {
  const field = await prisma.fields.findUnique({ where: { id: Number(data.field_id) } });
  if (!field || field.status !== "approved") throw { status: 400, message: "Sân không khả dụng" };

  const total_price = field.price_per_hour * data.duration;

  const booking = await prisma.bookings.create({
    data: {
      user_id: userId,
      field_id: data.field_id,
      start_time: new Date(data.start_time),
      end_time: new Date(data.end_time),
      duration: data.duration,
      total_price,
      status: "pending",
    },
  });

  return { message: "Đặt sân thành công", booking };
}

// 🔹 User xem lịch sử đặt sân
export async function getUserBookings(userId) {
  return await prisma.bookings.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    include: {
      field: { select: { name: true, location: true } },
    },
  });
}

// 🔹 Owner xem booking sân của họ
export async function getOwnerBookings(ownerId) {
  return await prisma.bookings.findMany({
    where: {
      field: { owner_id: ownerId },
    },
    orderBy: { created_at: "desc" },
    include: {
      field: { select: { name: true } },
      user: { select: { name: true, email: true } },
    },
  });
}

// 🔹 Cập nhật trạng thái booking (Owner)
export async function updateBookingStatus(bookingId, ownerId, status) {
  const booking = await prisma.bookings.findUnique({
    where: { id: Number(bookingId) },
    include: { field: true },
  });

  if (!booking || booking.field.owner_id !== ownerId)
    throw { status: 403, message: "Không có quyền cập nhật đơn này" };

  const updated = await prisma.bookings.update({
    where: { id: Number(bookingId) },
    data: { status },
  });
  return { message: `Đơn đặt sân đã được ${status}`, booking: updated };
}
