// src/modules/bookings/__tests__/bookings.mapper.test.js

import { describe, it, expect } from "vitest";
import {
  toBookingListItem,
  toBookingDetail,
  toOwnerBookingListItem,
  toOwnerBookingDetail,
  toAvailabilitySlot
} from "../bookings.mapper.js";

const mockBooking = {
  id: 1,
  field_id: 10,
  user_id: 5,
  start_datetime: new Date("2026-06-01T08:00:00"),
  end_datetime: new Date("2026-06-01T10:00:00"),
  status: "PAID",
  notes: "Đặt sân buổi sáng",
  approval_mode_snapshot: "AUTO",
  requested_payment_method: "BANK_TRANSFER",
  original_price: 200000,
  discount_amount: 50000,
  total_price: 150000,
  voucher_id: 3,
  checked_in_at: null,
  checked_in_by: null,
  checkin_method: null,
  payment_expires_at: new Date("2026-06-01T07:45:00"),
  created_at: new Date("2026-05-30T10:00:00"),

  fields: {
    id: 10,
    field_name: "Sân bóng đá A",
    address: "Quận 1, TP.HCM",
    sport_type: "Bóng đá",
    base_price_per_hour: 100000,
    currency: "VND"
  },

  users: {
    id: 5,
    name: "Nguyễn Văn A",
    email: "user@gmail.com",
    phone: "0909123456"
  },

  voucher: {
    id: 3,
    code: "SUMMER10",
    type: "FIXED",
    discount_value: "50000",
    max_discount_amount: null
  },

  reviews: [
    {
      id: 7,
      rating: 5,
      comment: "Sân tốt",
      created_at: new Date("2026-06-02T10:00:00")
    }
  ],

  booking_status_history: [
    {
      id: 1,
      from_status: "PENDING_CONFIRM",
      to_status: "AWAITING_PAYMENT",
      changed_at: new Date("2026-05-30T10:10:00"),
      reason: "Auto approved"
    },
    {
      id: 2,
      from_status: "AWAITING_PAYMENT",
      to_status: "PAID",
      changed_at: new Date("2026-05-30T10:20:00"),
      reason: null
    }
  ]
};

