// src/modules/owners/__tests__/owner.fields.service.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../owner.fields.repository.js", () => ({
  ownerFieldsRepository: {
    findOwnerFields: vi.fn(),
    findOwnerFieldById: vi.fn(),
    createOwnerFieldWithDetails: vi.fn(),
    createOwnerFieldImages: vi.fn(),
    updateOwnerFieldWithDetails: vi.fn(),
    updateOwnerFieldStatus: vi.fn(),
    setOwnerFieldPrimaryImage: vi.fn(),
    deleteOwnerFieldImage: vi.fn(),
  },
}));

vi.mock("../../uploads/uploads.service.js", () => ({
  uploadsService: {
    toPublicFile: vi.fn(),
  },
}));

vi.mock("../../uploads/uploads.constants.js", () => ({
  UPLOAD_FOLDERS: {
    FIELDS: "fields",
  },
}));

import { ownerFieldsService } from "../owner.fields.service.js";
import { ownerFieldsRepository } from "../owner.fields.repository.js";
import { uploadsService } from "../../uploads/uploads.service.js";

describe("owner.fields.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOwnerFields", () => {
    it("trả danh sách sân của owner", async () => {
      ownerFieldsRepository.findOwnerFields.mockResolvedValue([
        {
          id: 1,
          owner_id: 10,
          field_name: "Sân A",
        },
      ]);

      const result = await ownerFieldsService.getOwnerFields(10);

      expect(ownerFieldsRepository.findOwnerFields).toHaveBeenCalledWith(10);
      expect(result).toHaveLength(1);
      expect(result[0].field_name).toBe("Sân A");
    });
  });

  describe("getOwnerFieldDetail", () => {
    it("trả chi tiết sân nếu sân thuộc owner", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
        field_name: "Sân A",
      });

      const result = await ownerFieldsService.getOwnerFieldDetail(10, 1);

      expect(ownerFieldsRepository.findOwnerFieldById).toHaveBeenCalledWith(
        10,
        1,
      );
      expect(result.id).toBe(1);
    });

    it("báo lỗi nếu không tìm thấy sân của owner", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue(null);

      await expect(
        ownerFieldsService.getOwnerFieldDetail(10, 999),
      ).rejects.toThrow("Không tìm thấy sân của owner");
    });
  });

  describe("createOwnerField", () => {
    it("gọi repository để tạo sân với dữ liệu hợp lệ", async () => {
      const payload = {
        fieldData: {
          field_name: "Sân A",
        },
        operatingHours: [],
        pricingRules: [],
        amenities: [],
      };

      ownerFieldsRepository.createOwnerFieldWithDetails.mockResolvedValue({
        id: 1,
        owner_id: 10,
        field_name: "Sân A",
      });

      const result = await ownerFieldsService.createOwnerField(10, payload);

      expect(ownerFieldsRepository.createOwnerFieldWithDetails).toHaveBeenCalledWith(
        10,
        payload,
      );
      expect(result.id).toBe(1);
    });
  });

  describe("uploadOwnerFieldImages", () => {
    it("báo lỗi nếu không tìm thấy sân của owner khi upload ảnh", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue(null);

      await expect(
        ownerFieldsService.uploadOwnerFieldImages(10, 1, [
          {
            filename: "a.png",
          },
        ]),
      ).rejects.toThrow("Không tìm thấy sân của owner");
    });

    it("báo lỗi nếu không upload ảnh nào", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
      });

      await expect(
        ownerFieldsService.uploadOwnerFieldImages(10, 1, []),
      ).rejects.toThrow("Vui lòng upload ít nhất 1 ảnh sân");
    });

    it("upload ảnh sân thành công", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
      });

      uploadsService.toPublicFile
        .mockReturnValueOnce({
          url: "/uploads/fields/a.png",
          storage_path: "fields/a.png",
        })
        .mockReturnValueOnce({
          url: "/uploads/fields/b.png",
          storage_path: "fields/b.png",
        });

      ownerFieldsRepository.createOwnerFieldImages.mockResolvedValue([
        {
          id: 1,
          url: "/uploads/fields/a.png",
        },
        {
          id: 2,
          url: "/uploads/fields/b.png",
        },
      ]);

      const files = [
        {
          filename: "a.png",
        },
        {
          filename: "b.png",
        },
      ];

      const result = await ownerFieldsService.uploadOwnerFieldImages(
        10,
        1,
        files,
      );

      expect(uploadsService.toPublicFile).toHaveBeenCalledTimes(2);
      expect(uploadsService.toPublicFile).toHaveBeenCalledWith(
        files[0],
        "fields",
      );

      expect(ownerFieldsRepository.createOwnerFieldImages).toHaveBeenCalledWith(
        1,
        [
          {
            url: "/uploads/fields/a.png",
            storage_path: "fields/a.png",
          },
          {
            url: "/uploads/fields/b.png",
            storage_path: "fields/b.png",
          },
        ],
      );

      expect(result).toHaveLength(2);
    });
  });

  describe("updateOwnerField", () => {
    it("báo lỗi nếu owner cập nhật sân không thuộc quyền sở hữu", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue(null);

      await expect(
        ownerFieldsService.updateOwnerField(10, 999, {
          fieldData: {
            field_name: "Sân mới",
          },
        }),
      ).rejects.toThrow("Không tìm thấy sân của owner");
    });

    it("cập nhật sân nếu sân thuộc owner", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
      });

      ownerFieldsRepository.updateOwnerFieldWithDetails.mockResolvedValue({
        id: 1,
        field_name: "Sân mới",
      });

      const payload = {
        fieldData: {
          field_name: "Sân mới",
        },
      };

      const result = await ownerFieldsService.updateOwnerField(10, 1, payload);

      expect(ownerFieldsRepository.updateOwnerFieldWithDetails).toHaveBeenCalledWith(
        1,
        payload,
      );
      expect(result.field_name).toBe("Sân mới");
    });
  });

  describe("updateOwnerFieldStatus", () => {
    it("báo lỗi nếu không tìm thấy sân khi cập nhật trạng thái", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue(null);

      await expect(
        ownerFieldsService.updateOwnerFieldStatus(10, 999, {
          status: "inactive",
        }),
      ).rejects.toThrow("Không tìm thấy sân của owner");
    });

    it("báo lỗi nếu trạng thái mới trùng trạng thái hiện tại", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
        status: "inactive",
      });

      await expect(
        ownerFieldsService.updateOwnerFieldStatus(10, 1, {
          status: "inactive",
        }),
      ).rejects.toThrow("Sân đã ở trạng thái này");
    });

    it("cập nhật trạng thái sân thành công", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
        status: "active",
      });

      ownerFieldsRepository.updateOwnerFieldStatus.mockResolvedValue({
        id: 1,
        status: "maintenance",
      });

      const result = await ownerFieldsService.updateOwnerFieldStatus(10, 1, {
        status: "maintenance",
      });

      expect(ownerFieldsRepository.updateOwnerFieldStatus).toHaveBeenCalledWith(
        1,
        "maintenance",
      );
      expect(result.status).toBe("maintenance");
    });
  });

  describe("setOwnerFieldPrimaryImage", () => {
    it("báo lỗi nếu không tìm thấy sân khi đặt ảnh chính", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue(null);

      await expect(
        ownerFieldsService.setOwnerFieldPrimaryImage(10, 1, 2),
      ).rejects.toThrow("Không tìm thấy sân của owner");
    });

    it("báo lỗi nếu không tìm thấy ảnh của sân", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
      });

      ownerFieldsRepository.setOwnerFieldPrimaryImage.mockResolvedValue(null);

      await expect(
        ownerFieldsService.setOwnerFieldPrimaryImage(10, 1, 999),
      ).rejects.toThrow("Không tìm thấy ảnh của sân");
    });

    it("đặt ảnh chính thành công", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
      });

      ownerFieldsRepository.setOwnerFieldPrimaryImage.mockResolvedValue({
        id: 1,
        field_images: [
          {
            id: 2,
            is_primary: true,
          },
        ],
      });

      const result = await ownerFieldsService.setOwnerFieldPrimaryImage(
        10,
        1,
        2,
      );

      expect(ownerFieldsRepository.setOwnerFieldPrimaryImage).toHaveBeenCalledWith(
        1,
        2,
      );
      expect(result.field_images[0].is_primary).toBe(true);
    });
  });

  describe("deleteOwnerFieldImage", () => {
    it("báo lỗi nếu không tìm thấy sân khi xóa ảnh", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue(null);

      await expect(
        ownerFieldsService.deleteOwnerFieldImage(10, 1, 2),
      ).rejects.toThrow("Không tìm thấy sân của owner");
    });

    it("báo lỗi nếu không tìm thấy ảnh trong sân", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
        field_images: [
          {
            id: 1,
            url: "/uploads/fields/a.png",
          },
        ],
      });

      await expect(
        ownerFieldsService.deleteOwnerFieldImage(10, 1, 999),
      ).rejects.toThrow("Không tìm thấy ảnh của sân");
    });

    it("báo lỗi nếu xóa ảnh cuối cùng của sân", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
        field_images: [
          {
            id: 1,
            url: "/uploads/fields/a.png",
          },
        ],
      });

      await expect(
        ownerFieldsService.deleteOwnerFieldImage(10, 1, 1),
      ).rejects.toThrow("Không thể xóa ảnh cuối cùng của sân");
    });

    it("xóa ảnh sân thành công nếu còn nhiều hơn một ảnh", async () => {
      ownerFieldsRepository.findOwnerFieldById.mockResolvedValue({
        id: 1,
        owner_id: 10,
        field_images: [
          {
            id: 1,
            url: "/uploads/fields/a.png",
          },
          {
            id: 2,
            url: "/uploads/fields/b.png",
          },
        ],
      });

      ownerFieldsRepository.deleteOwnerFieldImage.mockResolvedValue({
        id: 1,
        field_images: [
          {
            id: 1,
            url: "/uploads/fields/a.png",
          },
        ],
      });

      const result = await ownerFieldsService.deleteOwnerFieldImage(10, 1, 2);

      expect(ownerFieldsRepository.deleteOwnerFieldImage).toHaveBeenCalledWith(
        1,
        2,
      );
      expect(result.field_images).toHaveLength(1);
    });
  });
});