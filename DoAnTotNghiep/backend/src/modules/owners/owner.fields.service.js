import {
  ForbiddenError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";
import { uploadsService } from "../uploads/uploads.service.js";
import { UPLOAD_FOLDERS } from "../uploads/uploads.constants.js";
import { ownerFieldsRepository } from "./owner.fields.repository.js";

export const ownerFieldsService = {
  // Lấy danh sách sân của owner
  async getOwnerFields(ownerId) {
    return ownerFieldsRepository.findOwnerFields(ownerId);
  },

  async getOwnerFieldDetail(ownerId, fieldId) {
    const field = await ownerFieldsRepository.findOwnerFieldById(
      ownerId,
      fieldId,
    );

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return field;
  },

  async createOwnerField(ownerId, payload) {
    return ownerFieldsRepository.createOwnerFieldWithDetails(ownerId, payload);
  },
  async uploadOwnerFieldImages(ownerId, fieldId, files) {
    const field = await ownerFieldsRepository.findOwnerFieldById(
      ownerId,
      fieldId,
    );

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    if (!files || files.length === 0) {
      throw new ValidationError("Vui lòng upload ít nhất 1 ảnh sân");
    }

    // const uploadedFiles = files.map((file) =>
    //   uploadsService.toPublicFile(file, UPLOAD_FOLDERS.FIELDS)
    // );
    const uploadedFiles = await uploadsService.toPublicFiles(
      files,
      UPLOAD_FOLDERS.FIELDS,
    );

    return ownerFieldsRepository.createOwnerFieldImages(fieldId, uploadedFiles);
  },

  // async updateOwnerField(ownerId, fieldId, payload) {
  //   const field = await ownerFieldsRepository.findOwnerFieldById(ownerId, fieldId);

  //   if (!field) {
  //     throw new NotFoundError("Không tìm thấy sân của owner");
  //   }

  //   // return ownerFieldsRepository.updateOwnerField(fieldId, payload);
  //   return ownerFieldsRepository.updateOwnerFieldWithDetails(fieldId, payload);
  // },
  async updateOwnerField(ownerId, fieldId, payload) {
    const field = await ownerFieldsRepository.findOwnerFieldById(
      ownerId,
      fieldId,
    );

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    return ownerFieldsRepository.updateOwnerFieldWithDetails(fieldId, payload);
  },

  async updateOwnerFieldStatus(ownerId, fieldId, payload) {
    const field = await ownerFieldsRepository.findOwnerFieldById(
      ownerId,
      fieldId,
    );

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const nextStatus = payload.status;

    if (field.status === nextStatus) {
      throw new ConflictError("Sân đã ở trạng thái này");
    }

    if (field.status === "pending" && nextStatus === "active") {
      throw new ForbiddenError(
        "Sân đang chờ quản trị viên duyệt, chủ sân không thể tự kích hoạt",
      );
    }

    if (field.status === "hidden" && field.hidden_by_role === "ADMIN") {
      throw new ForbiddenError(
        "Sân đang bị quản trị viên ẩn, chủ sân không thể tự thay đổi trạng thái",
      );
    }

    let updateData;

    if (nextStatus === "hidden") {
      updateData = {
        status: "hidden",
        hidden_by_role: "OWNER",
        hidden_reason: payload.reason || "Chủ sân tự ẩn sân",
        hidden_at: new Date(),
      };
    } else if (nextStatus === "active") {
      updateData = {
        status: "active",
        hidden_by_role: null,
        hidden_reason: null,
        hidden_at: null,
      };
    } else if (nextStatus === "maintenance") {
      updateData = {
        status: "maintenance",
        hidden_by_role: null,
        hidden_reason: null,
        hidden_at: null,
      };
    } else {
      throw new ValidationError("Trạng thái sân không hợp lệ");
    }

    return ownerFieldsRepository.updateOwnerFieldStatus(fieldId, updateData);
  },
  async setOwnerFieldPrimaryImage(ownerId, fieldId, imageId) {
    const field = await ownerFieldsRepository.findOwnerFieldById(
      ownerId,
      fieldId,
    );

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const updatedField = await ownerFieldsRepository.setOwnerFieldPrimaryImage(
      fieldId,
      imageId,
    );

    if (!updatedField) {
      throw new NotFoundError("Không tìm thấy ảnh của sân");
    }

    return updatedField;
  },
  async deleteOwnerFieldImage(ownerId, fieldId, imageId) {
    const field = await ownerFieldsRepository.findOwnerFieldById(
      ownerId,
      fieldId,
    );

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân của owner");
    }

    const images = field.field_images || [];
    const image = images.find((item) => Number(item.id) === Number(imageId));

    if (!image) {
      throw new NotFoundError("Không tìm thấy ảnh của sân");
    }

    if (images.length <= 1) {
      throw new ConflictError("Không thể xóa ảnh cuối cùng của sân");
    }

    const updatedField = await ownerFieldsRepository.deleteOwnerFieldImage(
      fieldId,
      imageId,
    );

    if (!updatedField) {
      throw new NotFoundError("Không tìm thấy ảnh của sân");
    }

    return updatedField;
  },
};
