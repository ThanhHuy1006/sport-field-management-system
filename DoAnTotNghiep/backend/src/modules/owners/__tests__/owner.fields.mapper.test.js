// src/modules/owners/__tests__/owner.fields.mapper.test.js

import { describe, it, expect } from "vitest";
import { toOwnerFieldResponse } from "../owner.fields.mapper.js";

describe("owner.fields.mapper", () => {
  it("map đúng owner field response", () => {
    const field = {
      id: 1,
      owner_id: 10,
      field_name: "Sân bóng đá A",
      sport_type: "Bóng đá",
      description: "Sân 5 người",

      address: "Quận 1, TP.HCM",
      address_line: "123 Nguyễn Trãi",
      ward: "Phường 1",
      district: "Quận 1",
      province: "TP.HCM",

      latitude: "10.123",
      longitude: "106.456",
      base_price_per_hour: "100000",
      currency: "VND",
      status: "active",
      approval_mode: "AUTO",
      min_duration_minutes: 60,
      max_players: 10,
      created_at: new Date("2099-01-01T00:00:00"),
      updated_at: new Date("2099-01-02T00:00:00"),

      field_pricing_rules: [
        {
          id: 1,
          day_type: "WEEKDAY",
          start_time: "00:00",
          end_time: "23:59",
          price: "100000",
          currency: "VND",
          priority: 0,
          active: true,
        },
        {
          id: 2,
          day_type: "WEEKEND",
          start_time: "00:00",
          end_time: "23:59",
          price: "150000",
          currency: "VND",
          priority: 0,
          active: true,
        },
      ],

      operating_hours: [
        {
          id: 1,
          day_of_week: 1,
          open_time: "06:00",
          close_time: "22:00",
        },
        {
          id: 2,
          day_of_week: 2,
          open_time: "06:00",
          close_time: "22:00",
        },
      ],

      field_facilities: [
        {
          facility_id: 1,
          note: "Có wifi miễn phí",
          facilities: {
            name: "Wifi",
            icon: "wifi",
          },
        },
        {
          facility_id: 2,
          note: null,
          facilities: {
            name: "Bãi xe",
            icon: "parking",
          },
        },
      ],

      field_images: [
        {
          id: 1,
          url: "/uploads/fields/a.png",
          is_primary: true,
          order_no: 1,
        },
        {
          id: 2,
          url: "/uploads/fields/b.png",
          is_primary: false,
          order_no: 2,
        },
      ],
    };

    const result = toOwnerFieldResponse(field);

    expect(result).toMatchObject({
      id: 1,
      owner_id: 10,
      field_name: "Sân bóng đá A",
      sport_type: "Bóng đá",
      description: "Sân 5 người",

      address: "Quận 1, TP.HCM",
      address_line: "123 Nguyễn Trãi",
      ward: "Phường 1",
      district: "Quận 1",
      province: "TP.HCM",

      latitude: 10.123,
      longitude: 106.456,
      base_price_per_hour: 100000,
      currency: "VND",
      status: "active",
      approval_mode: "AUTO",
      min_duration_minutes: 60,
      max_players: 10,
      created_at: new Date("2099-01-01T00:00:00"),
      updated_at: new Date("2099-01-02T00:00:00"),
    });

    expect(result.pricing_rules).toEqual([
      {
        id: 1,
        day_type: "WEEKDAY",
        start_time: "00:00",
        end_time: "23:59",
        price: 100000,
        currency: "VND",
        priority: 0,
        active: true,
      },
      {
        id: 2,
        day_type: "WEEKEND",
        start_time: "00:00",
        end_time: "23:59",
        price: 150000,
        currency: "VND",
        priority: 0,
        active: true,
      },
    ]);

    expect(result.operating_hours).toEqual([
      {
        id: 1,
        day_of_week: 1,
        open_time: "06:00",
        close_time: "22:00",
      },
      {
        id: 2,
        day_of_week: 2,
        open_time: "06:00",
        close_time: "22:00",
      },
    ]);

    expect(result.amenities).toEqual([
      {
        id: 1,
        name: "Wifi",
        icon: "wifi",
        note: "Có wifi miễn phí",
      },
      {
        id: 2,
        name: "Bãi xe",
        icon: "parking",
        note: null,
      },
    ]);

    expect(result.images).toEqual([
      {
        id: 1,
        url: "/uploads/fields/a.png",
        is_primary: true,
        order_no: 1,
      },
      {
        id: 2,
        url: "/uploads/fields/b.png",
        is_primary: false,
        order_no: 2,
      },
    ]);
  });

  it("trả null nếu item là null", () => {
    expect(toOwnerFieldResponse(null)).toBeNull();
  });

  it("map latitude, longitude null và base_price_per_hour là 0 nếu không có dữ liệu", () => {
    const result = toOwnerFieldResponse({
      id: 1,
      owner_id: 10,
      field_name: "Sân bóng đá A",
      sport_type: "Bóng đá",
      description: null,

      address: "Quận 1",
      address_line: null,
      ward: null,
      district: null,
      province: null,

      latitude: null,
      longitude: null,
      base_price_per_hour: null,
      currency: "VND",
      status: "pending",
      approval_mode: "MANUAL",
      min_duration_minutes: 60,
      max_players: null,
      created_at: new Date("2099-01-01T00:00:00"),
      updated_at: null,

      field_pricing_rules: [],
      operating_hours: [],
      field_facilities: [],
      field_images: [],
    });

    expect(result.latitude).toBeNull();
    expect(result.longitude).toBeNull();
    expect(result.base_price_per_hour).toBe(0);

    expect(result.pricing_rules).toEqual([]);
    expect(result.operating_hours).toEqual([]);
    expect(result.amenities).toEqual([]);
    expect(result.images).toEqual([]);
  });

  it("trả các mảng rỗng nếu relation không tồn tại", () => {
    const result = toOwnerFieldResponse({
      id: 1,
      owner_id: 10,
      field_name: "Sân bóng đá A",
      sport_type: "Bóng đá",
      description: null,

      address: "Quận 1",
      latitude: null,
      longitude: null,
      base_price_per_hour: 100000,
      currency: "VND",
      status: "active",
      min_duration_minutes: 60,
      max_players: null,
      created_at: new Date("2099-01-01T00:00:00"),
    });

    expect(result.pricing_rules).toEqual([]);
    expect(result.operating_hours).toEqual([]);
    expect(result.amenities).toEqual([]);
    expect(result.images).toEqual([]);
  });

  it("map facility thiếu thông tin facilities thành null", () => {
    const result = toOwnerFieldResponse({
      id: 1,
      owner_id: 10,
      field_name: "Sân bóng đá A",
      sport_type: "Bóng đá",
      description: null,
      address: "Quận 1",
      latitude: null,
      longitude: null,
      base_price_per_hour: 100000,
      currency: "VND",
      status: "active",
      min_duration_minutes: 60,
      max_players: null,
      created_at: new Date("2099-01-01T00:00:00"),

      field_facilities: [
        {
          facility_id: 1,
          note: undefined,
          facilities: null,
        },
      ],
    });

    expect(result.amenities).toEqual([
      {
        id: 1,
        name: null,
        icon: null,
        note: null,
      },
    ]);
  });

  it("map price null thành 0 trong pricing_rules", () => {
    const result = toOwnerFieldResponse({
      id: 1,
      owner_id: 10,
      field_name: "Sân bóng đá A",
      sport_type: "Bóng đá",
      description: null,
      address: "Quận 1",
      latitude: null,
      longitude: null,
      base_price_per_hour: 100000,
      currency: "VND",
      status: "active",
      min_duration_minutes: 60,
      max_players: null,
      created_at: new Date("2099-01-01T00:00:00"),

      field_pricing_rules: [
        {
          id: 1,
          day_type: "WEEKDAY",
          start_time: "00:00",
          end_time: "23:59",
          price: null,
          currency: "VND",
          priority: 0,
          active: true,
        },
      ],
    });

    expect(result.pricing_rules[0].price).toBe(0);
  });
});