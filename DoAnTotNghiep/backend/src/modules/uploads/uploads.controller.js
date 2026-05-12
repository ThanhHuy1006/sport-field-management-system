import { ValidationError } from "../../core/errors/index.js";
import { UPLOAD_FOLDERS } from "./uploads.constants.js";
import { uploadsService } from "./uploads.service.js";

export const uploadsController = {
  async uploadFieldImages(req, res, next) {
    try {
      const files = req.files || [];

      if (!files.length) {
        throw new ValidationError("Vui lòng chọn ít nhất một ảnh sân");
      }

      const uploadedFiles = await uploadsService.toPublicFiles(
        files,
        UPLOAD_FOLDERS.FIELDS
      );

      return res.status(201).json({
        success: true,
        message: "Upload ảnh sân thành công",
        data: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadAvatar(req, res, next) {
    try {
      const files = req.files || [];
      const file = files[0];

      if (!file) {
        throw new ValidationError("Vui lòng chọn ảnh đại diện");
      }

      const uploadedFile = await uploadsService.toPublicFile(
        file,
        UPLOAD_FOLDERS.AVATARS
      );

      return res.status(201).json({
        success: true,
        message: "Upload ảnh đại diện thành công",
        data: uploadedFile,
      });
    } catch (error) {
      next(error);
    }
  },

  async uploadDocuments(req, res, next) {
    try {
      const files = req.files || [];

      if (!files.length) {
        throw new ValidationError("Vui lòng chọn tài liệu");
      }

      const uploadedFiles = await uploadsService.toPublicFiles(
        files,
        UPLOAD_FOLDERS.DOCUMENTS
      );

      return res.status(201).json({
        success: true,
        message: "Upload tài liệu thành công",
        data: uploadedFiles,
      });
    } catch (error) {
      next(error);
    }
  },
};