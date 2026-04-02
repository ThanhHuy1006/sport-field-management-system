import { successResponse } from "../../core/utils/response.js";
import { fieldsService } from "./fields.service.js";
import {
  toFieldListItem,
  toFieldDetail,
  toFieldImageList,
} from "./fields.mapper.js";

export const fieldsController = {
  async getPublicFields(req, res, next) {
    try {
      const result = await fieldsService.getPublicFields(req.query);

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
      const field = await fieldsService.getPublicFieldDetail(req.params.fieldId);

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
      const images = await fieldsService.getPublicFieldImages(req.params.fieldId);

      return successResponse(
        res,
        toFieldImageList(images),
        "Lấy ảnh sân thành công"
      );
    } catch (error) {
      next(error);
    }
  },
};