import prisma from "../../config/prisma.js";

const FIELD_REPORT_INCLUDE = {
  reporter: {
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
    },
  },
  field: {
    select: {
      id: true,
      field_name: true,
      sport_type: true,
      address: true,
      status: true,
      owner_id: true,
    },
  },
  booking: {
    select: {
      id: true,
      status: true,
      start_datetime: true,
      end_datetime: true,
      total_price: true,
      user_id: true,
      field_id: true,
    },
  },
  admin: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  attachments: {
    select: {
      id: true,
      image_url: true,
      file_name: true,
      mime_type: true,
      file_size: true,
      created_at: true,
    },
  },
};

export const fieldReportsRepository = {
  findFieldById(fieldId) {
    return prisma.fields.findUnique({
      where: { id: fieldId },
      select: {
        id: true,
        field_name: true,
        status: true,
      },
    });
  },

  findBookingForReport(userId, bookingId, fieldId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
        field_id: fieldId,
      },
      select: {
        id: true,
        user_id: true,
        field_id: true,
        status: true,
      },
    });
  },

  findOpenReportByUserFieldReason(userId, fieldId, reason) {
    return prisma.field_reports.findFirst({
      where: {
        reporter_id: userId,
        field_id: fieldId,
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

  async createFieldReport(data) {
    const { attachments = [], ...reportData } = data;

    return prisma.$transaction(async (tx) => {
      const report = await tx.field_reports.create({
        data: reportData,
      });

      if (attachments.length > 0) {
        await tx.field_report_attachments.createMany({
          data: attachments.map((item) => ({
            report_id: report.id,
            ...item,
          })),
        });
      }

      return tx.field_reports.findUnique({
        where: { id: report.id },
        include: FIELD_REPORT_INCLUDE,
      });
    });
  },

  async findAdminFieldReports(query) {
    const where = {};

    if (query.status) where.status = query.status;
    if (query.reason) where.reason = query.reason;

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [items, total] = await Promise.all([
      prisma.field_reports.findMany({
        where,
        skip,
        take,
        orderBy: {
          created_at: "desc",
        },
        include: FIELD_REPORT_INCLUDE,
      }),
      prisma.field_reports.count({ where }),
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

  findFieldReportById(reportId) {
    return prisma.field_reports.findUnique({
      where: { id: reportId },
      include: FIELD_REPORT_INCLUDE,
    });
  },

  processFieldReportStatus(reportId, data, options = {}) {
    return prisma.$transaction(async (tx) => {
      const report = await tx.field_reports.update({
        where: { id: reportId },
        data,
        include: FIELD_REPORT_INCLUDE,
      });

      if (options.hide_field) {
        await tx.fields.update({
          where: { id: report.field_id },
          data: {
            status: "hidden",
            updated_at: new Date(),
          },
        });
      }

      return tx.field_reports.findUnique({
        where: { id: report.id },
        include: FIELD_REPORT_INCLUDE,
      });
    });
  },
};