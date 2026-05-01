import { fieldReportsRepository } from "./field-reports.repository.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";
import {
  UPLOAD_FOLDERS,
  UPLOAD_PUBLIC_PATH,
} from "../uploads/uploads.constants.js";

function toFieldReportAttachments(files = []) {
  return files.map((file) => ({
    image_url: `${UPLOAD_PUBLIC_PATH}/${UPLOAD_FOLDERS.FIELD_REPORTS}/${file.filename}`,
    file_name: file.originalname,
    mime_type: file.mimetype,
    file_size: file.size,
  }));
}

export const fieldReportsService = {
  async createFieldReport(userId, payload, files = []) {
    const field = await fieldReportsRepository.findFieldById(payload.field_id);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    if (payload.booking_id) {
      const booking = await fieldReportsRepository.findBookingForReport(
        userId,
        payload.booking_id,
        payload.field_id
      );

      if (!booking) {
        throw new ForbiddenError(
          "Booking không tồn tại hoặc không thuộc về bạn"
        );
      }
    }

    const existed =
      await fieldReportsRepository.findOpenReportByUserFieldReason(
        userId,
        payload.field_id,
        payload.reason
      );

    if (existed) {
      throw new ConflictError(
        "Bạn đã gửi báo cáo tương tự cho sân này và đang chờ xử lý"
      );
    }

    return fieldReportsRepository.createFieldReport({
      reporter_id: userId,
      field_id: payload.field_id,
      booking_id: payload.booking_id,
      reason: payload.reason,
      description: payload.description,
      status: "PENDING",
      attachments: toFieldReportAttachments(files),
    });
  },

  getAdminFieldReports(query) {
    return fieldReportsRepository.findAdminFieldReports(query);
  },

  async getAdminFieldReportDetail(reportId) {
    const report = await fieldReportsRepository.findFieldReportById(reportId);

    if (!report) {
      throw new NotFoundError("Không tìm thấy báo cáo sân");
    }

    return report;
  },

  async updateAdminFieldReportStatus(adminId, reportId, payload) {
    const report = await fieldReportsRepository.findFieldReportById(reportId);

    if (!report) {
      throw new NotFoundError("Không tìm thấy báo cáo sân");
    }

    const data = {
      status: payload.status,
      admin_note: payload.admin_note,
      updated_at: new Date(),
    };

    if (payload.status === "REVIEWING") {
      data.handled_by = adminId;
    }

    if (["RESOLVED", "REJECTED"].includes(payload.status)) {
      data.handled_by = adminId;
      data.handled_at = new Date();
    }

    return fieldReportsRepository.processFieldReportStatus(reportId, data, {
      hide_field: payload.hide_field,
    });
  },
};