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

function buildReviewOrderBy(sort) {
  switch (sort) {
    case "oldest":
      return { created_at: "asc" };
    case "rating_desc":
      return { rating: "desc" };
    case "rating_asc":
      return { rating: "asc" };
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

  async findPublicFieldOwnerInfo(fieldId) {
    const field = await prisma.fields.findFirst({
      where: {
        id: fieldId,
        status: FIELD_STATUS.ACTIVE,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar_url: true,
            created_at: true,
            owner_profiles_owner_profiles_user_idTousers: {
              select: {
                business_name: true,
                status: true,
                approved_at: true,
              },
            },
          },
        },
      },
    });

    if (!field) return null;

    const owner = field.users;
    const profile = owner?.owner_profiles_owner_profiles_user_idTousers;

    return {
      user_id: owner?.id ?? null,
      display_name: profile?.business_name || owner?.name || "Chủ sân",
      email: owner?.email ?? null,
      phone: owner?.phone ?? null,
      avatar_url: owner?.avatar_url ?? null,
      joined_at: owner?.created_at ?? null,
      verified: profile?.status === "approved",
      approved_at: profile?.approved_at ?? null,
    };
   
  },

  async findPublicFieldReviews(fieldId, filters) {
    const { page, limit, rating, sort } = filters;

    const where = {
      field_id: fieldId,
      visible: true,
      ...(rating ? { rating } : {}),
    };

    const [items, total, breakdown] = await Promise.all([
      prisma.reviews.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: buildReviewOrderBy(sort),
        include: {
          users: {
            select: {
              id: true,
              name: true,
              avatar_url: true,
            },
          },
        },
      }),
      prisma.reviews.count({ where }),
      prisma.reviews.groupBy({
        by: ["rating"],
        where: {
          field_id: fieldId,
          visible: true,
        },
        _count: {
          rating: true,
        },
      }),
    ]);

    const totalReviews = breakdown.reduce(
      (sum, item) => sum + item._count.rating,
      0
    );

    const totalScore = breakdown.reduce(
      (sum, item) => sum + (item.rating || 0) * item._count.rating,
      0
    );

    const ratingBreakdown = breakdown.reduce((acc, item) => {
      acc[item.rating || 0] = item._count.rating;
      return acc;
    }, {});

    return {
      items,
      total,
      summary: {
        averageRating:
          totalReviews > 0
            ? Number((totalScore / totalReviews).toFixed(1))
            : 0,
        totalReviews,
        ratingBreakdown,
      },
    };
  },
};