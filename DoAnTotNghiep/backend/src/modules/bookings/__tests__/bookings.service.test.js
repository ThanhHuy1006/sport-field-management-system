// src/modules/bookings/__tests__/bookings.service.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../bookings.repository.js", () => ({
  bookingsRepository: {
    findFieldById: vi.fn(),
    findOperatingHourByFieldAndDay: vi.fn(),
    findBlackoutsByFieldAndDate: vi.fn(),
    findBookingsByFieldAndDate: vi.fn(),
    findBlackoutByFieldAndRange: vi.fn(),
    findConflictingBookings: vi.fn(),
    createBookingWithHistory: vi.fn(),

    findMyBookings: vi.fn(),
    findMyBookingById: vi.fn(),
    cancelMyBooking: vi.fn(),

    findOwnerBookings: vi.fn(),
    findOwnerBookingById: vi.fn(),
    approveOwnerBooking: vi.fn(),
    rejectOwnerBooking: vi.fn(),
    markOwnerBookingCheckedIn: vi.fn(),
    completeOwnerBooking: vi.fn(),
  },
}));

vi.mock("../../vouchers/vouchers.service.js", () => ({
  vouchersService: {
    validateVoucher: vi.fn(),
  },
}));

vi.mock("../../notifications/notifications.service.js", () => ({
  notificationsService: {
    createNotification: vi.fn(),
  },
}));

vi.mock("jsonwebtoken", () => ({
  default: {
    sign: vi.fn(),
    verify: vi.fn(),
  },
}));

import jwt from "jsonwebtoken";
import { bookingsService } from "../bookings.service.js";
import { bookingsRepository } from "../bookings.repository.js";
import { vouchersService } from "../../vouchers/vouchers.service.js";
import { notificationsService } from "../../notifications/notifications.service.js";

const futureStart = new Date("2099-06-01T08:00:00");
const futureEnd = new Date("2099-06-01T10:00:00");

const activeField = {
  id: 1,
  owner_id: 99,
  field_name: "Sân bóng đá A",
  status: "active",
  min_duration_minutes: 60,
  base_price_per_hour: 100000,
  approval_mode: "AUTO",
};

const operatingHour = {
  open_time: "06:00:00",
  close_time: "22:00:00",
};

