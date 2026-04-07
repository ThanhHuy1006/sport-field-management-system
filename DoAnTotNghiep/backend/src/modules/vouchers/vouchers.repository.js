import prisma from "../../config/prisma.js";

export const vouchersRepository = {
  findByCode(code) {
    return prisma.vouchers.findFirst({
      where: { code },
    });
  },

  findAvailablePublicOrOwnerVouchers(ownerId) {
    const today = new Date();

    return prisma.vouchers.findMany({
      where: {
        status: "active",
        start_date: { lte: today },
        end_date: { gte: today },
        OR: [
          { owner_id: null },
          ...(ownerId ? [{ owner_id: ownerId }] : []),
        ],
      },
      orderBy: { created_at: "desc" },
    });
  },

  findOwnerVouchers(ownerId) {
    return prisma.vouchers.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: "desc" },
    });
  },

  findOwnerVoucherById(ownerId, voucherId) {
    return prisma.vouchers.findFirst({
      where: {
        id: voucherId,
        owner_id: ownerId,
      },
    });
  },

  createOwnerVoucher(ownerId, createdBy, data) {
    return prisma.vouchers.create({
      data: {
        owner_id: ownerId,
        created_by: createdBy,
        ...data,
      },
    });
  },

  updateOwnerVoucher(voucherId, data) {
    return prisma.vouchers.update({
      where: { id: voucherId },
      data,
    });
  },

  updateOwnerVoucherStatus(voucherId, status) {
    return prisma.vouchers.update({
      where: { id: voucherId },
      data: { status },
    });
  },

  countVoucherUsageTotal(voucherId) {
    return prisma.user_vouchers.count({
      where: { voucher_id: voucherId },
    });
  },

  countVoucherUsageByUser(voucherId, userId) {
    return prisma.user_vouchers.count({
      where: {
        voucher_id: voucherId,
        user_id: userId,
      },
    });
  },
};