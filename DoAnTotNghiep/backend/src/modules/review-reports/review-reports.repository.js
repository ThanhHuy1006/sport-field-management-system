import prisma from "../../config/prisma.js";

const REVIEW_REPORT_INCLUDE = {
  reporter: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  review: {
    include: {
      users: {
        select: {
          id: true,
          name: true,
          avatar_url: true,
        },
      },
      fields: {
        select: {
          id: true,
          field_name: true,
          owner_id: true,
        },
      },
    },
  },
  admin: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

export const reviewReportsRepository = {
  findReviewForReport(reviewId) {
    return prisma.reviews.findFirst({
      where: {
        id: reviewId,
        visible: true,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            avatar_url: true,
          },
        },
        fields: {
          select: {
            id: true,
            field_name: true,
            owner_id: true,
          },
        },
      },
    });
  },

  findOpenReportByUserReviewReason(userId, reviewId, reason) {
    return prisma.review_reports.findFirst({
      where: {
        reporter_id: userId,
        review_id: reviewId,
        reason,
        status: {
          in: ["PENDING", "REVIEWING"],
        },
      },
      select: {
        id: true,
        status: true,
      },
    });
  },

  createReviewReport(data) {
    return prisma.review_reports.create({
      data,
      include: REVIEW_REPORT_INCLUDE,
    });
  },

  async findAdminReviewReports(query) {
    const where = {};

    if (query.status) where.status = query.status;
    if (query.reason) where.reason = query.reason;

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await Promise.all([
      prisma.review_reports.findMany({
        where,
        skip,
        take,
        orderBy: {
          created_at: "desc",
        },
        include: REVIEW_REPORT_INCLUDE,
      }),
      prisma.review_reports.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        total_pages: Math.ceil(total / query.limit),
      },
    };
  },

  findReviewReportById(reportId) {
    return prisma.review_reports.findUnique({
      where: {
        id: reportId,
      },
      include: REVIEW_REPORT_INCLUDE,
    });
  },

  processReviewReportStatus(reportId, data, options = {}) {
    return prisma.$transaction(async (tx) => {
      const report = await tx.review_reports.update({
        where: {
          id: reportId,
        },
        data,
        include: REVIEW_REPORT_INCLUDE,
      });

      if (options.hide_review) {
        await tx.reviews.update({
          where: {
            id: report.review_id,
          },
          data: {
            visible: false,
          },
        });
      }

      return tx.review_reports.findUnique({
        where: {
          id: report.id,
        },
        include: REVIEW_REPORT_INCLUDE,
      });
    });
  },
};