import fs from "fs";
import path from "path";
import multer from "multer";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function createStorage(folderName) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const targetDir = path.join(UPLOAD_ROOT, folderName);
      ensureDir(targetDir);
      cb(null, targetDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname || "");
      const baseName = path
        .basename(file.originalname || "file", ext)
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .toLowerCase();

      const uniqueName = `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}-${baseName}${ext}`;

      cb(null, uniqueName);
    },
  });
}

function imageFileFilter(req, file, cb) {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp"];

  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(
      new Error("Chỉ cho phép upload file ảnh jpg, png hoặc webp"),
      false
    );
  }

  cb(null, true);
}

export function createUploader(folderName, options = {}) {
  const {
    maxFileSize = 5 * 1024 * 1024, // 5MB
    fileFilter = imageFileFilter,
  } = options;

  return multer({
    storage: createStorage(folderName),
    fileFilter,
    limits: {
      fileSize: maxFileSize,
    },
  });
}

// Upload ảnh sân
export const fieldImageUpload = createUploader("fields");

// Upload avatar user
export const avatarUpload = createUploader("avatars");

// Upload ảnh review
export const reviewImageUpload = createUploader("reviews");