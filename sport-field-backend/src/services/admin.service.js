
import { prisma } from './_prisma.js';

export async function dashboard() {
  const [users, fields, bookings, payments] = await Promise.all([
    prisma.user.count(),
    prisma.field.count(),
    prisma.booking.count(),
    prisma.payment.count(),
  ]);
  return { users, fields, bookings, payments };
}

export async function listUsers() {
  return prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true }
  });
}

export async function updateUserStatus(id, status) {
  // if your schema has status column
  return prisma.user.update({ where: { id }, data: { status } });
}

export async function listFieldsForAdmin() {
  return prisma.field.findMany({});
}

export async function approveField(id) {
  // if your schema has 'approved' column
  return prisma.field.update({ where: { id }, data: { approved: true } });
}