describe("bookings.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.CHECKIN_QR_SECRET;
  });

  describe("getAvailabilitySlots", () => {
    it("báo lỗi nếu không tìm thấy sân", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(null);

      await expect(
        bookingsService.getAvailabilitySlots({
          field_id: 999,
          date: "2099-06-01",
          duration_minutes: 60,
        }),
      ).rejects.toThrow("Không tìm thấy sân");
    });

    it("báo lỗi nếu sân không active", async () => {
      bookingsRepository.findFieldById.mockResolvedValue({
        ...activeField,
        status: "maintenance",
      });

      await expect(
        bookingsService.getAvailabilitySlots({
          field_id: 1,
          date: "2099-06-01",
          duration_minutes: 60,
        }),
      ).rejects.toThrow("Sân hiện không khả dụng");
    });

    it("trả về is_open false nếu sân không có giờ hoạt động ngày đó", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(activeField);
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(null);

      const result = await bookingsService.getAvailabilitySlots({
        field_id: 1,
        date: "2099-06-01",
        duration_minutes: 60,
      });

      expect(result.is_open).toBe(false);
      expect(result.slots).toEqual([]);
      expect(result.open_time).toBeNull();
      expect(result.close_time).toBeNull();
    });

    it("tạo danh sách slot và đánh dấu slot bị blackout/conflict", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(activeField);
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue({
        open_time: "08:00:00",
        close_time: "11:00:00",
      });

      bookingsRepository.findBlackoutsByFieldAndDate.mockResolvedValue([
        {
          start_datetime: new Date("2099-06-01T08:00:00"),
          end_datetime: new Date("2099-06-01T09:00:00"),
          reason: "Bảo trì sân",
        },
      ]);

      bookingsRepository.findBookingsByFieldAndDate.mockResolvedValue([
        {
          start_datetime: new Date("2099-06-01T09:00:00"),
          end_datetime: new Date("2099-06-01T10:00:00"),
          status: "PAID",
        },
      ]);

      const result = await bookingsService.getAvailabilitySlots({
        field_id: 1,
        date: "2099-06-01",
        duration_minutes: 60,
      });

      expect(result.is_open).toBe(true);
      expect(result.slots).toHaveLength(3);

      expect(result.slots[0].available).toBe(false);
      expect(result.slots[0].reason).toBe("Bảo trì sân");

      expect(result.slots[1].available).toBe(false);
      expect(result.slots[1].reason).toBe("Khung giờ đã được đặt");
      expect(result.slots[1].booking_status).toBe("PAID");

      expect(result.slots[2].available).toBe(true);
      expect(result.slots[2].reason).toBeNull();
    });
  });

  describe("checkAvailability", () => {
    it("trả available false nếu khung giờ bị blackout", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(activeField);
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);
      bookingsRepository.findBlackoutByFieldAndRange.mockResolvedValue({
        id: 1,
        reason: "Bảo trì",
      });

      const result = await bookingsService.checkAvailability({
        field_id: 1,
        start_datetime: futureStart,
        end_datetime: futureEnd,
      });

      expect(result.available).toBe(false);
      expect(result.reason).toBe("Ngày/giờ này đang bị khóa");
    });

    it("trả available false nếu khung giờ bị trùng booking", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(activeField);
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);
      bookingsRepository.findBlackoutByFieldAndRange.mockResolvedValue(null);
      bookingsRepository.findConflictingBookings.mockResolvedValue([
        {
          id: 10,
          status: "PAID",
        },
      ]);

      const result = await bookingsService.checkAvailability({
        field_id: 1,
        start_datetime: futureStart,
        end_datetime: futureEnd,
      });

      expect(result.available).toBe(false);
      expect(result.reason).toBe("Khung giờ đã được đặt");
      expect(result.conflicts).toHaveLength(1);
    });

    it("trả available true và tính đúng total_price nếu khung giờ hợp lệ", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(activeField);
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);
      bookingsRepository.findBlackoutByFieldAndRange.mockResolvedValue(null);
      bookingsRepository.findConflictingBookings.mockResolvedValue([]);

      const result = await bookingsService.checkAvailability({
        field_id: 1,
        start_datetime: futureStart,
        end_datetime: futureEnd,
      });

      expect(result.available).toBe(true);
      expect(result.total_price).toBe(200000);
      expect(result.field).toEqual(activeField);
    });

    it("báo lỗi nếu thời lượng đặt không chia hết cho min_duration_minutes", async () => {
      bookingsRepository.findFieldById.mockResolvedValue({
        ...activeField,
        min_duration_minutes: 60,
      });
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);

      await expect(
        bookingsService.checkAvailability({
          field_id: 1,
          start_datetime: new Date("2099-06-01T08:00:00"),
          end_datetime: new Date("2099-06-01T08:30:00"),
        }),
      ).rejects.toThrow("Thời lượng đặt phải chia hết cho 60 phút");
    });

    it("báo lỗi nếu đặt ngoài giờ hoạt động", async () => {
      bookingsRepository.findFieldById.mockResolvedValue(activeField);
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue({
        open_time: "09:00:00",
        close_time: "10:00:00",
      });

      await expect(
        bookingsService.checkAvailability({
          field_id: 1,
          start_datetime: new Date("2099-06-01T08:00:00"),
          end_datetime: new Date("2099-06-01T10:00:00"),
        }),
      ).rejects.toThrow("Khung giờ đặt nằm ngoài giờ hoạt động của sân");
    });
  });

  describe("createBooking", () => {
    it("báo lỗi nếu currentUser không phải USER", async () => {
      await expect(
        bookingsService.createBooking(
          {
            id: 1,
            role: "OWNER",
          },
          {
            field_id: 1,
            start_datetime: futureStart,
            end_datetime: futureEnd,
          },
        ),
      ).rejects.toThrow("Chỉ khách hàng mới được đặt sân");
    });

    it("tạo booking AUTO + BANK_TRANSFER với trạng thái AWAITING_PAYMENT", async () => {
      bookingsRepository.findFieldById.mockResolvedValue({
        ...activeField,
        approval_mode: "AUTO",
      });
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);
      bookingsRepository.findBlackoutByFieldAndRange.mockResolvedValue(null);
      bookingsRepository.findConflictingBookings.mockResolvedValue([]);

      bookingsRepository.createBookingWithHistory.mockResolvedValue({
        id: 100,
        user_id: 5,
        fields: {
          owner_id: 99,
        },
      });

      notificationsService.createNotification.mockResolvedValue({ id: 1 });

      const result = await bookingsService.createBooking(
        {
          id: 5,
          role: "USER",
        },
        {
          field_id: 1,
          start_datetime: futureStart,
          end_datetime: futureEnd,
          requested_payment_method: "BANK_TRANSFER",
          notes: "Đặt sân",
        },
      );

      expect(bookingsRepository.createBookingWithHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          field_id: 1,
          user_id: 5,
          status: "AWAITING_PAYMENT",
          requested_payment_method: "BANK_TRANSFER",
          original_price: 200000,
          discount_amount: 0,
          total_price: 200000,
          voucher_id: null,
        }),
      );

      const createArg = bookingsRepository.createBookingWithHistory.mock.calls[0][0];
      expect(createArg.payment_expires_at).toBeInstanceOf(Date);

      expect(notificationsService.createNotification).toHaveBeenCalledTimes(2);
      expect(result.id).toBe(100);
    });

    it("tạo booking MANUAL với trạng thái PENDING_CONFIRM", async () => {
      bookingsRepository.findFieldById.mockResolvedValue({
        ...activeField,
        approval_mode: "MANUAL",
      });
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);
      bookingsRepository.findBlackoutByFieldAndRange.mockResolvedValue(null);
      bookingsRepository.findConflictingBookings.mockResolvedValue([]);

      bookingsRepository.createBookingWithHistory.mockResolvedValue({
        id: 101,
        user_id: 5,
        fields: {
          owner_id: 99,
        },
      });

      const result = await bookingsService.createBooking(
        {
          id: 5,
          role: "USER",
        },
        {
          field_id: 1,
          start_datetime: futureStart,
          end_datetime: futureEnd,
          requested_payment_method: "ONSITE",
        },
      );

      expect(bookingsRepository.createBookingWithHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "PENDING_CONFIRM",
          requested_payment_method: "ONSITE",
          payment_expires_at: null,
        }),
      );

      expect(result.id).toBe(101);
    });

    it("áp dụng voucher khi tạo booking có voucher_code", async () => {
      bookingsRepository.findFieldById.mockResolvedValue({
        ...activeField,
        approval_mode: "AUTO",
      });
      bookingsRepository.findOperatingHourByFieldAndDay.mockResolvedValue(operatingHour);
      bookingsRepository.findBlackoutByFieldAndRange.mockResolvedValue(null);
      bookingsRepository.findConflictingBookings.mockResolvedValue([]);

      vouchersService.validateVoucher.mockResolvedValue({
        voucher: {
          id: 7,
        },
        discount_amount: 50000,
        final_amount: 150000,
      });

      bookingsRepository.createBookingWithHistory.mockResolvedValue({
        id: 102,
        user_id: 5,
        fields: {
          owner_id: 99,
        },
      });

      await bookingsService.createBooking(
        {
          id: 5,
          role: "USER",
        },
        {
          field_id: 1,
          start_datetime: futureStart,
          end_datetime: futureEnd,
          requested_payment_method: "ONSITE",
          voucher_code: "SUMMER10",
        },
      );

      expect(vouchersService.validateVoucher).toHaveBeenCalledWith(5, {
        code: "SUMMER10",
        order_amount: 200000,
        owner_id: 99,
      });

      expect(bookingsRepository.createBookingWithHistory).toHaveBeenCalledWith(
        expect.objectContaining({
          voucher_id: 7,
          discount_amount: 50000,
          total_price: 150000,
        }),
      );
    });
  });

  describe("cancelMyBooking", () => {
    it("báo lỗi nếu không tìm thấy booking khi hủy", async () => {
      bookingsRepository.findMyBookingById.mockResolvedValue(null);

      await expect(bookingsService.cancelMyBooking(5, 999)).rejects.toThrow(
        "Không tìm thấy booking",
      );
    });

    it("báo lỗi nếu trạng thái booking không thể hủy", async () => {
      bookingsRepository.findMyBookingById.mockResolvedValue({
        id: 1,
        status: "PAID",
        start_datetime: new Date("2099-06-01T08:00:00"),
      });

      await expect(bookingsService.cancelMyBooking(5, 1)).rejects.toThrow(
        "Booking hiện không thể hủy",
      );
    });

    it("hủy booking thành công nếu booking hợp lệ", async () => {
      bookingsRepository.findMyBookingById.mockResolvedValue({
        id: 1,
        status: "APPROVED",
        start_datetime: new Date("2099-06-01T08:00:00"),
      });

      bookingsRepository.cancelMyBooking.mockResolvedValue({
        id: 1,
        status: "CANCELLED",
        fields: {
          owner_id: 99,
          field_name: "Sân bóng đá A",
        },
      });

      const result = await bookingsService.cancelMyBooking(5, 1);

      expect(bookingsRepository.cancelMyBooking).toHaveBeenCalledWith(5, 1);
      expect(result.status).toBe("CANCELLED");
      expect(notificationsService.createNotification).toHaveBeenCalled();
    });
  });

  describe("owner booking actions", () => {
    it("approveOwnerBooking chuyển BANK_TRANSFER sang AWAITING_PAYMENT", async () => {
      bookingsRepository.findOwnerBookingById.mockResolvedValue({
        id: 1,
        user_id: 5,
        status: "PENDING_CONFIRM",
        requested_payment_method: "BANK_TRANSFER",
      });

      bookingsRepository.approveOwnerBooking.mockResolvedValue({
        id: 1,
        user_id: 5,
        status: "AWAITING_PAYMENT",
      });

      const result = await bookingsService.approveOwnerBooking(99, 1);

      expect(bookingsRepository.approveOwnerBooking).toHaveBeenCalledWith(
        99,
        1,
        "AWAITING_PAYMENT",
      );
      expect(result.status).toBe("AWAITING_PAYMENT");
      expect(notificationsService.createNotification).toHaveBeenCalled();
    });

    it("approveOwnerBooking báo lỗi nếu booking không ở trạng thái PENDING_CONFIRM", async () => {
      bookingsRepository.findOwnerBookingById.mockResolvedValue({
        id: 1,
        status: "PAID",
      });

      await expect(bookingsService.approveOwnerBooking(99, 1)).rejects.toThrow(
        "Chỉ booking đang chờ xác nhận mới được duyệt",
      );
    });

    it("rejectOwnerBooking từ chối booking đang PENDING_CONFIRM", async () => {
      bookingsRepository.findOwnerBookingById.mockResolvedValue({
        id: 1,
        user_id: 5,
        status: "PENDING_CONFIRM",
      });

      bookingsRepository.rejectOwnerBooking.mockResolvedValue({
        id: 1,
        user_id: 5,
        status: "REJECTED",
      });

      const result = await bookingsService.rejectOwnerBooking(99, 1, {
        note: "Sân bận",
      });

      expect(bookingsRepository.rejectOwnerBooking).toHaveBeenCalledWith(
        99,
        1,
        "Sân bận",
      );
      expect(result.status).toBe("REJECTED");
    });

    it("checkInOwnerBooking cho phép check-in booking ONSITE đã APPROVED", async () => {
      bookingsRepository.findOwnerBookingById.mockResolvedValue({
        id: 1,
        status: "APPROVED",
        requested_payment_method: "ONSITE",
        checked_in_at: null,
      });

      bookingsRepository.markOwnerBookingCheckedIn.mockResolvedValue({
        id: 1,
        status: "CHECKED_IN",
      });

      const result = await bookingsService.checkInOwnerBooking(99, 1, {
        note: "Khách đã tới sân",
      });

      expect(bookingsRepository.markOwnerBookingCheckedIn).toHaveBeenCalledWith(
        99,
        1,
        "MANUAL",
        "Khách đã tới sân",
      );
      expect(result.status).toBe("CHECKED_IN");
    });

    it("checkInOwnerBooking không cho check-in BANK_TRANSFER chưa PAID", async () => {
      bookingsRepository.findOwnerBookingById.mockResolvedValue({
        id: 1,
        status: "AWAITING_PAYMENT",
        requested_payment_method: "BANK_TRANSFER",
        checked_in_at: null,
      });

      await expect(
        bookingsService.checkInOwnerBooking(99, 1, {
          note: "Check-in",
        }),
      ).rejects.toThrow(
        "Booking chuyển khoản phải thanh toán thành công trước khi check-in",
      );
    });

    it("completeOwnerBooking chỉ cho hoàn thành booking CHECKED_IN", async () => {
      bookingsRepository.findOwnerBookingById.mockResolvedValue({
        id: 1,
        status: "APPROVED",
      });

      await expect(
        bookingsService.completeOwnerBooking(99, 1, {
          note: "Hoàn thành",
        }),
      ).rejects.toThrow("Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED");
    });
  });

  describe("QR check-in", () => {
    it("getMyBookingCheckInQr tạo QR token nếu booking APPROVED", async () => {
      process.env.CHECKIN_QR_SECRET = "test-secret";

      bookingsRepository.findMyBookingById.mockResolvedValue({
        id: 1,
        user_id: 5,
        status: "APPROVED",
        checked_in_at: null,
        start_datetime: new Date("2099-06-01T08:00:00"),
      });

      jwt.sign.mockReturnValue("fake_qr_token");

      const result = await bookingsService.getMyBookingCheckInQr(5, 1);

      expect(jwt.sign).toHaveBeenCalledWith(
        {
          bookingId: 1,
          userId: 5,
          type: "BOOKING_CHECKIN",
        },
        "test-secret",
        expect.objectContaining({
          expiresIn: expect.any(Number),
        }),
      );

      expect(result.booking_id).toBe(1);
      expect(result.qr_token).toBe("fake_qr_token");
      expect(result.expires_at).toBeDefined();
    });

    it("scanOwnerBookingQr báo lỗi nếu QR token không hợp lệ", async () => {
      process.env.CHECKIN_QR_SECRET = "test-secret";

      jwt.verify.mockImplementation(() => {
        throw new Error("invalid token");
      });

      await expect(
        bookingsService.scanOwnerBookingQr(99, {
          qr_token: "invalid_token",
        }),
      ).rejects.toThrow("QR token không hợp lệ hoặc đã hết hạn");
    });
  });
});