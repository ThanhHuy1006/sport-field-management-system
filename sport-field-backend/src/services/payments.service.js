
import { prisma } from './_prisma.js';

export async function createPayment(user, { bookingId, amount, provider = 'mock' }) {
  // You can integrate VNPay/MoMo here. For now we create a pending record.
  return prisma.payment.create({
    data: {
      bookingId,
      userId: user.id,
      amount,
      currency: 'VND',
      provider,
      status: 'PENDING'
    }
  });
}

export async function getPayment(id, user) {
  const p = await prisma.payment.findUnique({ where: { id } });
  if (!p) throw { status: 404, message: 'Not found' };
  if (user.role === 'user' && p.userId !== user.id) throw { status: 403, message: 'Forbidden' };
  return p;
}

export async function webhook(payload) {
  // Handle provider callback to update payment status
  // Example payload: { paymentId, status }
  if (!payload?.paymentId) return;
  await prisma.payment.update({
    where: { id: payload.paymentId },
    data: { status: payload.status || 'SUCCESS' }
  });
}
