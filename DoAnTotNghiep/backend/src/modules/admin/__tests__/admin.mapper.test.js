// src/modules/admin/__tests__/admin.mapper.test.js

import { describe, it, expect } from "vitest";
import {
  toAdminUserResponse,
  toAdminOwnerRegistrationResponse,
  toAdminFieldResponse,
  toAdminBookingResponse,
  toAdminDashboardSummaryResponse,
} from "../admin.mapper.js";

describe("admin.mapper", () => {
  describe("toAdminUserResponse", () => {
    it("map đúng admin user response có owner profile dạng object", () => {
      const user = {
        id: 1,
        name: "Owner A",
        email: "owner@gmail.com",
        phone: "0909123456",
        avatar_url: "/uploads/avatars/owner.png",
        role: "OWNER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
        updated_at: new Date("2099-01-02T00:00:00"),
        password_hash: "secret",
        owner_profiles_owner_profiles_user_idTousers: {
          status: "approved",
          business_name: "Sân A",
          tax_code: "TAX001",
          address: "Quận 1",
          license_url: "/uploads/docs/license.pdf",
          id_front_url: "/uploads/docs/front.png",
          id_back_url: "/uploads/docs/back.png",
          approved_at: new Date("2099-01-03T00:00:00"),
          reject_reason: null,
        },
      };

      const result = toAdminUserResponse(user);

      expect(result).toEqual({
        id: 1,
        name: "Owner A",
        email: "owner@gmail.com",
        phone: "0909123456",
        avatar_url: "/uploads/avatars/owner.png",
        role: "OWNER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
        updated_at: new Date("2099-01-02T00:00:00"),
        owner_profile: {
          status: "approved",
          business_name: "Sân A",
          tax_code: "TAX001",
          address: "Quận 1",
          license_url: "/uploads/docs/license.pdf",
          id_front_url: "/uploads/docs/front.png",
          id_back_url: "/uploads/docs/back.png",
          approved_at: new Date("2099-01-03T00:00:00"),
          reject_reason: null,
        },
      });

      expect(result.password_hash).toBeUndefined();
    });

    it("map owner_profile null nếu user không có owner profile", () => {
      const result = toAdminUserResponse({
        id: 2,
        name: "User A",
        email: "user@gmail.com",
        phone: null,
        avatar_url: null,
        role: "USER",
        status: "active",
        created_at: new Date("2099-01-01T00:00:00"),
        updated_at: null,
        owner_profiles_owner_profiles_user_idTousers: null,
      });

      expect(result.owner_profile).toBeNull();
      expect(result.updated_at).toBeNull();
    });

    it("trả null nếu item null", () => {
      expect(toAdminUserResponse(null)).toBeNull();
    });
  });

  describe("toAdminOwnerRegistrationResponse", () => {
    it("map đúng hồ sơ đăng ký owner", () => {
      const registration = {
        user_id: 10,
        business_name: "Sân bóng A",
        tax_code: "TAX001",
        address: "Quận 1",
        license_url: "/uploads/docs/license.pdf",
        id_front_url: "/uploads/docs/front.png",
        id_back_url: "/uploads/docs/back.png",
        status: "pending",
        approved_by: 1,
        approved_at: null,
        reject_reason: null,
        created_at: new Date("2099-01-01T00:00:00"),
        users_owner_profiles_user_idTousers: {
          id: 10,
          name: "Owner A",
          email: "owner@gmail.com",
          phone: "0909123456",
          role: "USER",
          status: "active",
        },
        users_owner_profiles_approved_byTousers: {
          id: 1,
          name: "Admin",
          email: "admin@gmail.com",
        },
      };

      const result = toAdminOwnerRegistrationResponse(registration);

      expect(result).toEqual({
        user_id: 10,
        business_name: "Sân bóng A",
        tax_code: "TAX001",
        address: "Quận 1",
        license_url: "/uploads/docs/license.pdf",
        id_front_url: "/uploads/docs/front.png",
        id_back_url: "/uploads/docs/back.png",
        status: "pending",
        approved_by: 1,
        approved_at: null,
        reject_reason: null,
        created_at: new Date("2099-01-01T00:00:00"),
        user: {
          id: 10,
          name: "Owner A",
          email: "owner@gmail.com",
          phone: "0909123456",
          role: "USER",
          status: "active",
        },
        reviewed_by: {
          id: 1,
          name: "Admin",
          email: "admin@gmail.com",
        },
      });
    });

    it("trả user và reviewed_by null nếu không include relation", () => {
      const result = toAdminOwnerRegistrationResponse({
        user_id: 10,
        business_name: "Sân bóng A",
        tax_code: null,
        address: null,
        license_url: null,
        id_front_url: null,
        id_back_url: null,
        status: "pending",
        approved_by: null,
        approved_at: null,
        reject_reason: null,
        created_at: new Date("2099-01-01T00:00:00"),
        users_owner_profiles_user_idTousers: null,
        users_owner_profiles_approved_byTousers: null,
      });

      expect(result.user).toBeNull();
      expect(result.reviewed_by).toBeNull();
    });

    it("trả null nếu item null", () => {
      expect(toAdminOwnerRegistrationResponse(null)).toBeNull();
    });
  });

  describe("toAdminFieldResponse", () => {
    it("map đúng admin field response", () => {
      const field = {
        id: 1,
        owner_id: 10,
        field_name: "Sân bóng A",
        sport_type: "Bóng đá",
        description: "Sân 5 người",
        address: "Quận 1",
        latitude: "10.123",
        longitude: "106.456",
        base_price_per_hour: "100000",
        currency: "VND",
        status: "pending",
        reject_reason: null,
        min_duration_minutes: 60,
        max_players: 10,
        created_at: new Date("2099-01-01T00:00:00"),
        users: {
          id: 10,
          name: "Owner A",
          email: "owner@gmail.com",
        },
        field_images: [
          {
            id: 1,
            url: "/uploads/fields/a.png",
            is_primary: true,
            order_no: 1,
          },
        ],
      };

      const result = toAdminFieldResponse(field);

      expect(result).toEqual({
        id: 1,
        owner_id: 10,
        field_name: "Sân bóng A",
        sport_type: "Bóng đá",
        description: "Sân 5 người",
        address: "Quận 1",
        latitude: 10.123,
        longitude: 106.456,
        base_price_per_hour: 100000,
        currency: "VND",
        status: "pending",
        reject_reason: null,
        min_duration_minutes: 60,
        max_players: 10,
        created_at: new Date("2099-01-01T00:00:00"),
        owner: {
          id: 10,
          name: "Owner A",
          email: "owner@gmail.com",
        },
        primary_image: {
          id: 1,
          url: "/uploads/fields/a.png",
          is_primary: true,
          order_no: 1,
        },
      });
    });

    it("map số null về latitude/longitude null và base_price_per_hour 0", () => {
      const result = toAdminFieldResponse({
        id: 1,
        owner_id: 10,
        field_name: "Sân bóng A",
        sport_type: "Bóng đá",
        description: null,
        address: "Quận 1",
        latitude: null,
        longitude: null,
        base_price_per_hour: null,
        currency: "VND",
        status: "pending",
        reject_reason: undefined,
        min_duration_minutes: 60,
        max_players: null,
        created_at: new Date("2099-01-01T00:00:00"),
        users: null,
        field_images: [],
      });

      expect(result.latitude).toBeNull();
      expect(result.longitude).toBeNull();
      expect(result.base_price_per_hour).toBe(0);
      expect(result.reject_reason).toBeNull();
      expect(result.owner).toBeNull();
      expect(result.primary_image).toBeNull();
    });

    it("trả null nếu item null", () => {
      expect(toAdminFieldResponse(null)).toBeNull();
    });
  });

  describe("toAdminBookingResponse", () => {
    it("map đúng admin booking response", () => {
      const booking = {
        id: 1,
        field_id: 2,
        user_id: 3,
        start_datetime: new Date("2099-06-01T08:00:00"),
        end_datetime: new Date("2099-06-01T10:00:00"),
        status: "PAID",
        total_price: "200000",
        notes: null,
        checked_in_at: null,
        checked_in_by: null,
        checkin_method: null,
        created_at: new Date("2099-05-30T10:00:00"),
        updated_at: new Date("2099-05-30T11:00:00"),
        users: {
          id: 3,
          name: "User A",
          email: "user@gmail.com",
          phone: "0909123456",
        },
        fields: {
          id: 2,
          field_name: "Sân bóng A",
          address: "Quận 1",
          sport_type: "Bóng đá",
          owner_id: 10,
        },
        payments: [
          {
            id: 1,
            provider: "BANK_TRANSFER",
            amount: "200000",
            currency: "VND",
            status: "success",
            transaction_code: "PAY-1",
            paid_at: new Date("2099-05-30T10:30:00"),
            created_at: new Date("2099-05-30T10:00:00"),
          },
        ],
        booking_status_history: [
          {
            id: 1,
            from_status: "AWAITING_PAYMENT",
            to_status: "PAID",
            changed_at: new Date("2099-05-30T10:30:00"),
            reason: null,
            note: "Thanh toán thành công",
          },
        ],
      };

      const result = toAdminBookingResponse(booking);

      expect(result).toEqual({
        id: 1,
        field_id: 2,
        user_id: 3,
        start_datetime: new Date("2099-06-01T08:00:00"),
        end_datetime: new Date("2099-06-01T10:00:00"),
        status: "PAID",
        total_price: 200000,
        notes: null,
        checked_in_at: null,
        checked_in_by: null,
        checkin_method: null,
        created_at: new Date("2099-05-30T10:00:00"),
        updated_at: new Date("2099-05-30T11:00:00"),
        user: {
          id: 3,
          name: "User A",
          email: "user@gmail.com",
          phone: "0909123456",
        },
        field: {
          id: 2,
          field_name: "Sân bóng A",
          address: "Quận 1",
          sport_type: "Bóng đá",
          owner_id: 10,
        },
        payments: [
          {
            id: 1,
            provider: "BANK_TRANSFER",
            amount: 200000,
            currency: "VND",
            status: "success",
            transaction_code: "PAY-1",
            paid_at: new Date("2099-05-30T10:30:00"),
            created_at: new Date("2099-05-30T10:00:00"),
          },
        ],
        status_history: [
          {
            id: 1,
            from_status: "AWAITING_PAYMENT",
            to_status: "PAID",
            changed_at: new Date("2099-05-30T10:30:00"),
            reason: "Thanh toán thành công",
          },
        ],
      });
    });

    it("map relations rỗng nếu không include user, field, payments, history", () => {
      const result = toAdminBookingResponse({
        id: 1,
        field_id: 2,
        user_id: 3,
        start_datetime: new Date("2099-06-01T08:00:00"),
        end_datetime: new Date("2099-06-01T10:00:00"),
        status: "PENDING_CONFIRM",
        total_price: null,
        created_at: new Date("2099-05-30T10:00:00"),
        users: null,
        fields: null,
        payments: null,
        booking_status_history: null,
      });

      expect(result.total_price).toBe(0);
      expect(result.user).toBeNull();
      expect(result.field).toBeNull();
      expect(result.payments).toEqual([]);
      expect(result.status_history).toEqual([]);
    });

    it("trả null nếu item null", () => {
      expect(toAdminBookingResponse(null)).toBeNull();
    });
  });

  describe("toAdminDashboardSummaryResponse", () => {
    it("map đúng dashboard summary", () => {
      const result = toAdminDashboardSummaryResponse({
        total_users: 10,
        total_approved_owners: 3,
        total_fields: 8,
        total_bookings: 20,
        total_revenue: 5000000,
      });

      expect(result).toEqual({
        total_users: 10,
        total_approved_owners: 3,
        total_fields: 8,
        total_bookings: 20,
        total_revenue: 5000000,
      });
    });
  });
});