// src/modules/owners/__tests__/owner.fields.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateFieldIdParam,
  validateCreateOwnerFieldPayload,
  validateUpdateOwnerFieldPayload,
  validateOwnerFieldStatusPayload,
  validateFieldImageParams,
} from "../owner.fields.validator.js";

const validOperatingHours = [
  { day_of_week: 1, open_time: "06:00", close_time: "22:00" },
  { day_of_week: 2, open_time: "06:00", close_time: "22:00" },
  { day_of_week: 3, open_time: "06:00", close_time: "22:00" },
  { day_of_week: 4, open_time: "06:00", close_time: "22:00" },
  { day_of_week: 5, open_time: "06:00", close_time: "22:00" },
  { day_of_week: 6, open_time: "06:00", close_time: "23:00" },
  { day_of_week: 7, is_closed: true },
];

describe("owner.fields.validator", () => {
  describe("validateFieldIdParam", () => {
    it("trả về fieldId hợp lệ", () => {
      const result = validateFieldIdParam({ fieldId: "10" });

      expect(result).toEqual({ fieldId: 10 });
    });

    it("báo lỗi nếu fieldId không hợp lệ", () => {
      expect(() => {
        validateFieldIdParam({ fieldId: "abc" });
      }).toThrow("fieldId không hợp lệ");
    });

    it("báo lỗi nếu fieldId nhỏ hơn hoặc bằng 0", () => {
      expect(() => {
        validateFieldIdParam({ fieldId: "0" });
      }).toThrow("fieldId không hợp lệ");
    });
  });

  describe("validateCreateOwnerFieldPayload", () => {
    it("chuẩn hóa payload tạo sân hợp lệ", () => {
      const result = validateCreateOwnerFieldPayload({
        field_name: " Sân bóng đá A ",
        sport_type: " Bóng đá ",
        description: " Sân 5 người ",
        address_line: "123 Nguyễn Trãi",
        ward: "Phường 1",
        district: "Quận 1",
        province: "TP.HCM",
        latitude: "10.123",
        longitude: "106.456",
        weekday_price: "100000",
        weekend_price: "150000",
        currency: "vnd",
        min_duration_minutes: "60",
        max_players: "10",
        approval_mode: "auto",
        amenities: ["Wifi", "Bãi xe", "Wifi", ""],
        operating_hours: validOperatingHours,
      });

      expect(result.fieldData).toEqual(
        expect.objectContaining({
          field_name: "Sân bóng đá A",
          sport_type: "Bóng đá",
          description: "Sân 5 người",
          address: "123 Nguyễn Trãi, Phường 1, Quận 1, TP.HCM",
          address_line: "123 Nguyễn Trãi",
          ward: "Phường 1",
          district: "Quận 1",
          province: "TP.HCM",
          latitude: 10.123,
          longitude: 106.456,
          base_price_per_hour: 100000,
          currency: "VND",
          status: "pending",
          approval_mode: "AUTO",
          min_duration_minutes: 60,
          max_players: 10,
        }),
      );

      expect(result.operatingHours).toHaveLength(7);
      expect(result.pricingRules).toHaveLength(2);
      expect(result.pricingRules[0]).toEqual(
        expect.objectContaining({
          day_type: "WEEKDAY",
          price: 100000,
          currency: "VND",
        }),
      );
      expect(result.pricingRules[1]).toEqual(
        expect.objectContaining({
          day_type: "WEEKEND",
          price: 150000,
          currency: "VND",
        }),
      );
      expect(result.amenities).toEqual(["Wifi", "Bãi xe"]);
    });

    it("cho phép truyền address trực tiếp thay vì tách address_line/ward/district/province", () => {
      const result = validateCreateOwnerFieldPayload({
        field_name: "Sân bóng đá A",
        sport_type: "Bóng đá",
        address: "Quận 1, TP.HCM",
        base_price_per_hour: 100000,
        operating_hours: validOperatingHours,
      });

      expect(result.fieldData.address).toBe("Quận 1, TP.HCM");
      expect(result.fieldData.approval_mode).toBe("MANUAL");
      expect(result.fieldData.currency).toBe("VND");
    });

    it("báo lỗi nếu thiếu field_name", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: validOperatingHours,
        });
      }).toThrow("field_name là bắt buộc");
    });

    it("báo lỗi nếu thiếu sport_type", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: validOperatingHours,
        });
      }).toThrow("sport_type là bắt buộc");
    });

    it("báo lỗi nếu thiếu address", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          base_price_per_hour: 100000,
          operating_hours: validOperatingHours,
        });
      }).toThrow("address là bắt buộc");
    });

    it("báo lỗi nếu weekday_price dưới 50,000", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          weekday_price: 40000,
          operating_hours: validOperatingHours,
        });
      }).toThrow("weekday_price tối thiểu 50,000 VND");
    });

    it("báo lỗi nếu weekend_price dưới 50,000", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          weekday_price: 100000,
          weekend_price: 40000,
          operating_hours: validOperatingHours,
        });
      }).toThrow("weekend_price tối thiểu 50,000 VND");
    });

    it("báo lỗi nếu operating_hours không đủ 7 ngày", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: validOperatingHours.slice(0, 6),
        });
      }).toThrow("operating_hours phải có đủ 7 ngày trong tuần");
    });

    it("báo lỗi nếu operating_hours bị trùng ngày", () => {
      const duplicatedDays = [
        ...validOperatingHours.slice(0, 6),
        { day_of_week: 6, open_time: "06:00", close_time: "22:00" },
      ];

      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: duplicatedDays,
        });
      }).toThrow("operating_hours bị trùng ngày 6");
    });

    it("báo lỗi nếu giờ mở cửa không đúng định dạng HH:mm", () => {
      const invalidHours = [
        { day_of_week: 1, open_time: "6:00", close_time: "22:00" },
        ...validOperatingHours.slice(1),
      ];

      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: invalidHours,
        });
      }).toThrow("operating_hours[0].open_time phải có định dạng HH:mm");
    });

    it("báo lỗi nếu giờ mở cửa sau giờ đóng cửa", () => {
      const invalidHours = [
        { day_of_week: 1, open_time: "22:00", close_time: "06:00" },
        ...validOperatingHours.slice(1),
      ];

      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: invalidHours,
        });
      }).toThrow("Ngày 1: giờ mở cửa phải trước giờ đóng cửa");
    });

    it("báo lỗi nếu sân đóng cửa cả 7 ngày", () => {
      const closedAllDays = Array.from({ length: 7 }, (_, index) => ({
        day_of_week: index + 1,
        is_closed: true,
      }));

      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          operating_hours: closedAllDays,
        });
      }).toThrow("Sân phải mở cửa ít nhất 1 ngày trong tuần");
    });

    it("báo lỗi nếu min_duration_minutes không chia hết cho 30", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          min_duration_minutes: 45,
          operating_hours: validOperatingHours,
        });
      }).toThrow("min_duration_minutes phải là số dương và chia hết cho 30");
    });

    it("báo lỗi nếu max_players không hợp lệ", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          max_players: 0,
          operating_hours: validOperatingHours,
        });
      }).toThrow("max_players không hợp lệ");
    });

    it("báo lỗi nếu approval_mode không hợp lệ", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          approval_mode: "INVALID",
          operating_hours: validOperatingHours,
        });
      }).toThrow("approval_mode không hợp lệ");
    });

    it("báo lỗi nếu amenities không phải mảng", () => {
      expect(() => {
        validateCreateOwnerFieldPayload({
          field_name: "Sân A",
          sport_type: "Bóng đá",
          address: "Quận 1",
          base_price_per_hour: 100000,
          amenities: "Wifi",
          operating_hours: validOperatingHours,
        });
      }).toThrow("amenities phải là mảng");
    });
  });

  describe("validateUpdateOwnerFieldPayload", () => {
    it("trả về payload cập nhật hợp lệ", () => {
      const result = validateUpdateOwnerFieldPayload({
        field_name: " Sân mới ",
        sport_type: "Bóng đá",
        description: " Mô tả mới ",
        address_line: "456 Lê Lợi",
        ward: "Phường 2",
        district: "Quận 3",
        province: "TP.HCM",
        latitude: "10.1",
        longitude: "106.1",
        weekday_price: "120000",
        weekend_price: "160000",
        currency: "vnd",
        min_duration_minutes: "90",
        max_players: "12",
        approval_mode: "auto",
        amenities: ["Đèn", "Bãi xe"],
      });

      expect(result.fieldData).toEqual(
        expect.objectContaining({
          field_name: "Sân mới",
          sport_type: "Bóng đá",
          description: "Mô tả mới",
          address: "456 Lê Lợi, Phường 2, Quận 3, TP.HCM",
          latitude: 10.1,
          longitude: 106.1,
          base_price_per_hour: 120000,
          currency: "VND",
          min_duration_minutes: 90,
          max_players: 12,
          approval_mode: "AUTO",
        }),
      );

      expect(result.pricingRules).toHaveLength(2);
      expect(result.amenities).toEqual(["Đèn", "Bãi xe"]);
    });

    it("cho phép cập nhật max_players về null", () => {
      const result = validateUpdateOwnerFieldPayload({
        max_players: null,
      });

      expect(result.fieldData.max_players).toBeNull();
    });

    it("báo lỗi nếu payload cập nhật rỗng", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({});
      }).toThrow("Không có dữ liệu hợp lệ để cập nhật");
    });

    it("báo lỗi nếu field_name rỗng", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          field_name: " ",
        });
      }).toThrow("field_name không hợp lệ");
    });

    it("báo lỗi nếu sport_type rỗng", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          sport_type: " ",
        });
      }).toThrow("sport_type không hợp lệ");
    });

    it("báo lỗi nếu address rỗng", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          address: " ",
        });
      }).toThrow("address không hợp lệ");
    });

    it("báo lỗi nếu latitude không hợp lệ", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          latitude: "abc",
        });
      }).toThrow("latitude không hợp lệ");
    });

    it("báo lỗi nếu weekday_price dưới 50,000", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          weekday_price: 40000,
        });
      }).toThrow("weekday_price tối thiểu 50,000 VND");
    });

    it("báo lỗi nếu weekend_price dưới 50,000", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          weekend_price: 40000,
        });
      }).toThrow("weekend_price tối thiểu 50,000 VND");
    });

    it("báo lỗi nếu min_duration_minutes không hợp lệ", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          min_duration_minutes: 45,
        });
      }).toThrow("min_duration_minutes phải là số dương và chia hết cho 30");
    });

    it("báo lỗi nếu approval_mode không hợp lệ", () => {
      expect(() => {
        validateUpdateOwnerFieldPayload({
          approval_mode: "invalid",
        });
      }).toThrow("approval_mode không hợp lệ");
    });
  });

  describe("validateOwnerFieldStatusPayload", () => {
    it("cho phép owner chuyển sân sang inactive", () => {
      const result = validateOwnerFieldStatusPayload({
        status: " INACTIVE ",
      });

      expect(result).toEqual({ status: "inactive" });
    });

    it("cho phép owner chuyển sân sang maintenance", () => {
      const result = validateOwnerFieldStatusPayload({
        status: "maintenance",
      });

      expect(result).toEqual({ status: "maintenance" });
    });

    it("báo lỗi nếu owner chuyển sân sang active", () => {
      expect(() => {
        validateOwnerFieldStatusPayload({
          status: "active",
        });
      }).toThrow("Owner chỉ được chuyển sân sang inactive hoặc maintenance");
    });
  });

  describe("validateFieldImageParams", () => {
    it("trả về fieldId và imageId hợp lệ", () => {
      const result = validateFieldImageParams({
        fieldId: "1",
        imageId: "2",
      });

      expect(result).toEqual({
        fieldId: 1,
        imageId: 2,
      });
    });

    it("báo lỗi nếu fieldId không hợp lệ", () => {
      expect(() => {
        validateFieldImageParams({
          fieldId: "abc",
          imageId: "2",
        });
      }).toThrow("fieldId không hợp lệ");
    });

    it("báo lỗi nếu imageId không hợp lệ", () => {
      expect(() => {
        validateFieldImageParams({
          fieldId: "1",
          imageId: "abc",
        });
      }).toThrow("imageId không hợp lệ");
    });
  });
});