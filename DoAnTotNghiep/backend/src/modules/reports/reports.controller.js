import { successResponse } from "../../core/utils/response.js";
import { reportsService } from "./reports.service.js";
import { toReportsResponse } from "./reports.mapper.js";

export const reportsController = {
  async getOwnerReports(req, res, next) {
    try {
      const query = req.validated?.query ?? req.query;
      const data = await reportsService.getOwnerReports(req.user.id, query);

      return successResponse(
        res,
        toReportsResponse(data),
        "Lấy báo cáo owner thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getAdminReports(req, res, next) {
    try {
      const query = req.validated?.query ?? req.query;
      const data = await reportsService.getAdminReports(query);

      return successResponse(
        res,
        toReportsResponse(data),
        "Lấy báo cáo admin thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};