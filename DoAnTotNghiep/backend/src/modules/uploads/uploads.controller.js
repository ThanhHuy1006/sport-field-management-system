import { ValidationError } from "../../core/errors/index.js";
import { asyncHandler } from "../../core/utils/asyncHandler.js";
import { successResponse } from "../../core/utils/response.js";
import { UPLOAD_FOLDERS } from "./uploads.constants.js";
import { uploadsService } from "./uploads.service.js";

export const uploadsController = {
  uploadFieldImages: asyncHandler(async (req, res) => {
    const files = req.files || [];

    if (files.length === 0) {
      throw new ValidationError("Vui lòng chọn ít nhất 1 ảnh sân");
    }

    const uploadedFiles = uploadsService.toPublicFiles(
      files,
      UPLOAD_FOLDERS.FIELDS
    );

    return successResponse(
      res,
      { files: uploadedFiles },
      "Upload ảnh sân thành công"
    );
  }),

  uploadAvatar: asyncHandler(async (req, res) => {
    const files = req.files || [];

    if (files.length === 0) {
      throw new ValidationError("Vui lòng chọn ảnh đại diện");
    }

    const uploadedFile = uploadsService.toPublicFile(
      files[0],
      UPLOAD_FOLDERS.AVATARS
    );

    return successResponse(
      res,
      { file: uploadedFile },
      "Upload ảnh đại diện thành công"
    );
  }),

  uploadDocuments: asyncHandler(async (req, res) => {
    const files = req.files || [];

    if (files.length === 0) {
      throw new ValidationError("Vui lòng chọn ít nhất 1 tài liệu");
    }

    const uploadedFiles = uploadsService.toPublicFiles(
      files,
      UPLOAD_FOLDERS.DOCUMENTS
    );

    return successResponse(
      res,
      { files: uploadedFiles },
      "Upload tài liệu thành công"
    );
  }),
};