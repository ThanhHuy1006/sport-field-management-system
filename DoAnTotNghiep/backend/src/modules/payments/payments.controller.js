import { successResponse } from "../../core/utils/response.js";
import { paymentsService } from "./payments.service.js";
// import { toPaymentResponse } from "./payments.mapper.js";

export const paymentsController = {
  async createPayment(req, res, next) {
    try {
      const payment = await paymentsService.createPayment(req.user.id, req.body);
      return successResponse(
        res,
        toPaymentResponse(payment),
        "Tạo payment thành công",
        201
      );
    } catch (error) {
      next(error);
    }
  },

  async getPaymentByBooking(req, res, next) {
    try {
      const payment = await paymentsService.getPaymentByBooking(
        req.user.id,
        req.params.bookingId
      );
      return successResponse(
        res,
        toPaymentResponse(payment),
        "Lấy payment theo booking thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async getPaymentDetail(req, res, next) {
    try {
      const payment = await paymentsService.getPaymentDetail(
        req.user.id,
        req.params.paymentId
      );
      return successResponse(
        res,
        toPaymentResponse(payment),
        "Lấy chi tiết payment thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async simulateSuccess(req, res, next) {
    try {
      const payment = await paymentsService.simulateSuccess(
        req.user.id,
        req.params.paymentId
      );
      return successResponse(
        res,
        toPaymentResponse(payment),
        "Giả lập thanh toán thành công"
      );
    } catch (error) {
      next(error);
    }
  },

  async simulateFailed(req, res, next) {
    try {
      const payment = await paymentsService.simulateFailed(
        req.user.id,
        req.params.paymentId
      );
      return successResponse(
        res,
        toPaymentResponse(payment),
        "Giả lập thanh toán thất bại"
      );
    } catch (error) {
      next(error);
    }
  },
};