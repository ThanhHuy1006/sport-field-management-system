import prisma from "../../config/prisma.js";

export const paymentsRepository = {
  findBookingForPayment(userId, bookingId) {
    return prisma.bookings.findFirst({
      where: {
        id: bookingId,
        user_id: userId,
      },
      select: {
        id: true,
        user_id: true,
        field_id: true,
        status: true,
        total_price: true,
        start_datetime: true,
        end_datetime: true,
        payments: {
          orderBy: { created_at: "desc" },
        },
      },
    });
  },

  findPaymentByBookingId(userId, bookingId) {
    return prisma.payments.findFirst({
      where: {
        booking_id: bookingId,
        bookings: {
          user_id: userId,
        },
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            total_price: true,
            start_datetime: true,
            end_datetime: true,
          },
        },
      },
    });
  },

  findPaymentById(userId, paymentId) {
    return prisma.payments.findFirst({
      where: {
        id: paymentId,
        bookings: {
          user_id: userId,
        },
      },
      include: {
        bookings: {
          select: {
            id: true,
            status: true,
            total_price: true,
            start_datetime: true,
            end_datetime: true,
          },
        },
      },
    });
  },

  createOrReusePayment(booking, provider) {
    return prisma.$transaction(async (tx) => {
      const existed = await tx.payments.findFirst({
        where: { booking_id: booking.id },
      });

      const transaction_code = `PAY-${booking.id}-${Date.now()}`;

      let payment;

      if (existed) {
        payment = await tx.payments.update({
          where: { id: existed.id },
          data: {
            provider,
            amount: booking.total_price,
            currency: "VND",
            status: "pending",
            transaction_code,
            paid_at: null,
            raw_response: null,
          },
        });
      } else {
        payment = await tx.payments.create({
          data: {
            booking_id: booking.id,
            provider,
            amount: booking.total_price,
            currency: "VND",
            transaction_code,
            status: "pending",
          },
        });
      }

      if (booking.status === "APPROVED" || booking.status === "PAY_FAILED") {
        await tx.bookings.update({
          where: { id: booking.id },
          data: { status: "AWAITING_PAYMENT" },
        });

        await tx.booking_status_history.create({
          data: {
            booking_id: booking.id,
            from_status: booking.status,
            to_status: "AWAITING_PAYMENT",
            note: "Payment initiated",
          },
        });
      }

      return tx.payments.findUnique({
        where: { id: payment.id },
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              total_price: true,
              start_datetime: true,
              end_datetime: true,
            },
          },
        },
      });
    });
  },

  markPaymentSuccess(paymentId) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payments.findUnique({
        where: { id: paymentId },
        include: {
          bookings: true,
        },
      });

      if (!payment) return null;

      const updatedPayment = await tx.payments.update({
        where: { id: paymentId },
        data: {
          status: "success",
          paid_at: new Date(),
          raw_response: JSON.stringify({
            simulated: true,
            result: "success",
            at: new Date().toISOString(),
          }),
        },
      });

      if (payment.bookings && payment.bookings.status !== "PAID") {
        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: {
            status: "PAID",
          },
        });

        await tx.booking_status_history.create({
          data: {
            booking_id: payment.booking_id,
            from_status: payment.bookings.status,
            to_status: "PAID",
            note: "Payment success",
          },
        });
      }

      return tx.payments.findUnique({
        where: { id: updatedPayment.id },
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              total_price: true,
              start_datetime: true,
              end_datetime: true,
            },
          },
        },
      });
    });
  },

  markPaymentFailed(paymentId) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.payments.findUnique({
        where: { id: paymentId },
        include: {
          bookings: true,
        },
      });

      if (!payment) return null;

      const updatedPayment = await tx.payments.update({
        where: { id: paymentId },
        data: {
          status: "failed",
          raw_response: JSON.stringify({
            simulated: true,
            result: "failed",
            at: new Date().toISOString(),
          }),
        },
      });

      if (payment.bookings && payment.bookings.status !== "PAY_FAILED") {
        await tx.bookings.update({
          where: { id: payment.booking_id },
          data: {
            status: "PAY_FAILED",
          },
        });

        await tx.booking_status_history.create({
          data: {
            booking_id: payment.booking_id,
            from_status: payment.bookings.status,
            to_status: "PAY_FAILED",
            note: "Payment failed",
          },
        });
      }

      return tx.payments.findUnique({
        where: { id: updatedPayment.id },
        include: {
          bookings: {
            select: {
              id: true,
              status: true,
              total_price: true,
              start_datetime: true,
              end_datetime: true,
            },
          },
        },
      });
    });
  },
};