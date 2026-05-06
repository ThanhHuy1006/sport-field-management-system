// src/modules/reviews/__tests__/reviews.mapper.test.js

import { describe, it, expect } from "vitest";
import { toReviewResponse } from "../reviews.mapper.js";

describe("reviews.mapper", () => {
  it("map đúng review response có user và field", () => {
    const review = {
      id: 1,
      booking_id: 10,
      field_id: 3,
      user_id: 5,
      rating: 5,
      comment: "Sân tốt",
      visible: true,
      reply_text: "Cảm ơn bạn đã đánh giá",
      reply_at: new Date("2099-06-02T10:00:00"),
      created_at: new Date("2099-06-01T10:00:00"),
      users: {
        id: 5,
        name: "Nguyễn Văn A",
        avatar_url: "/uploads/avatars/user.png",
      },
      fields: {
        id: 3,
        field_name: "Sân bóng đá A",
      },
    };

    const result = toReviewResponse(review);

    expect(result).toEqual({
      id: 1,
      booking_id: 10,
      field_id: 3,
      user_id: 5,
      rating: 5,
      comment: "Sân tốt",
      visible: true,
      reply_text: "Cảm ơn bạn đã đánh giá",
      reply_at: new Date("2099-06-02T10:00:00"),
      created_at: new Date("2099-06-01T10:00:00"),
      user: {
        id: 5,
        name: "Nguyễn Văn A",
        avatar_url: "/uploads/avatars/user.png",
      },
      field: {
        id: 3,
        field_name: "Sân bóng đá A",
      },
    });
  });

  it("trả null nếu item là null", () => {
    expect(toReviewResponse(null)).toBeNull();
  });

  it("trả user null nếu review không include users", () => {
    const review = {
      id: 1,
      booking_id: 10,
      field_id: 3,
      user_id: 5,
      rating: 4,
      comment: "Ổn",
      visible: true,
      reply_text: null,
      reply_at: null,
      created_at: new Date("2099-06-01T10:00:00"),
      users: null,
      fields: {
        id: 3,
        field_name: "Sân bóng đá A",
      },
    };

    const result = toReviewResponse(review);

    expect(result.user).toBeNull();
    expect(result.field).toEqual({
      id: 3,
      field_name: "Sân bóng đá A",
    });
  });

  it("trả field null nếu review không include fields", () => {
    const review = {
      id: 1,
      booking_id: 10,
      field_id: 3,
      user_id: 5,
      rating: 4,
      comment: "Ổn",
      visible: true,
      reply_text: null,
      reply_at: null,
      created_at: new Date("2099-06-01T10:00:00"),
      users: {
        id: 5,
        name: "Nguyễn Văn A",
        avatar_url: null,
      },
      fields: null,
    };

    const result = toReviewResponse(review);

    expect(result.field).toBeNull();
    expect(result.user).toEqual({
      id: 5,
      name: "Nguyễn Văn A",
      avatar_url: null,
    });
  });

  it("map đúng review chưa có phản hồi owner", () => {
    const review = {
      id: 2,
      booking_id: 11,
      field_id: 4,
      user_id: 6,
      rating: 3,
      comment: null,
      visible: true,
      reply_text: null,
      reply_at: null,
      created_at: new Date("2099-06-01T10:00:00"),
      users: null,
      fields: null,
    };

    const result = toReviewResponse(review);

    expect(result.comment).toBeNull();
    expect(result.reply_text).toBeNull();
    expect(result.reply_at).toBeNull();
    expect(result.user).toBeNull();
    expect(result.field).toBeNull();
  });
});