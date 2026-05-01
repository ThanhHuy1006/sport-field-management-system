import fs from "fs";
import {
  successResponse,
  createdResponse,
} from "../../core/utils/response.js";
import { fieldReportsService } from "./field-reports.service.js";
import { toFieldReportResponse } from "./field-reports.mapper.js";
import { validateCreateFieldReportPayload } from "./field-reports.validator.js";

function cleanupUploadedFiles(files = []) {
  for (const file of files) {
    if (file?.path && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
  }
}

export const fieldReportsController = {
  async createFieldReport(req, res, next) {
    const files = req.files ?? [];

    try {
      const payload = validateCreateFieldReportPayload(req.body);

      const report = await fieldReportsService.createFieldReport(
        req.user.id,
        payload,
        files
      );

      return createdResponse(
        res,
        toFieldReportResponse(report),
        "Gửi báo cáo sân thành công"
      );
    } catch (error) {
      cleanupUploadedFiles(files);
      next(error);
    }
  },

  async getAdminFieldReports(req, res, next) {
    try {
      const query = req.validated?.query ?? req.query;

      const result = await fieldReportsService.getAdminFieldReports(query);

      return successResponse(
        res,
        {
          items: result.items.map(toFieldReportResponse),
          pagination: result.pagination,
        },
        "Lấy danh sách báo cáo sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getAdminFieldReportDetail(req, res, next) {
    try {
      const { reportId } = req.validated?.params ?? req.params;

      const report = await fieldReportsService.getAdminFieldReportDetail(
        reportId
      );

      return successResponse(
        res,
        toFieldReportResponse(report),
        "Lấy chi tiết báo cáo sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async updateAdminFieldReportStatus(req, res, next) {
    try {
      const { reportId } = req.validated?.params ?? req.params;
      const payload = req.validated?.body ?? req.body;

      const report = await fieldReportsService.updateAdminFieldReportStatus(
        req.user.id,
        reportId,
        payload
      );

      return successResponse(
        res,
        toFieldReportResponse(report),
        "Cập nhật trạng thái báo cáo sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};