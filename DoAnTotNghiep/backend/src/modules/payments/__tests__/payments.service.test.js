// src/modules/payments/__tests__/payments.service.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../payments.repository.js", () => ({
  paymentsRepository: {
    findBookingForPayment: vi.fn(),
    createOrReusePayment: vi.fn(),
    findPaymentByBookingId: vi.fn(),
    findPaymentById: vi.fn(),
    markPaymentSuccess: vi.fn(),
    markPaymentFailed: vi.fn(),
  },
}));

vi.mock("../../bookings/bookings.repository.js", () => ({
  bookingsRepository: {
    expireAwaitingPaymentBooking: vi.fn(),
  },
}));

vi.mock("../../notifications/notifications.service.js", () => ({
  notificationsService: {
    createNotification: vi.fn(),
  },
}));

import { paymentsService } from "../payments.service.js";
import { paymentsRepository } from "../payments.repository.js";
import { bookingsRepository } from "../../bookings/bookings.repository.js";
import { notificationsService } from "../../notifications/notifications.service.js";

const validAwaitingPaymentBooking = {
  id: 100,
  user_id: 5,
  status: "AWAITING_PAYMENT",
  total_price: 200000,
  requested_payment_method: "BANK_TRANSFER",
  payment_expires_at: new Date("2099-06-01T08:00:00"),
  payments: [],
};

