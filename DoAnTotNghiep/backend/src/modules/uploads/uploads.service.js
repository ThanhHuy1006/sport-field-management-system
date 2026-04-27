import fs from "fs";
import path from "path";
import {
  UPLOAD_PUBLIC_PATH,
  UPLOAD_ROOT_DIR,
} from "./uploads.constants.js";

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function getUploadRootPath() {
  if (path.isAbsolute(UPLOAD_ROOT_DIR)) {
    return UPLOAD_ROOT_DIR;
  }

  return path.join(process.cwd(), UPLOAD_ROOT_DIR);
}

function normalizePublicPath(publicPath) {
  const normalized = normalizePath(publicPath || "/uploads");
  return normalized.startsWith("/") ? normalized : `/${normalized}`;
}

export const uploadsService = {
  toPublicFile(file, folderName) {
    const publicRoot = normalizePublicPath(UPLOAD_PUBLIC_PATH);

    const publicUrl = normalizePath(
      path.posix.join(publicRoot, folderName, file.filename)
    );

    return {
      url: publicUrl,
      storage_path: normalizePath(file.path),
      original_name: file.originalname,
      mime_type: file.mimetype,
      size_bytes: file.size,
    };
  },

  toPublicFiles(files = [], folderName) {
    return files.map((file) => this.toPublicFile(file, folderName));
  },

  deletePhysicalFile(storagePath) {
    if (!storagePath) return;

    const normalizedStoragePath = path.isAbsolute(storagePath)
      ? storagePath
      : path.join(process.cwd(), storagePath);

    if (fs.existsSync(normalizedStoragePath)) {
      fs.unlinkSync(normalizedStoragePath);
    }
  },

  getUploadRootDir() {
    return UPLOAD_ROOT_DIR;
  },

  getUploadRootPath() {
    return getUploadRootPath();
  },
};