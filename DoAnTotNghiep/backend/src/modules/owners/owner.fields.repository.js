import prisma from "../../config/prisma.js";

export const ownerFieldsRepository = {
  findOwnerFields(ownerId) {
    return prisma.fields.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: "desc" },
      include: {
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
        },
      },
    });
  },

  findOwnerFieldById(ownerId, fieldId) {
    return prisma.fields.findFirst({
      where: {
        id: fieldId,
        owner_id: ownerId,
      },
      include: {
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
        },
      },
    });
  },

  createOwnerField(ownerId, data) {
    return prisma.fields.create({
      data: {
        owner_id: ownerId,
        ...data,
      },
      include: {
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
        },
      },
    });
  },

  updateOwnerField(fieldId, data) {
    return prisma.fields.update({
      where: { id: fieldId },
      data,
      include: {
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
        },
      },
    });
  },

  updateOwnerFieldStatus(fieldId, status) {
    return prisma.fields.update({
      where: { id: fieldId },
      data: { status },
      include: {
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
        },
      },
    });
  },
};