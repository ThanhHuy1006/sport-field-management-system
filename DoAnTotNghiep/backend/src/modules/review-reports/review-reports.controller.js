import {
  createdResponse,
  successResponse,
} from "../../core/utils/response.js";
import { reviewReportsService } from "./review-reports.service.js";
import { toReviewReportResponse } from "./review-reports.mapper.js";

export const reviewReportsController = {
  async createReviewReport(req, res, next) {
    try {
      const payload = req.validated?.body ?? req.body;

      const report = await reviewReportsService.createReviewReport(
        req.user,
        payload,
      );

      return createdResponse(
        res,
        toReviewReportResponse(report),
        "Gửi báo cáo đánh giá thành công",
      );
    } catch (error) {
      next(error);
    }
  },

  async getAdminReviewReports(req, res, next) {
    try {
      const query = req.validated?.query ?? req.query;

      const result = await reviewReportsService.getAdminReviewReports(query);

      return successResponse(
        res,
        {
          items: result.items.map(toReviewReportResponse),
          pagination: result.pagination,
        },
        "Lấy danh sách báo cáo đánh giá thành công",
      );
    } catch (error) {
      next(error);
    }
  },

  async getAdminReviewReportDetail(req, res, next) {
    try {
      const { reportId } = req.validated?.params ?? req.params;

      const report =
        await reviewReportsService.getAdminReviewReportDetail(reportId);

      return successResponse(
        res,
        toReviewReportResponse(report),
        "Lấy chi tiết báo cáo đánh giá thành công",
      );
    } catch (error) {
      next(error);
    }
  },

  async updateAdminReviewReportStatus(req, res, next) {
    try {
      const { reportId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const report = await reviewReportsService.updateAdminReviewReportStatus(
        req.user.id,
        reportId,
        payload,
      );

      return successResponse(
        res,
        toReviewReportResponse(report),
        "Cập nhật trạng thái báo cáo đánh giá thành công",
      );
    } catch (error) {
      next(error);
    }
  },
};