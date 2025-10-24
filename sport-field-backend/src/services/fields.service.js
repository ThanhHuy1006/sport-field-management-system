
import { prisma } from './_prisma.js';

export async function listFields(query) {
  const where = {};
  if (query.q) where.name = { contains: query.q };
  if (query.sport) where.sport = { equals: query.sport };
  return prisma.field.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getField(id) {
  return prisma.field.findUnique({
    where: { id },
    include: { reviews: true },
  });
}

export async function createField(user, payload) {
  if (user.role !== 'owner' && user.role !== 'admin') throw { status: 403, message: 'Forbidden' };
  return prisma.field.create({
    data: {
      name: payload.name,
      location: payload.location,
      price: payload.price,
      sport: payload.sport,
      ownerId: user.id
    }
  });
}

export async function updateField(user, id, payload) {
  const field = await prisma.field.findUnique({ where: { id } });
  if (!field) throw { status: 404, message: 'Not found' };
  if (user.role !== 'admin' && field.ownerId !== user.id) throw { status: 403, message: 'Forbidden' };
  return prisma.field.update({
    where: { id },
    data: {
      name: payload.name,
      location: payload.location,
      price: payload.price,
      sport: payload.sport,
    }
  });
}

export async function deleteField(user, id) {
  const field = await prisma.field.findUnique({ where: { id } });
  if (!field) throw { status: 404, message: 'Not found' };
  if (user.role !== 'admin' && field.ownerId !== user.id) throw { status: 403, message: 'Forbidden' };
  await prisma.field.delete({ where: { id } });
  return { id };
}
