
import { prisma } from './_prisma.js';

export async function createBooking(user, { fieldId, startTime, endTime, notes }) {
  // basic overlap check (simplified — adjust to your schema)
  const overlaps = await prisma.booking.findFirst({
    where: {
      fieldId,
      OR: [
        { startTime: { lt: new Date(endTime) }, endTime: { gt: new Date(startTime) } },
      ]
    }
  });
  if (overlaps) throw { status: 409, message: 'Time slot already booked' };

  return prisma.booking.create({
    data: {
      fieldId,
      userId: user.id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      status: 'PENDING',
      notes
    }
  });
}

export async function getMyBookings(userId) {
  return prisma.booking.findMany({
    where: { userId },
    orderBy: { startTime: 'desc' },
    include: { field: true }
  });
}

export async function getBooking(id, user) {
  const b = await prisma.booking.findUnique({ where: { id }, include: { field: true } });
  if (!b) throw { status: 404, message: 'Not found' };
  if (user.role === 'user' && b.userId !== user.id) throw { status: 403, message: 'Forbidden' };
  return b;
}

export async function updateStatus(id, status, user) {
  const b = await prisma.booking.findUnique({ where: { id }, include: { field: true } });
  if (!b) throw { status: 404, message: 'Not found' };
  if (user.role !== 'admin' && b.field.ownerId !== user.id) throw { status: 403, message: 'Forbidden' };
  return prisma.booking.update({ where: { id }, data: { status } });
}

export async function cancelBooking(id, user) {
  const b = await prisma.booking.findUnique({ where: { id } });
  if (!b) throw { status: 404, message: 'Not found' };
  if (user.role === 'user' && b.userId !== user.id) throw { status: 403, message: 'Forbidden' };
  return prisma.booking.update({ where: { id }, data: { status: 'CANCELED' } });
}
