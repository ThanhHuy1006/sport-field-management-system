export const UPLOAD_ROOT_DIR = process.env.UPLOAD_DIR || "uploads";

export const UPLOAD_PUBLIC_PATH =
  process.env.UPLOAD_PUBLIC_PATH || "/uploads";

export const UPLOAD_FOLDERS = {
  AVATARS: "avatars",
  FIELDS: "fields",
  DOCUMENTS: "documents",
};

export const IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export const DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const MAX_FIELD_IMAGES = 5;