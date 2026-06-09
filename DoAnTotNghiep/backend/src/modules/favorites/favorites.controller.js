import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse, createdResponse } from "../../core/utils/response.js";
import { favoritesService } from "./favorites.service.js";
import { toFavoriteFieldItem } from "./favorites.mapper.js";

export const favoritesController = {
  getMyFavorites: asyncHandler(async (req, res) => {
    const query = req.validated?.query ?? req.query;
    const result = await favoritesService.getMyFavorites(req.user, query);

    return successResponse(
      res,
      {
        items: result.items.map(toFavoriteFieldItem).filter(Boolean),
        pagination: result.pagination,
      },
      "Lấy danh sách sân yêu thích thành công",
    );
  }),

  checkFavorite: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const result = await favoritesService.checkFavorite(req.user, fieldId);

    return successResponse(res, result, "Kiểm tra yêu thích thành công");
  }),

  addFavorite: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const item = await favoritesService.addFavorite(req.user, fieldId);

    return createdResponse(
      res,
      toFavoriteFieldItem(item),
      "Thêm sân vào yêu thích thành công",
    );
  }),

  removeFavorite: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const result = await favoritesService.removeFavorite(req.user, fieldId);

    return successResponse(res, result, "Bỏ sân khỏi yêu thích thành công");
  }),
};
