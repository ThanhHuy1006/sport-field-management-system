import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse, createdResponse } from "../../core/utils/response.js";
import { toOwnerFieldResponse } from "./owner.fields.mapper.js";
import { ownerFieldsService } from "./owner.fields.service.js";

export const ownerFieldsController = {
  getOwnerFields: asyncHandler(async (req, res) => {
    const items = await ownerFieldsService.getOwnerFields(req.user.id);
    return successResponse(
      res,
      items.map(toOwnerFieldResponse),
      "Lấy danh sách sân của owner thành công"
    );
  }),

  getOwnerFieldDetail: asyncHandler(async (req, res) => {
    const item = await ownerFieldsService.getOwnerFieldDetail(req.user.id, req.params);
    return successResponse(
      res,
      toOwnerFieldResponse(item),
      "Lấy chi tiết sân của owner thành công"
    );
  }),

  createOwnerField: asyncHandler(async (req, res) => {
    const item = await ownerFieldsService.createOwnerField(req.user.id, req.body);
    return createdResponse(
      res,
      toOwnerFieldResponse(item),
      "Tạo sân thành công"
    );
  }),

  updateOwnerField: asyncHandler(async (req, res) => {
    const item = await ownerFieldsService.updateOwnerField(
      req.user.id,
      req.params,
      req.body
    );

    return successResponse(
      res,
      toOwnerFieldResponse(item),
      "Cập nhật sân thành công"
    );
  }),

  updateOwnerFieldStatus: asyncHandler(async (req, res) => {
    const item = await ownerFieldsService.updateOwnerFieldStatus(
      req.user.id,
      req.params,
      req.body
    );

    return successResponse(
      res,
      toOwnerFieldResponse(item),
      "Cập nhật trạng thái sân thành công"
    );
  }),
};