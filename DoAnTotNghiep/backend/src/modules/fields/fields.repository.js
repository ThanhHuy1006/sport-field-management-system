import prisma from "../../config/prisma.js";

export const fieldsRepository = {
  async findPublicFields(filters) {
    const { page, limit, keyword, sport_type, minPrice, maxPrice } = filters;

    const where = {
      status: "active", // nếu enum schema của anh là ACTIVE thì đổi lại cho khớp
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
        status: "active", // sửa lại nếu enum của anh khác
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

  findFieldImages(fieldId) {
    return prisma.field_images.findMany({
      where: { field_id: fieldId },
      orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
    });
  },
};