describe("bookings.mapper", () => {
  describe("toBookingListItem", () => {
    it("map đúng thông tin cơ bản của booking list item", () => {
      const result = toBookingListItem(mockBooking);

      expect(result.id).toBe(1);
      expect(result.field_id).toBe(10);
      expect(result.user_id).toBe(5);
      expect(result.status).toBe("PAID");
      expect(result.notes).toBe("Đặt sân buổi sáng");
      expect(result.original_price).toBe(200000);
      expect(result.discount_amount).toBe(50000);
      expect(result.total_price).toBe(150000);
      expect(result.approval_mode_snapshot).toBe("AUTO");
      expect(result.requested_payment_method).toBe("BANK_TRANSFER");
    });

    it("map đúng thông tin field trong booking list item", () => {
      const result = toBookingListItem(mockBooking);

      expect(result.field).toEqual({
        id: 10,
        field_name: "Sân bóng đá A",
        address: "Quận 1, TP.HCM",
        sport_type: "Bóng đá",
        base_price_per_hour: 100000,
        currency: "VND"
      });
    });

    it("map đúng voucher và chuyển discount_value sang number", () => {
      const result = toBookingListItem(mockBooking);

      expect(result.voucher).toEqual({
        id: 3,
        code: "SUMMER10",
        type: "FIXED",
        discount_value: 50000,
        max_discount_amount: null
      });
    });

    it("map đúng review đầu tiên nếu booking có review", () => {
      const result = toBookingListItem(mockBooking);

      expect(result.review).toEqual({
        id: 7,
        rating: 5,
        comment: "Sân tốt",
        created_at: new Date("2026-06-02T10:00:00")
      });
    });

    it("trả field, voucher, review là null nếu dữ liệu liên quan không tồn tại", () => {
      const bookingWithoutRelations = {
        ...mockBooking,
        fields: null,
        voucher: null,
        voucher_id: null,
        reviews: []
      };

      const result = toBookingListItem(bookingWithoutRelations);

      expect(result.field).toBeNull();
      expect(result.voucher).toBeNull();
      expect(result.review).toBeNull();
      expect(result.voucher_id).toBeNull();
    });
  });

  describe("toBookingDetail", () => {
    it("map đúng thông tin chi tiết booking gồm contact và status history", () => {
      const detailBooking = {
        ...mockBooking,
        contact_name: "Nguyễn Văn A",
        contact_email: "user@gmail.com",
        contact_phone: "0909123456"
      };

      const result = toBookingDetail(detailBooking);

      expect(result.contact_name).toBe("Nguyễn Văn A");
      expect(result.contact_email).toBe("user@gmail.com");
      expect(result.contact_phone).toBe("0909123456");

      expect(result.status_history).toHaveLength(2);
      expect(result.status_history[0]).toEqual({
        id: 1,
        from_status: "PENDING_CONFIRM",
        to_status: "AWAITING_PAYMENT",
        changed_at: new Date("2026-05-30T10:10:00"),
        reason: "Auto approved"
      });

      expect(result.status_history[1]).toEqual({
        id: 2,
        from_status: "AWAITING_PAYMENT",
        to_status: "PAID",
        changed_at: new Date("2026-05-30T10:20:00"),
        reason: null
      });
    });

    it("trả contact null và status_history rỗng nếu không có dữ liệu", () => {
      const detailBooking = {
        ...mockBooking,
        contact_name: undefined,
        contact_email: undefined,
        contact_phone: undefined,
        booking_status_history: undefined
      };

      const result = toBookingDetail(detailBooking);

      expect(result.contact_name).toBeNull();
      expect(result.contact_email).toBeNull();
      expect(result.contact_phone).toBeNull();
      expect(result.status_history).toEqual([]);
    });
  });

  describe("toOwnerBookingListItem", () => {
    it("map đúng thông tin booking cho owner gồm field và user", () => {
      const result = toOwnerBookingListItem(mockBooking);

      expect(result.id).toBe(1);
      expect(result.status).toBe("PAID");

      expect(result.field).toEqual({
        id: 10,
        field_name: "Sân bóng đá A",
        address: "Quận 1, TP.HCM",
        sport_type: "Bóng đá"
      });

      expect(result.user).toEqual({
        id: 5,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456"
      });
    });

    it("trả field và user là null nếu owner booking không có dữ liệu liên quan", () => {
      const bookingWithoutRelations = {
        ...mockBooking,
        fields: null,
        users: null
      };

      const result = toOwnerBookingListItem(bookingWithoutRelations);

      expect(result.field).toBeNull();
      expect(result.user).toBeNull();
    });
  });

  describe("toOwnerBookingDetail", () => {
    it("map đúng owner booking detail gồm user, field và status history", () => {
      const result = toOwnerBookingDetail(mockBooking);

      expect(result.user).toEqual({
        id: 5,
        name: "Nguyễn Văn A",
        email: "user@gmail.com",
        phone: "0909123456"
      });

      expect(result.field).toEqual({
        id: 10,
        field_name: "Sân bóng đá A",
        address: "Quận 1, TP.HCM",
        sport_type: "Bóng đá"
      });

      expect(result.status_history).toHaveLength(2);
      expect(result.status_history[1].reason).toBeNull();
    });
  });

  describe("toAvailabilitySlot", () => {
    it("map đúng availability slot còn trống", () => {
      const slot = {
        start_datetime: new Date("2026-06-01T08:00:00"),
        end_datetime: new Date("2026-06-01T09:00:00"),
        start_time: "08:00",
        end_time: "09:00",
        available: true,
        reason: null,
        booking_status: null
      };

      const result = toAvailabilitySlot(slot);

      expect(result).toEqual({
        start_datetime: new Date("2026-06-01T08:00:00"),
        end_datetime: new Date("2026-06-01T09:00:00"),
        start_time: "08:00",
        end_time: "09:00",
        available: true,
        reason: null,
        booking_status: null
      });
    });

    it("map đúng availability slot đã bị đặt", () => {
      const slot = {
        start_datetime: new Date("2026-06-01T09:00:00"),
        end_datetime: new Date("2026-06-01T10:00:00"),
        start_time: "09:00",
        end_time: "10:00",
        available: false,
        reason: "Khung giờ đã được đặt",
        booking_status: "PAID"
      };

      const result = toAvailabilitySlot(slot);

      expect(result).toEqual({
        start_datetime: new Date("2026-06-01T09:00:00"),
        end_datetime: new Date("2026-06-01T10:00:00"),
        start_time: "09:00",
        end_time: "10:00",
        available: false,
        reason: "Khung giờ đã được đặt",
        booking_status: "PAID"
      });
    });

    it("trả reason và booking_status là null nếu không có", () => {
      const slot = {
        start_datetime: new Date("2026-06-01T10:00:00"),
        end_datetime: new Date("2026-06-01T11:00:00"),
        start_time: "10:00",
        end_time: "11:00",
        available: true
      };

      const result = toAvailabilitySlot(slot);

      expect(result.reason).toBeNull();
      expect(result.booking_status).toBeNull();
    });
  });
});