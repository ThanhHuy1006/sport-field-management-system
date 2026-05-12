import multer from "multer";
import { ValidationError } from "../../core/errors/index.js";
import {
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_FIELD_IMAGES,
  MAX_FIELD_REPORT_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  UPLOAD_FOLDERS,
} from "./uploads.constants.js";

function createUploadMiddleware({
  folderName,
  fieldName,
  maxFiles = 1,
  allowedMimeTypes,
  maxFileSize,
}) {
  const storage = multer.memoryStorage();

  return multer({
    storage,
    limits: {
      fileSize: maxFileSize,
      files: maxFiles,
    },
    fileFilter: (req, file, cb) => {
      if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(new ValidationError("Định dạng file không được hỗ trợ"));
      }

      file.folderName = folderName;
      cb(null, true);
    },
  }).array(fieldName, maxFiles);
}

export const uploadFieldImagesMiddleware = createUploadMiddleware({
  folderName: UPLOAD_FOLDERS.FIELDS,
  fieldName: "images",
  maxFiles: MAX_FIELD_IMAGES,
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSize: MAX_IMAGE_SIZE_BYTES,
});

export const uploadAvatarMiddleware = createUploadMiddleware({
  folderName: UPLOAD_FOLDERS.AVATARS,
  fieldName: "avatar",
  maxFiles: 1,
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSize: MAX_IMAGE_SIZE_BYTES,
});

export const uploadDocumentsMiddleware = createUploadMiddleware({
  folderName: UPLOAD_FOLDERS.DOCUMENTS,
  fieldName: "documents",
  maxFiles: 5,
  allowedMimeTypes: DOCUMENT_MIME_TYPES,
  maxFileSize: MAX_DOCUMENT_SIZE_BYTES,
});

export const uploadFieldReportImagesMiddleware = createUploadMiddleware({
  folderName: UPLOAD_FOLDERS.FIELD_REPORTS,
  fieldName: "images",
  maxFiles: MAX_FIELD_REPORT_IMAGES,
  allowedMimeTypes: IMAGE_MIME_TYPES,
  maxFileSize: MAX_IMAGE_SIZE_BYTES,
});