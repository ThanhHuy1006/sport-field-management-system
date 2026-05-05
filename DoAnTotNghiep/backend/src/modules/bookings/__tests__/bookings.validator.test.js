// src/modules/bookings/__tests__/bookings.validator.test.js

import { describe, it, expect } from "vitest";
import {
  validateBookingIdParams,
  validateCheckAvailabilityPayload,
  validateCreateBookingPayload,
  validateBookingListQuery,
  validateAvailabilitySlotsQuery,
  validateCheckInQrPayload,
  validateRejectBookingPayload,
  validateManualCheckInPayload,
  validateCompleteBookingPayload
} from "../bookings.validator.js";

describe("bookings.validator", () => {
  describe("validateBookingIdParams", () => {
    it("trả về bookingId hợp lệ", () => {
      const result = validateBookingIdParams({ bookingId: "10" });

      expect(result).toEqual({
        bookingId: 10
      });
    });

    it("báo lỗi nếu bookingId không hợp lệ", () => {
      expect(() => {
        validateBookingIdParams({ bookingId: "abc" });
      }).toThrow("bookingId không hợp lệ");
    });
  });

  describe("validateCheckAvailabilityPayload", () => {
    it("trả về dữ liệu hợp lệ khi kiểm tra availability", () => {
      const result = validateCheckAvailabilityPayload({
        field_id: 1,
        start_datetime: "2026-06-01T08:00:00",
        end_datetime: "2026-06-01T10:00:00"
      });

      expect(result.field_id).toBe(1);
      expect(result.start_datetime).toBeInstanceOf(Date);
      expect(result.end_datetime).toBeInstanceOf(Date);
    });

    it("báo lỗi nếu field_id không hợp lệ", () => {
      expect(() => {
        validateCheckAvailabilityPayload({
          field_id: 0,
          start_datetime: "2026-06-01T08:00:00",
          end_datetime: "2026-06-01T10:00:00"
        });
      }).toThrow("field_id không hợp lệ");
    });

    it("báo lỗi nếu thiếu start_datetime", () => {
      expect(() => {
        validateCheckAvailabilityPayload({
          field_id: 1,
          end_datetime: "2026-06-01T10:00:00"
        });
      }).toThrow("start_datetime là bắt buộc");
    });

    it("báo lỗi nếu start_datetime không hợp lệ", () => {
      expect(() => {
        validateCheckAvailabilityPayload({
          field_id: 1,
          start_datetime: "abc",
          end_datetime: "2026-06-01T10:00:00"
        });
      }).toThrow("start_datetime không hợp lệ");
    });

    it("báo lỗi nếu end_datetime <= start_datetime", () => {
      expect(() => {
        validateCheckAvailabilityPayload({
          field_id: 1,
          start_datetime: "2026-06-01T10:00:00",
          end_datetime: "2026-06-01T08:00:00"
        });
      }).toThrow("end_datetime phải lớn hơn start_datetime");
    });
  });

  describe("validateCreateBookingPayload", () => {
    it("chuẩn hóa dữ liệu tạo booking hợp lệ", () => {
      const result = validateCreateBookingPayload({
        field_id: "1",
        start_datetime: "2026-06-01T08:00:00",
        end_datetime: "2026-06-01T10:00:00",
        notes: "  ghi chú đặt sân  ",
        contact_name: "  Nguyễn Văn A  ",
        contact_email: "  user@gmail.com  ",
        contact_phone: "  0909123456  ",
        requested_payment_method: "bank_transfer",
        voucher_code: " summer10 "
      });

      expect(result.field_id).toBe(1);
      expect(result.notes).toBe("ghi chú đặt sân");
      expect(result.contact_name).toBe("Nguyễn Văn A");
      expect(result.contact_email).toBe("user@gmail.com");
      expect(result.contact_phone).toBe("0909123456");
      expect(result.requested_payment_method).toBe("BANK_TRANSFER");
      expect(result.voucher_code).toBe("SUMMER10");
    });

    it("mặc định requested_payment_method là ONSITE nếu không truyền", () => {
      const result = validateCreateBookingPayload({
        field_id: 1,
        start_datetime: "2026-06-01T08:00:00",
        end_datetime: "2026-06-01T10:00:00"
      });

      expect(result.requested_payment_method).toBe("ONSITE");
    });

    it("báo lỗi nếu requested_payment_method không hợp lệ", () => {
      expect(() => {
        validateCreateBookingPayload({
          field_id: 1,
          start_datetime: "2026-06-01T08:00:00",
          end_datetime: "2026-06-01T10:00:00",
          requested_payment_method: "MOMO"
        });
      }).toThrow("requested_payment_method không hợp lệ");
    });

    it("trả voucher_code là null nếu không truyền voucher", () => {
      const result = validateCreateBookingPayload({
        field_id: 1,
        start_datetime: "2026-06-01T08:00:00",
        end_datetime: "2026-06-01T10:00:00"
      });

      expect(result.voucher_code).toBeNull();
    });
  });

  describe("validateBookingListQuery", () => {
    it("trả về page và limit mặc định nếu không truyền query", () => {
      const result = validateBookingListQuery({});

      expect(result).toEqual({
        page: 1,
        limit: 10,
        status: undefined
      });
    });

    it("trả về page, limit và status hợp lệ", () => {
      const result = validateBookingListQuery({
        page: "2",
        limit: "20",
        status: "PAID"
      });

      expect(result).toEqual({
        page: 2,
        limit: 20,
        status: "PAID"
      });
    });

    it("báo lỗi nếu page không hợp lệ", () => {
      expect(() => {
        validateBookingListQuery({
          page: "0",
          limit: "10"
        });
      }).toThrow("page không hợp lệ");
    });

    it("báo lỗi nếu limit lớn hơn 100", () => {
      expect(() => {
        validateBookingListQuery({
          page: "1",
          limit: "101"
        });
      }).toThrow("limit không hợp lệ");
    });

    it("báo lỗi nếu status không hợp lệ", () => {
      expect(() => {
        validateBookingListQuery({
          status: "INVALID_STATUS"
        });
      }).toThrow("status không hợp lệ");
    });
  });

  describe("validateAvailabilitySlotsQuery", () => {
    it("trả về query availability slots hợp lệ", () => {
      const result = validateAvailabilitySlotsQuery({
        field_id: "1",
        date: "2026-06-01",
        duration_minutes: "60"
      });

      expect(result).toEqual({
        field_id: 1,
        date: "2026-06-01",
        duration_minutes: 60
      });
    });

    it("cho phép không truyền duration_minutes", () => {
      const result = validateAvailabilitySlotsQuery({
        field_id: "1",
        date: "2026-06-01"
      });

      expect(result).toEqual({
        field_id: 1,
        date: "2026-06-01",
        duration_minutes: undefined
      });
    });

    it("báo lỗi nếu field_id không hợp lệ", () => {
      expect(() => {
        validateAvailabilitySlotsQuery({
          field_id: "abc",
          date: "2026-06-01"
        });
      }).toThrow("field_id không hợp lệ");
    });

    it("báo lỗi nếu thiếu date", () => {
      expect(() => {
        validateAvailabilitySlotsQuery({
          field_id: "1"
        });
      }).toThrow("date là bắt buộc");
    });

    it("báo lỗi nếu date sai định dạng YYYY-MM-DD", () => {
      expect(() => {
        validateAvailabilitySlotsQuery({
          field_id: "1",
          date: "01-06-2026"
        });
      }).toThrow("date phải có định dạng YYYY-MM-DD");
    });

    it("báo lỗi nếu duration_minutes không hợp lệ", () => {
      expect(() => {
        validateAvailabilitySlotsQuery({
          field_id: "1",
          date: "2026-06-01",
          duration_minutes: "0"
        });
      }).toThrow("duration_minutes không hợp lệ");
    });
  });

  describe("validateCheckInQrPayload", () => {
    it("trả về qr_token hợp lệ", () => {
      const result = validateCheckInQrPayload({
        qr_token: " abc-token "
      });

      expect(result).toEqual({
        qr_token: "abc-token"
      });
    });

    it("báo lỗi nếu thiếu qr_token", () => {
      expect(() => {
        validateCheckInQrPayload({});
      }).toThrow("qr_token là bắt buộc");
    });
  });

  describe("default note validators", () => {
    it("validateRejectBookingPayload trả note mặc định nếu không truyền", () => {
      const result = validateRejectBookingPayload({});

      expect(result.note).toBe("Rejected by owner");
    });

    it("validateManualCheckInPayload trả note mặc định nếu không truyền", () => {
      const result = validateManualCheckInPayload({});

      expect(result.note).toBe("Checked in manually by owner");
    });

    it("validateCompleteBookingPayload trả note mặc định nếu không truyền", () => {
      const result = validateCompleteBookingPayload({});

      expect(result.note).toBe("Completed by owner");
    });
//     it("báo lỗi nếu bookingId là số thập phân", () => {
//   expect(() => {
//     validateBookingIdParams({ bookingId: "1.5" });
//   }).toThrow("bookingId không hợp lệ");
// });
  });
});