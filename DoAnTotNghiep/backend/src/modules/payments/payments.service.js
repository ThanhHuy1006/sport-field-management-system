import { paymentsRepository } from "./payments.repository.js";
import { bookingsRepository } from "../bookings/bookings.repository.js";
import { notificationsService } from "../notifications/notifications.service.js";
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";

async function safeCreateNotification(payload) {
  try {
    await notificationsService.createNotification(payload);
  } catch (error) {
    console.error("[NOTIFICATION_ERROR]", error);
  }
}

export const paymentsService = {
  async createPayment(userId, payload) {
    const booking = await paymentsRepository.findBookingForPayment(
      userId,
      payload.booking_id,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (
      booking.status !== "AWAITING_PAYMENT" &&
      booking.status !== "PAY_FAILED"
    ) {
      throw new ForbiddenError(
        "Booking hiện không ở trạng thái chờ thanh toán",
      );
    }

    if (
      booking.status === "AWAITING_PAYMENT" &&
      booking.payment_expires_at &&
      new Date() > new Date(booking.payment_expires_at)
    ) {
      await bookingsRepository.expireAwaitingPaymentBooking(
        booking.id,
        "Payment expired before creating payment",
      );

      await safeCreateNotification({
        user_id: booking.user_id,
        title: "Booking đã quá hạn thanh toán",
        body: "Đơn đặt sân của bạn đã quá thời gian thanh toán. Vui lòng đặt lại nếu vẫn có nhu cầu.",
        type: "PAYMENT",
      });

      throw new ForbiddenError("Booking đã quá hạn thanh toán");
    }

    if (booking.requested_payment_method !== "BANK_TRANSFER") {
      throw new ForbiddenError(
        "Booking này thanh toán tại sân, không cần thanh toán online",
      );
    }

    if (!booking.total_price || Number(booking.total_price) <= 0) {
      throw new ValidationError("Booking chưa có tổng tiền hợp lệ");
    }

    const paidPayment = (booking.payments || []).find(
      (item) => item.status === "success",
    );

    if (paidPayment) {
      throw new ConflictError("Booking này đã thanh toán thành công");
    }

    return paymentsRepository.createOrReusePayment(booking, payload.provider);
  },

  async getPaymentByBooking(userId, bookingId) {
    const payment = await paymentsRepository.findPaymentByBookingId(
      userId,
      bookingId,
    );

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

    const updatedPayment = await paymentsRepository.markPaymentSuccess(paymentId);

    const booking = updatedPayment.bookings || payment.bookings;

    if (booking?.user_id) {
      await safeCreateNotification({
        user_id: booking.user_id,
        title: "Thanh toán thành công",
        body: "Thanh toán của bạn đã được xác nhận. Bạn có thể sử dụng mã QR để check-in.",
        type: "PAYMENT",
      });
    }

    const ownerId = booking?.fields?.owner_id;

    if (ownerId) {
      await safeCreateNotification({
        user_id: ownerId,
        title: "Khách hàng đã thanh toán",
        body: `Một đơn đặt sân tại ${
          booking.fields?.field_name || "sân của bạn"
        } đã được thanh toán thành công.`,
        type: "PAYMENT",
      });
    }

    return updatedPayment;
  },

  async simulateFailed(userId, paymentId) {
    const payment = await paymentsRepository.findPaymentById(userId, paymentId);

    if (!payment) {
      throw new NotFoundError("Không tìm thấy payment");
    }

    if (payment.status === "success") {
      throw new ConflictError(
        "Payment đã thành công, không thể chuyển sang failed",
      );
    }

    if (payment.status === "failed") {
      throw new ConflictError("Payment đã failed trước đó");
    }

    const updatedPayment = await paymentsRepository.markPaymentFailed(paymentId);

    const booking = updatedPayment.bookings || payment.bookings;

    if (booking?.user_id) {
      await safeCreateNotification({
        user_id: booking.user_id,
        title: "Thanh toán thất bại",
        body: "Thanh toán của bạn chưa thành công. Vui lòng thử lại.",
        type: "PAYMENT",
      });
    }

    return updatedPayment;
  },
};