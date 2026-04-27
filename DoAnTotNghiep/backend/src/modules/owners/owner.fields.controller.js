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
    const { fieldId } = req.validated?.params ?? req.params;
    const item = await ownerFieldsService.getOwnerFieldDetail(req.user.id, fieldId);

    return successResponse(
      res,
      toOwnerFieldResponse(item),
      "Lấy chi tiết sân của owner thành công"
    );
  }),

  createOwnerField: asyncHandler(async (req, res) => {
    const payload = req.validated?.body ?? req.body;
    const item = await ownerFieldsService.createOwnerField(req.user.id, payload);

    return createdResponse(
      res,
      toOwnerFieldResponse(item),
      "Tạo sân thành công"
    );
  }),

  uploadOwnerFieldImages: asyncHandler(async (req, res) => {
  const { fieldId } = req.validated?.params ?? req.params;

  const item = await ownerFieldsService.uploadOwnerFieldImages(
    req.user.id,
    fieldId,
    req.files
  );

  return successResponse(
    res,
    toOwnerFieldResponse(item),
    "Upload ảnh sân thành công"
  );
}),
  updateOwnerField: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerFieldsService.updateOwnerField(
      req.user.id,
      fieldId,
      payload
    );

    return successResponse(
      res,
      toOwnerFieldResponse(item),
      "Cập nhật sân thành công"
    );
  }),

  updateOwnerFieldStatus: asyncHandler(async (req, res) => {
    const { fieldId } = req.validated?.params ?? req.params;
    const payload = req.validated?.body ?? req.body;

    const item = await ownerFieldsService.updateOwnerFieldStatus(
      req.user.id,
      fieldId,
      payload
    );

    return successResponse(
      res,
      toOwnerFieldResponse(item),
      "Cập nhật trạng thái sân thành công"
    );
  }),
  setOwnerFieldPrimaryImage: asyncHandler(async (req, res) => {
  const { fieldId, imageId } = req.validated?.params ?? req.params;

  const item = await ownerFieldsService.setOwnerFieldPrimaryImage(
    req.user.id,
    fieldId,
    imageId
  );

  return successResponse(
    res,
    toOwnerFieldResponse(item),
    "Đổi ảnh đại diện sân thành công"
  );
}),
};