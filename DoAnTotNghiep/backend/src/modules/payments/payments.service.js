import { paymentsRepository } from "./payments.repository.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";

export const paymentsService = {
  async createPayment(userId, payload) {
  const booking = await paymentsRepository.findBookingForPayment(
    userId,
    payload.booking_id
  );
  console.log("[PAYMENT CREATE DEBUG] payload:", payload);
console.log("[PAYMENT CREATE DEBUG] booking:", booking);

  if (!booking) {
    throw new NotFoundError("Không tìm thấy booking");
  }

  if (booking.requested_payment_method !== "BANK_TRANSFER") {
    throw new ForbiddenError(
      "Booking này thanh toán tại sân, không cần thanh toán online"
    );
  }

  if (!["AWAITING_PAYMENT", "PAY_FAILED"].includes(booking.status)) {
    throw new ForbiddenError("Booking hiện chưa thể thanh toán");
  }

  if (!booking.total_price || Number(booking.total_price) <= 0) {
    throw new ValidationError("Booking chưa có tổng tiền hợp lệ");
  }

  const paidPayment = (booking.payments || []).find(
    (item) => item.status === "success"
  );

  if (paidPayment) {
    throw new ConflictError("Booking này đã thanh toán thành công");
  }

  return paymentsRepository.createOrReusePayment(booking, payload.provider);
},

  async getPaymentByBooking(userId, bookingId) {
    const payment = await paymentsRepository.findPaymentByBookingId(userId, bookingId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy payment cho booking này");
    }

    return payment;
  },

  async getPaymentDetail(userId, paymentId) {
    const payment = await paymentsRepository.findPaymentById(userId, paymentId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy payment");
    }

    return payment;
  },

  async simulateSuccess(userId, paymentId) {
    const payment = await paymentsRepository.findPaymentById(userId, paymentId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy payment");
    }

    if (payment.status === "success") {
      throw new ConflictError("Payment đã thành công trước đó");
    }

    return paymentsRepository.markPaymentSuccess(paymentId);
  },

  async simulateFailed(userId, paymentId) {
    const payment = await paymentsRepository.findPaymentById(userId, paymentId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy payment");
    }

    if (payment.status === "success") {
      throw new ConflictError("Payment đã thành công, không thể chuyển sang failed");
    }

    if (payment.status === "failed") {
      throw new ConflictError("Payment đã failed trước đó");
    }

    return paymentsRepository.markPaymentFailed(paymentId);
  },
};