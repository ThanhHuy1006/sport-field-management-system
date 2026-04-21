import { successResponse } from "../../core/utils/response.js";
import { fieldsService } from "./fields.service.js";
import {
  toFieldListItem,
  toFieldDetail,
  toFieldImageList,
  toFieldOwnerInfo,
  toFieldReviewListItem,
} from "./fields.mapper.js";

export const fieldsController = {
  async getPublicFields(req, res, next) {
    try {
      const query = req.validated?.query ?? req.query;
      const result = await fieldsService.getPublicFields(query);

      return successResponse(
        res,
        {
          items: result.items.map(toFieldListItem),
          pagination: result.pagination,
        },
        "Lấy danh sách sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getPublicFieldDetail(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const field = await fieldsService.getPublicFieldDetail(fieldId);

      return successResponse(
        res,
        toFieldDetail(field),
        "Lấy chi tiết sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getPublicFieldImages(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const images = await fieldsService.getPublicFieldImages(fieldId);

      return successResponse(
        res,
        toFieldImageList(images),
        "Lấy ảnh sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getPublicFieldOwnerInfo(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const ownerInfo = await fieldsService.getPublicFieldOwnerInfo(fieldId);

      return successResponse(
        res,
        toFieldOwnerInfo(ownerInfo),
        "Lấy thông tin chủ sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getPublicFieldReviews(req, res, next) {
    try {
      const { fieldId } = req.validated?.params ?? req.params;
      const query = req.validated?.query ?? req.query;

      const result = await fieldsService.getPublicFieldReviews(fieldId, query);

      return successResponse(
        res,
        {
          items: result.items.map(toFieldReviewListItem),
          pagination: result.pagination,
          summary: result.summary,
        },
        "Lấy danh sách đánh giá sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};