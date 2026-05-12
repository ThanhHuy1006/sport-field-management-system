import { Readable } from "stream";
import { cloudinary } from "../../config/cloudinary.config.js";

function uploadBufferToCloudinary(file, folderName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `sport-field-management/${folderName}`,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }

        return resolve({
          url: result.secure_url,
          storage_path: result.public_id,
          original_name: file.originalname,
          mime_type: file.mimetype,
          size_bytes: file.size,
        });
      }
    );

    Readable.from(file.buffer).pipe(uploadStream);
  });
}

export const uploadsService = {
  async toPublicFile(file, folderName) {
    if (!file) {
      throw new Error("Không có file để upload");
    }

    if (!file.buffer) {
      throw new Error(
        "File không tồn tại trong bộ nhớ. Kiểm tra multer.memoryStorage()"
      );
    }

    return uploadBufferToCloudinary(file, folderName);
  },

  async toPublicFiles(files = [], folderName) {
    return Promise.all(files.map((file) => this.toPublicFile(file, folderName)));
  },

  async deletePhysicalFile(storagePath) {
    if (!storagePath) return;

    await cloudinary.uploader.destroy(storagePath, {
      resource_type: "image",
    });
  },

  getUploadRootDir() {
    return "cloudinary";
  },

  getUploadRootPath() {
    return "https://res.cloudinary.com";
  },
};