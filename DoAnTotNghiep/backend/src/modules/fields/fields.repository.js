import prisma from "../../config/prisma.js";
import { FIELD_STATUS } from "../../config/constant.js";

export const fieldsRepository = {
  async findPublicFields(filters) {
    const { page, limit, keyword, sport_type, minPrice, maxPrice } = filters;

    const where = {
      status: FIELD_STATUS.ACTIVE,
    };

    if (keyword) {
      where.OR = [
        { field_name: { contains: keyword } },
        { address: { contains: keyword } },
        { sport_type: { contains: keyword } },
      ];
    }

    if (sport_type) {
      where.sport_type = sport_type;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.base_price_per_hour = {};
      if (minPrice !== undefined) {
        where.base_price_per_hour.gte = minPrice;
      }
      if (maxPrice !== undefined) {
        where.base_price_per_hour.lte = maxPrice;
      }
    }

    const [items, total] = await Promise.all([
      prisma.fields.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { created_at: "desc" },
        include: {
          field_images: {
            orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
          },
        },
      }),
      prisma.fields.count({ where }),
    ]);

    return { items, total };
  },

  findPublicFieldById(fieldId) {
    return prisma.fields.findFirst({
      where: {
        id: fieldId,
        status: FIELD_STATUS.ACTIVE,
      },
      include: {
        field_images: {
          orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
        },
        field_facilities: {
          include: {
            facilities: true,
          },
        },
      },
    });
  },
};