describe("payments.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createPayment", () => {
    it("báo lỗi nếu không tìm thấy booking", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue(null);

      await expect(
        paymentsService.createPayment(5, {
          booking_id: 999,
          provider: "BANK_TRANSFER",
        }),
      ).rejects.toThrow("Không tìm thấy booking");
    });

    it("báo lỗi nếu booking không ở trạng thái chờ thanh toán", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue({
        ...validAwaitingPaymentBooking,
        status: "APPROVED",
      });

      await expect(
        paymentsService.createPayment(5, {
          booking_id: 100,
          provider: "BANK_TRANSFER",
        }),
      ).rejects.toThrow("Booking hiện không ở trạng thái chờ thanh toán");
    });

    it("báo lỗi nếu booking đã quá hạn thanh toán", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue({
        ...validAwaitingPaymentBooking,
        payment_expires_at: new Date("2000-01-01T00:00:00"),
      });

      await expect(
        paymentsService.createPayment(5, {
          booking_id: 100,
          provider: "BANK_TRANSFER",
        }),
      ).rejects.toThrow("Booking đã quá hạn thanh toán");

      expect(bookingsRepository.expireAwaitingPaymentBooking).toHaveBeenCalledWith(
        100,
        "Payment expired before creating payment",
      );

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 5,
          title: "Booking đã quá hạn thanh toán",
          type: "PAYMENT",
        }),
      );
    });

    it("báo lỗi nếu booking thanh toán tại sân", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue({
        ...validAwaitingPaymentBooking,
        requested_payment_method: "ONSITE",
      });

      await expect(
        paymentsService.createPayment(5, {
          booking_id: 100,
          provider: "BANK_TRANSFER",
        }),
      ).rejects.toThrow("Booking này thanh toán tại sân, không cần thanh toán online");
    });

    it("báo lỗi nếu booking chưa có tổng tiền hợp lệ", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue({
        ...validAwaitingPaymentBooking,
        total_price: 0,
      });

      await expect(
        paymentsService.createPayment(5, {
          booking_id: 100,
          provider: "BANK_TRANSFER",
        }),
      ).rejects.toThrow("Booking chưa có tổng tiền hợp lệ");
    });

    it("báo lỗi nếu booking đã thanh toán thành công trước đó", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue({
        ...validAwaitingPaymentBooking,
        payments: [
          {
            id: 1,
            status: "success",
          },
        ],
      });

      await expect(
        paymentsService.createPayment(5, {
          booking_id: 100,
          provider: "BANK_TRANSFER",
        }),
      ).rejects.toThrow("Booking này đã thanh toán thành công");
    });

    it("tạo hoặc tái sử dụng payment nếu booking hợp lệ", async () => {
      paymentsRepository.findBookingForPayment.mockResolvedValue(
        validAwaitingPaymentBooking,
      );

      paymentsRepository.createOrReusePayment.mockResolvedValue({
        id: 1,
        booking_id: 100,
        provider: "BANK_TRANSFER",
        amount: 200000,
        status: "pending",
      });

      const result = await paymentsService.createPayment(5, {
        booking_id: 100,
        provider: "BANK_TRANSFER",
      });

      expect(paymentsRepository.createOrReusePayment).toHaveBeenCalledWith(
        validAwaitingPaymentBooking,
        "BANK_TRANSFER",
      );

      expect(result).toEqual({
        id: 1,
        booking_id: 100,
        provider: "BANK_TRANSFER",
        amount: 200000,
        status: "pending",
      });
    });

    it("cho phép tạo payment lại nếu booking đang PAY_FAILED", async () => {
      const payFailedBooking = {
        ...validAwaitingPaymentBooking,
        status: "PAY_FAILED",
        payment_expires_at: null,
      };

      paymentsRepository.findBookingForPayment.mockResolvedValue(payFailedBooking);
      paymentsRepository.createOrReusePayment.mockResolvedValue({
        id: 2,
        booking_id: 100,
        provider: "BANK_TRANSFER",
        amount: 200000,
        status: "pending",
      });

      const result = await paymentsService.createPayment(5, {
        booking_id: 100,
        provider: "BANK_TRANSFER",
      });

      expect(paymentsRepository.createOrReusePayment).toHaveBeenCalledWith(
        payFailedBooking,
        "BANK_TRANSFER",
      );

      expect(result.status).toBe("pending");
    });
  });

  describe("getPaymentByBooking", () => {
    it("trả về payment theo booking nếu tồn tại", async () => {
      paymentsRepository.findPaymentByBookingId.mockResolvedValue({
        id: 1,
        booking_id: 100,
      });

      const result = await paymentsService.getPaymentByBooking(5, 100);

      expect(paymentsRepository.findPaymentByBookingId).toHaveBeenCalledWith(
        5,
        100,
      );
      expect(result.id).toBe(1);
    });

    it("báo lỗi nếu không tìm thấy payment theo booking", async () => {
      paymentsRepository.findPaymentByBookingId.mockResolvedValue(null);

      await expect(paymentsService.getPaymentByBooking(5, 100)).rejects.toThrow(
        "Không tìm thấy payment cho booking này",
      );
    });
  });

  describe("getPaymentDetail", () => {
    it("trả về payment detail nếu tồn tại", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue({
        id: 10,
        booking_id: 100,
      });

      const result = await paymentsService.getPaymentDetail(5, 10);

      expect(paymentsRepository.findPaymentById).toHaveBeenCalledWith(5, 10);
      expect(result.id).toBe(10);
    });

    it("báo lỗi nếu không tìm thấy payment detail", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue(null);

      await expect(paymentsService.getPaymentDetail(5, 10)).rejects.toThrow(
        "Không tìm thấy payment",
      );
    });
  });

  describe("simulateSuccess", () => {
    it("báo lỗi nếu không tìm thấy payment", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue(null);

      await expect(paymentsService.simulateSuccess(5, 10)).rejects.toThrow(
        "Không tìm thấy payment",
      );
    });

    it("báo lỗi nếu payment đã success trước đó", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue({
        id: 10,
        status: "success",
      });

      await expect(paymentsService.simulateSuccess(5, 10)).rejects.toThrow(
        "Payment đã thành công trước đó",
      );
    });

    it("mô phỏng thanh toán thành công và tạo thông báo", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue({
        id: 10,
        status: "pending",
        bookings: {
          id: 100,
          user_id: 5,
          fields: {
            owner_id: 99,
            field_name: "Sân bóng đá A",
          },
        },
      });

      paymentsRepository.markPaymentSuccess.mockResolvedValue({
        id: 10,
        status: "success",
        bookings: {
          id: 100,
          user_id: 5,
          fields: {
            owner_id: 99,
            field_name: "Sân bóng đá A",
          },
        },
      });

      const result = await paymentsService.simulateSuccess(5, 10);

      expect(paymentsRepository.markPaymentSuccess).toHaveBeenCalledWith(10);
      expect(result.status).toBe("success");

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 5,
          title: "Thanh toán thành công",
          type: "PAYMENT",
        }),
      );

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 99,
          title: "Khách hàng đã thanh toán",
          type: "PAYMENT",
        }),
      );
    });
  });

  describe("simulateFailed", () => {
    it("báo lỗi nếu không tìm thấy payment", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue(null);

      await expect(paymentsService.simulateFailed(5, 10)).rejects.toThrow(
        "Không tìm thấy payment",
      );
    });

    it("báo lỗi nếu payment đã success", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue({
        id: 10,
        status: "success",
      });

      await expect(paymentsService.simulateFailed(5, 10)).rejects.toThrow(
        "Payment đã thành công, không thể chuyển sang failed",
      );
    });

    it("báo lỗi nếu payment đã failed trước đó", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue({
        id: 10,
        status: "failed",
      });

      await expect(paymentsService.simulateFailed(5, 10)).rejects.toThrow(
        "Payment đã failed trước đó",
      );
    });

    it("mô phỏng thanh toán thất bại và tạo thông báo", async () => {
      paymentsRepository.findPaymentById.mockResolvedValue({
        id: 10,
        status: "pending",
        bookings: {
          id: 100,
          user_id: 5,
        },
      });

      paymentsRepository.markPaymentFailed.mockResolvedValue({
        id: 10,
        status: "failed",
        bookings: {
          id: 100,
          user_id: 5,
        },
      });

      const result = await paymentsService.simulateFailed(5, 10);

      expect(paymentsRepository.markPaymentFailed).toHaveBeenCalledWith(10);
      expect(result.status).toBe("failed");

      expect(notificationsService.createNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 5,
          title: "Thanh toán thất bại",
          type: "PAYMENT",
        }),
      );
    });
  });
});