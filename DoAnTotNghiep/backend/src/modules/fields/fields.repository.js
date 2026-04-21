import prisma from "../../config/prisma.js";
import { FIELD_STATUS } from "../../config/constant.js";

function buildOrderBy(sort) {
  switch (sort) {
    case "price_asc":
      return { base_price_per_hour: "asc" };
    case "price_desc":
      return { base_price_per_hour: "desc" };
    case "name":
      return { field_name: "asc" };
    case "rating":
      // tạm fallback, vì sort theo avg reviews bằng Prisma findMany không đẹp
      return { created_at: "desc" };
    case "newest":
    default:
      return { created_at: "desc" };
  }
}

export const fieldsRepository = {
  async findPublicFields(filters) {
    const {
      page,
      limit,
      keyword,
      sport_type,
      district,
      minPrice,
      maxPrice,
      sort,
    } = filters;

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

    if (district) {
      where.district = district;
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
        orderBy: buildOrderBy(sort),
        include: {
          field_images: {
            orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
          },
          operating_hours: true,
          reviews: {
            where: { visible: true },
            select: { rating: true },
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
        operating_hours: true,
        reviews: {
          where: { visible: true },
          select: { rating: true },
        },
      },
    });
  },
};