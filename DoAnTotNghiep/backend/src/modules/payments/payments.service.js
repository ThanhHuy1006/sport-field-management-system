import { paymentsRepository } from "./payments.repository.js";
import { validateCreatePaymentPayload } from "./payments.validator.js";

export const paymentsService = {
  async createPayment(userId, payload) {
    const valid = validateCreatePaymentPayload(payload);

    const booking = await paymentsRepository.findBookingForPayment(
      userId,
      valid.booking_id
    );

    if (!booking) {
      throw new Error("Không tìm thấy booking");
    }

    if (!["APPROVED", "AWAITING_PAYMENT", "PAY_FAILED"].includes(booking.status)) {
      throw new Error("Booking hiện chưa thể thanh toán");
    }

    if (!booking.total_price || Number(booking.total_price) <= 0) {
      throw new Error("Booking chưa có tổng tiền hợp lệ");
    }

    return paymentsRepository.createOrReusePayment(booking, valid.provider);
  },

  async getPaymentByBooking(userId, bookingId) {
    const id = Number(bookingId);
    if (Number.isNaN(id)) {
      throw new Error("bookingId không hợp lệ");
    }

    const payment = await paymentsRepository.findPaymentByBookingId(userId, id);
    if (!payment) {
      throw new Error("Không tìm thấy payment cho booking này");
    }

    return payment;
  },

  async getPaymentDetail(userId, paymentId) {
    const id = Number(paymentId);
    if (Number.isNaN(id)) {
      throw new Error("paymentId không hợp lệ");
    }

    const payment = await paymentsRepository.findPaymentById(userId, id);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    return payment;
  },

  async simulateSuccess(userId, paymentId) {
    const id = Number(paymentId);
    if (Number.isNaN(id)) {
      throw new Error("paymentId không hợp lệ");
    }

    const payment = await paymentsRepository.findPaymentById(userId, id);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    if (payment.status === "success") {
      throw new Error("Payment đã thành công trước đó");
    }

    return paymentsRepository.markPaymentSuccess(id);
  },

  async simulateFailed(userId, paymentId) {
    const id = Number(paymentId);
    if (Number.isNaN(id)) {
      throw new Error("paymentId không hợp lệ");
    }

    const payment = await paymentsRepository.findPaymentById(userId, id);
    if (!payment) {
      throw new Error("Không tìm thấy payment");
    }

    if (payment.status === "failed") {
      throw new Error("Payment đã failed trước đó");
    }

    return paymentsRepository.markPaymentFailed(id);
  },
};