// src/modules/payments/__tests__/payments.mapper.test.js

import { describe, it, expect } from "vitest";
import { toPaymentResponse } from "../payments.mapper.js";

describe("payments.mapper", () => {
  it("map đúng payment response khi có booking", () => {
    const payment = {
      id: 1,
      booking_id: 100,
      provider: "BANK_TRANSFER",
      amount: 200000,
      currency: "VND",
      status: "success",
      transaction_code: "PAY-100-123456",
      paid_at: new Date("2099-06-01T08:00:00"),
      raw_response: JSON.stringify({ simulated: true }),
      created_at: new Date("2099-05-30T10:00:00"),
      updated_at: new Date("2099-05-30T10:10:00"),
      bookings: {
        id: 100,
        status: "PAID",
        total_price: 200000,
        start_datetime: new Date("2099-06-01T08:00:00"),
        end_datetime: new Date("2099-06-01T10:00:00"),
      },
    };

    const result = toPaymentResponse(payment);

    expect(result).toEqual({
      id: 1,
      booking_id: 100,
      provider: "BANK_TRANSFER",
      amount: 200000,
      currency: "VND",
      status: "success",
      transaction_code: "PAY-100-123456",
      paid_at: new Date("2099-06-01T08:00:00"),
      raw_response: JSON.stringify({ simulated: true }),
      created_at: new Date("2099-05-30T10:00:00"),
      updated_at: new Date("2099-05-30T10:10:00"),
      booking: {
        id: 100,
        status: "PAID",
        total_price: 200000,
        start_datetime: new Date("2099-06-01T08:00:00"),
        end_datetime: new Date("2099-06-01T10:00:00"),
      },
    });
  });

  it("trả booking là null nếu payment không include booking", () => {
    const payment = {
      id: 2,
      booking_id: 101,
      provider: "BANK_TRANSFER",
      amount: 150000,
      currency: "VND",
      status: "pending",
      transaction_code: "PAY-101-123456",
      paid_at: null,
      raw_response: null,
      created_at: new Date("2099-05-30T10:00:00"),
      updated_at: new Date("2099-05-30T10:10:00"),
      bookings: null,
    };

    const result = toPaymentResponse(payment);

    expect(result.booking).toBeNull();
    expect(result.paid_at).toBeNull();
    expect(result.raw_response).toBeNull();
  });

  it("trả paid_at và raw_response là null nếu không có dữ liệu", () => {
    const payment = {
      id: 3,
      booking_id: 102,
      provider: "BANK_TRANSFER",
      amount: 100000,
      currency: "VND",
      status: "pending",
      transaction_code: "PAY-102-123456",
      created_at: new Date("2099-05-30T10:00:00"),
      updated_at: new Date("2099-05-30T10:10:00"),
    };

    const result = toPaymentResponse(payment);

    expect(result.paid_at).toBeNull();
    expect(result.raw_response).toBeNull();
    expect(result.booking).toBeNull();
  });
});