import { reviewReportsRepository } from "./review-reports.repository.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../core/errors/index.js";

const ALLOWED_REPORT_ROLES = ["USER", "OWNER"];

export const reviewReportsService = {
  async createReviewReport(user, payload) {
    if (!ALLOWED_REPORT_ROLES.includes(user.role)) {
      throw new ForbiddenError("Bạn không có quyền báo cáo đánh giá");
    }

    const review = await reviewReportsRepository.findReviewForReport(
      payload.review_id,
    );

    if (!review) {
      throw new NotFoundError("Không tìm thấy đánh giá");
    }

    if (review.user_id === user.id) {
      throw new ForbiddenError("Bạn không thể báo cáo đánh giá của chính mình");
    }

    if (user.role === "OWNER" && review.fields?.owner_id !== user.id) {
      throw new ForbiddenError(
        "Bạn chỉ được báo cáo đánh giá thuộc sân của mình",
      );
    }

    const existed =
      await reviewReportsRepository.findOpenReportByUserReviewReason(
        user.id,
        payload.review_id,
        payload.reason,
      );

    if (existed) {
      throw new ConflictError(
        "Bạn đã gửi báo cáo tương tự cho đánh giá này và đang chờ xử lý",
      );
    }

    return reviewReportsRepository.createReviewReport({
      reporter_id: user.id,
      review_id: payload.review_id,
      reason: payload.reason,
      description: payload.description,
      status: "PENDING",

      review_rating_snapshot: review.rating,
      review_comment_snapshot: review.comment,
      review_author_id_snapshot: review.user_id,
    });
  },

  getAdminReviewReports(query) {
    return reviewReportsRepository.findAdminReviewReports(query);
  },

  async getAdminReviewReportDetail(reportId) {
    const report = await reviewReportsRepository.findReviewReportById(reportId);

    if (!report) {
      throw new NotFoundError("Không tìm thấy báo cáo đánh giá");
    }

    return report;
  },

  async updateAdminReviewReportStatus(adminId, reportId, payload) {
    const report = await reviewReportsRepository.findReviewReportById(reportId);

    if (!report) {
      throw new NotFoundError("Không tìm thấy báo cáo đánh giá");
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

    return reviewReportsRepository.processReviewReportStatus(reportId, data, {
      hide_review: payload.hide_review,
    });
  },
};