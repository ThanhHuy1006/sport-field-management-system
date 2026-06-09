import prisma from "../../config/prisma.js";

const favoriteFieldInclude = {
  fields: {
    select: {
      id: true,
      field_name: true,
      address: true,
      district: true,
      ward: true,
      province: true,
      sport_type: true,
      base_price_per_hour: true,
      currency: true,
      status: true,
      field_images: {
        orderBy: [{ is_primary: "desc" }, { order_no: "asc" }, { id: "asc" }],
        take: 1,
        select: {
          id: true,
          url: true,
          is_primary: true,
          order_no: true,
        },
      },
      reviews: {
        where: {
          visible: true,
        },
        select: {
          rating: true,
        },
      },
      _count: {
        select: {
          reviews: {
            where: {
              visible: true,
            },
          },
        },
      },
    },
  },
};

export const favoritesRepository = {
  findFieldById(fieldId) {
    return prisma.fields.findUnique({
      where: { id: fieldId },
      select: {
        id: true,
        status: true,
        field_name: true,
      },
    });
  },

  findFavorite(userId, fieldId) {
    return prisma.favorite_fields.findUnique({
      where: {
        user_id_field_id: {
          user_id: userId,
          field_id: fieldId,
        },
      },
      include: favoriteFieldInclude,
    });
  },

  findMyFavorites(userId, filters) {
    const where = {
      user_id: userId,
      fields: {
        status: "active",
      },
    };

    return Promise.all([
      prisma.favorite_fields.findMany({
        where,
        orderBy: {
          created_at: "desc",
        },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
        include: favoriteFieldInclude,
      }),
      prisma.favorite_fields.count({ where }),
    ]).then(([items, total]) => ({ items, total }));
  },

  createFavorite(userId, fieldId) {
    return prisma.favorite_fields.upsert({
      where: {
        user_id_field_id: {
          user_id: userId,
          field_id: fieldId,
        },
      },
      create: {
        user_id: userId,
        field_id: fieldId,
      },
      update: {},
      include: favoriteFieldInclude,
    });
  },

  deleteFavorite(userId, fieldId) {
    return prisma.favorite_fields.deleteMany({
      where: {
        user_id: userId,
        field_id: fieldId,
      },
    });
  },
};
