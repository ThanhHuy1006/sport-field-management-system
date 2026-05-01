import fs from "fs";
import path from "path";
import multer from "multer";
import { ValidationError } from "../../core/errors/index.js";
import {
  DOCUMENT_MIME_TYPES,
  IMAGE_MIME_TYPES,
  MAX_DOCUMENT_SIZE_BYTES,
  MAX_FIELD_IMAGES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_FIELD_REPORT_IMAGES,
  UPLOAD_FOLDERS,
  UPLOAD_ROOT_DIR,
} from "./uploads.constants.js";

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function getUploadRootPath() {
  if (path.isAbsolute(UPLOAD_ROOT_DIR)) {
    return UPLOAD_ROOT_DIR;
  }

  return path.join(process.cwd(), UPLOAD_ROOT_DIR);
}

function createUploadMiddleware({
  folderName,
  fieldName,
  maxFiles = 1,
  allowedMimeTypes,
  maxFileSize,
}) {
  const destinationDir = path.join(getUploadRootPath(), folderName);

  ensureDir(destinationDir);

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, destinationDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

      cb(null, fileName);
    },
  });

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