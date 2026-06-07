import jwt from "jsonwebtoken";
import { bookingsRepository } from "./bookings.repository.js";
import { vouchersService } from "../vouchers/vouchers.service.js";
import {
  AuthError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../core/errors/index.js";
import { notificationsService } from "../notifications/notifications.service.js";

const CHECKIN_EARLY_MINUTES = 30;
const CHECKIN_LATE_MINUTES = 60;
const PAYMENT_EXPIRE_MINUTES = 30;
const MAX_ACTIVE_BOOKINGS_PER_USER_PER_DAY = 3;

// Nếu tạo booking thành công nhưng tạo notification lỗi
// → Không nên làm booking fail
// → Chỉ log lỗi notification
async function safeCreateNotification(payload) {
  try {
    await notificationsService.createNotification(payload);
  } catch (error) {
    console.error("[NOTIFICATION_ERROR]", error);
  }
}

function diffMinutes(start, end) {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

function getDayOfWeek(date) {
  const jsDay = date.getDay();

  // JavaScript: Sunday = 0
  // DB operating_hours: Monday = 1 ... Sunday = 7
  return jsDay === 0 ? 7 : jsDay;
}
function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatLocalDate(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(
    date.getDate(),
  )}`;
}

function combineDateAndTime(date, timeStr) {
  return new Date(`${formatLocalDate(date)}T${timeStr}`);
}

function combineDateStringAndTime(dateString, timeStr) {
  return new Date(`${dateString}T${timeStr}`);
}

function startOfLocalDay(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function startOfNextLocalDay(dateString) {
  const start = startOfLocalDay(dateString);
  start.setDate(start.getDate() + 1);
  return start;
}

function startOfLocalDayFromDate(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

function startOfNextLocalDayFromDate(date) {
  const start = startOfLocalDayFromDate(date);
  start.setDate(start.getDate() + 1);
  return start;
}

function isWithinOperatingHours(start, end, operatingHour) {
  const open = combineDateAndTime(start, operatingHour.open_time);
  const close = combineDateAndTime(start, operatingHour.close_time);

  return start >= open && end <= close;
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function assertFutureBooking(startDatetime) {
  if (startDatetime <= new Date()) {
    throw new ValidationError("Không thể đặt sân ở thời điểm đã qua");
  }
}

function assertCheckInWindow(startDatetime) {
  const now = new Date();
  const start = new Date(startDatetime);

  const openWindow = new Date(
    start.getTime() - CHECKIN_EARLY_MINUTES * 60 * 1000,
  );

  const closeWindow = new Date(
    start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000,
  );

  if (now < openWindow) {
    throw new ForbiddenError("Chưa tới thời gian cho phép check-in");
  }

  if (now > closeWindow) {
    throw new ForbiddenError("Đã quá thời gian cho phép check-in");
  }
}

async function syncBookingLifecycle() {
  await bookingsRepository.syncBookingLifecycle();
}

function assertCanCheckInBooking(booking) {
  if (!booking) {
    throw new NotFoundError("Không tìm thấy booking");
  }

  if (booking.checked_in_at || booking.status === "CHECKED_IN") {
    throw new ConflictError("Booking đã được check-in trước đó");
  }

  if (booking.status === "COMPLETED") {
    throw new ConflictError("Booking đã hoàn thành");
  }

  if (["CANCELLED", "REJECTED"].includes(booking.status)) {
    throw new ForbiddenError("Booking đã bị hủy hoặc bị từ chối");
  }

  const paymentMethod = booking.requested_payment_method || "ONSITE";

  if (paymentMethod === "BANK_TRANSFER" && booking.status !== "PAID") {
    throw new ForbiddenError(
      "Booking chuyển khoản phải thanh toán thành công trước khi check-in",
    );
  }

  if (paymentMethod === "ONSITE" && booking.status !== "APPROVED") {
    throw new ForbiddenError(
      "Booking thanh toán tại sân phải được xác nhận trước khi check-in",
    );
  }

  // Nếu muốn chặn check-in quá sớm / quá trễ thì mở dòng này:
  // assertCheckInWindow(booking.start_datetime);
}

async function assertBookableField(valid) {
  const field = await bookingsRepository.findFieldById(valid.field_id);

  if (!field) {
    throw new NotFoundError("Không tìm thấy sân");
  }

  if (field.status !== "active") {
    throw new ForbiddenError("Sân hiện không khả dụng");
  }

  const minDuration = Number(field.min_duration_minutes || 60);
  const duration = diffMinutes(valid.start_datetime, valid.end_datetime);

  if (duration <= 0) {
    throw new ValidationError("Khoảng thời gian đặt không hợp lệ");
  }

  if (duration % minDuration !== 0) {
    throw new ValidationError(
      `Thời lượng đặt phải chia hết cho ${minDuration} phút`,
    );
  }

  assertFutureBooking(valid.start_datetime);

  const dayOfWeek = getDayOfWeek(valid.start_datetime);

  const operatingHour = await bookingsRepository.findOperatingHourByFieldAndDay(
    field.id,
    dayOfWeek,
  );

  if (!operatingHour) {
    throw new ForbiddenError("Sân không hoạt động vào ngày này");
  }

  if (
    !isWithinOperatingHours(
      valid.start_datetime,
      valid.end_datetime,
      operatingHour,
    )
  ) {
    throw new ForbiddenError("Khung giờ đặt nằm ngoài giờ hoạt động của sân");
  }

  return {
    field,
    minDuration,
    operatingHour,
  };
}

async function assertRescheduleSlotAvailable(
  fieldId,
  startDatetime,
  endDatetime,
  bookingId,
) {
  const { field } = await assertBookableField({
    field_id: fieldId,
    start_datetime: startDatetime,
    end_datetime: endDatetime,
  });

  const blackout = await bookingsRepository.findBlackoutByFieldAndRange(
    field.id,
    startDatetime,
    endDatetime,
  );

  if (blackout) {
    throw new ConflictError("Khung giờ mới đang bị khóa hoặc bảo trì");
  }

  const conflicts = await bookingsRepository.findConflictingBookingsExceptSelf(
    field.id,
    startDatetime,
    endDatetime,
    bookingId,
  );

  if (conflicts.length > 0) {
    throw new ConflictError("Khung giờ mới đã được đặt");
  }

  return field;
}

function assertSameBookingDuration(booking, payload) {
  const oldDuration = diffMinutes(
    new Date(booking.start_datetime),
    new Date(booking.end_datetime),
  );

  const newDuration = diffMinutes(
    new Date(payload.start_datetime),
    new Date(payload.end_datetime),
  );

  if (oldDuration !== newDuration) {
    throw new ValidationError("Không được thay đổi thời lượng khi đổi lịch");
  }
}

export const bookingsService = {
  async getAvailabilitySlots(query) {
    const field = await bookingsRepository.findFieldById(query.field_id);

    if (!field) {
      throw new NotFoundError("Không tìm thấy sân");
    }

    if (field.status !== "active") {
      throw new ForbiddenError("Sân hiện không khả dụng");
    }

    const minDuration = Number(field.min_duration_minutes || 60);
    const durationMinutes = Number(query.duration_minutes || minDuration);

    if (durationMinutes % minDuration !== 0) {
      throw new ValidationError(
        `duration_minutes phải chia hết cho ${minDuration}`,
      );
    }

    const dayStart = startOfLocalDay(query.date);
    const dayEnd = startOfNextLocalDay(query.date);
    const dayOfWeek = getDayOfWeek(dayStart);

    const operatingHour =
      await bookingsRepository.findOperatingHourByFieldAndDay(
        field.id,
        dayOfWeek,
      );

    if (!operatingHour) {
      return {
        field,
        date: query.date,
        is_open: false,
        open_time: null,
        close_time: null,
        slot_step_minutes: minDuration,
        duration_minutes: durationMinutes,
        slots: [],
      };
    }

    const [blackouts, bookings] = await Promise.all([
      bookingsRepository.findBlackoutsByFieldAndDate(
        field.id,
        dayStart,
        dayEnd,
      ),
      bookingsRepository.findBookingsByFieldAndDate(field.id, dayStart, dayEnd),
    ]);

    const open = combineDateStringAndTime(query.date, operatingHour.open_time);
    const close = combineDateStringAndTime(
      query.date,
      operatingHour.close_time,
    );

    const slots = [];
    const now = new Date();

    for (
      let cursor = new Date(open);
      cursor.getTime() + durationMinutes * 60000 <= close.getTime();
      cursor = new Date(cursor.getTime() + minDuration * 60000)
    ) {
      const slotStart = new Date(cursor);
      const slotEnd = new Date(cursor.getTime() + durationMinutes * 60000);

      const blackout = blackouts.find((item) =>
        overlaps(
          slotStart,
          slotEnd,
          new Date(item.start_datetime),
          new Date(item.end_datetime),
        ),
      );

      const conflict = bookings.find((item) =>
        overlaps(
          slotStart,
          slotEnd,
          new Date(item.start_datetime),
          new Date(item.end_datetime),
        ),
      );

      let available = true;
      let reason = null;
      let booking_status = null;

      if (slotStart <= now) {
        available = false;
        reason = "Khung giờ đã qua";
      } else if (blackout) {
        available = false;
        reason = blackout.reason || "Khung giờ đang bị khóa";
      } else if (conflict) {
        available = false;
        reason = "Khung giờ đã được đặt";
        booking_status = conflict.status;
      }

      slots.push({
        start_datetime: slotStart.toISOString(),
        end_datetime: slotEnd.toISOString(),
        start_time: `${pad2(slotStart.getHours())}:${pad2(
          slotStart.getMinutes(),
        )}`,
        end_time: `${pad2(slotEnd.getHours())}:${pad2(slotEnd.getMinutes())}`,
        available,
        reason,
        booking_status,
      });
    }

    return {
      field,
      date: query.date,
      is_open: true,
      open_time: operatingHour.open_time,
      close_time: operatingHour.close_time,
      slot_step_minutes: minDuration,
      duration_minutes: durationMinutes,
      slots,
    };
  },

  async checkAvailability(payload) {
    const { field } = await assertBookableField(payload);

    const blackout = await bookingsRepository.findBlackoutByFieldAndRange(
      field.id,
      payload.start_datetime,
      payload.end_datetime,
    );

    if (blackout) {
      return {
        available: false,
        reason: "Ngày/giờ này đang bị khóa",
      };
    }

    const conflicts = await bookingsRepository.findConflictingBookings(
      field.id,
      payload.start_datetime,
      payload.end_datetime,
    );

    if (conflicts.length > 0) {
      return {
        available: false,
        reason: "Khung giờ đã được đặt",
        conflicts,
      };
    }

    const duration = diffMinutes(payload.start_datetime, payload.end_datetime);
    const total_price = (duration / 60) * Number(field.base_price_per_hour);

    return {
      available: true,
      total_price,
      field,
    };
  },

  async createBooking(currentUser, payload) {
    if (!currentUser || String(currentUser.role).toUpperCase() !== "USER") {
      throw new ForbiddenError("Chỉ khách hàng mới được đặt sân");
    }

    await syncBookingLifecycle();

    const userId = currentUser.id;

    const bookingDayStart = startOfLocalDayFromDate(payload.start_datetime);
    const bookingDayEnd = startOfNextLocalDayFromDate(payload.start_datetime);

    const totalBookingsToday =
      await bookingsRepository.countUserActiveBookingsByDate(
        userId,
        bookingDayStart,
        bookingDayEnd,
      );

    if (totalBookingsToday >= MAX_ACTIVE_BOOKINGS_PER_USER_PER_DAY) {
      throw new ForbiddenError(
        `Mỗi người dùng chỉ được đặt tối đa ${MAX_ACTIVE_BOOKINGS_PER_USER_PER_DAY} lịch trong một ngày`,
      );
    }

    const availability = await this.checkAvailability(payload);

    if (!availability.available) {
      throw new ConflictError(
        availability.reason || "Khung giờ không khả dụng",
      );
    }

    const field = availability.field;
    const approvalMode = field.approval_mode || "MANUAL";
    const requestedPaymentMethod = payload.requested_payment_method || "ONSITE";

    const originalPrice = Number(availability.total_price);
    let discountAmount = 0;
    let finalPrice = originalPrice;
    let voucherId = null;

    if (payload.voucher_code) {
      const voucherResult = await vouchersService.validateVoucher(userId, {
        code: payload.voucher_code,
        order_amount: originalPrice,
        owner_id: field.owner_id,
      });

      voucherId = voucherResult.voucher.id;
      discountAmount = Number(voucherResult.discount_amount || 0);
      finalPrice = Number(voucherResult.final_amount || originalPrice);
    }

    let initialStatus = "PENDING_CONFIRM";

    if (approvalMode === "AUTO") {
      initialStatus =
        requestedPaymentMethod === "BANK_TRANSFER"
          ? "AWAITING_PAYMENT"
          : "APPROVED";
    }

    const paymentExpiresAt =
      initialStatus === "AWAITING_PAYMENT"
        ? new Date(Date.now() + PAYMENT_EXPIRE_MINUTES * 60 * 1000)
        : null;

    const booking = await bookingsRepository.createBookingWithHistory({
      field_id: payload.field_id,
      user_id: userId,
      start_datetime: payload.start_datetime,
      end_datetime: payload.end_datetime,
      notes: payload.notes,
      contact_name: payload.contact_name,
      contact_email: payload.contact_email,
      contact_phone: payload.contact_phone,
      approval_mode_snapshot: approvalMode,
      requested_payment_method: requestedPaymentMethod,

      original_price: originalPrice,
      discount_amount: discountAmount,
      total_price: finalPrice,
      voucher_id: voucherId,

      status: initialStatus,
      payment_expires_at: paymentExpiresAt,
    });

    await safeCreateNotification({
      user_id: booking.user_id,
      title: "Đặt sân thành công",
      body:
        initialStatus === "AWAITING_PAYMENT"
          ? "Yêu cầu đặt sân của bạn đã được xác nhận tự động. Vui lòng tiến hành thanh toán."
          : "Yêu cầu đặt sân của bạn đã được ghi nhận. Vui lòng chờ chủ sân xác nhận.",
      type: "BOOKING",
    });

    const ownerId = booking.fields?.owner_id || field.owner_id;

    if (ownerId) {
      await safeCreateNotification({
        user_id: ownerId,
        title: "Có yêu cầu đặt sân mới",
        body: `Sân ${
          field.field_name || "của bạn"
        } vừa có một yêu cầu đặt sân mới.`,
        type: "BOOKING",
      });
    }

    return booking;
  },

  async getMyBookings(userId, query) {
    await syncBookingLifecycle();

    const { items, total } = await bookingsRepository.findMyBookings(
      userId,
      query,
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getMyBookingDetail(userId, bookingId) {
    await syncBookingLifecycle();

    const booking = await bookingsRepository.findMyBookingById(
      userId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    return booking;
  },

  async cancelMyBooking(userId, bookingId) {
    const booking = await bookingsRepository.findMyBookingById(
      userId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (
      !["PENDING_CONFIRM", "APPROVED", "AWAITING_PAYMENT"].includes(
        booking.status,
      )
    ) {
      throw new ForbiddenError("Booking hiện không thể hủy");
    }

    if (new Date() >= new Date(booking.start_datetime)) {
      throw new ForbiddenError("Không thể hủy booking đã bắt đầu hoặc đã qua");
    }

    const cancelledBooking = await bookingsRepository.cancelMyBooking(
      userId,
      bookingId,
    );

    const ownerId = cancelledBooking.fields?.owner_id;

    if (ownerId) {
      await safeCreateNotification({
        user_id: ownerId,
        title: "Khách hàng đã hủy đơn đặt sân",
        body: `Một đơn đặt sân tại sân ${
          cancelledBooking.fields?.field_name || ""
        } đã bị khách hàng hủy.`,
        type: "BOOKING",
      });
    }

    return cancelledBooking;
  },

  async getMyBookingCheckInQr(userId, bookingId) {
    await syncBookingLifecycle();

    const booking = await bookingsRepository.findMyBookingById(
      userId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    const paymentMethod = booking.requested_payment_method || "ONSITE";

    const canGetQr =
      booking.status === "PAID" ||
      (booking.status === "APPROVED" && paymentMethod === "ONSITE");

    if (!canGetQr) {
      throw new ForbiddenError("Booking hiện chưa thể tạo mã check-in");
    }

    if (booking.checked_in_at) {
      throw new ConflictError("Booking đã được check-in");
    }

    const secret = process.env.CHECKIN_QR_SECRET;

    if (!secret) {
      throw new Error("CHECKIN_QR_SECRET chưa được cấu hình");
    }

    const start = new Date(booking.start_datetime);
    const expiresAt = new Date(
      start.getTime() + CHECKIN_LATE_MINUTES * 60 * 1000,
    );

    const expiresInSeconds = Math.max(
      60,
      Math.floor((expiresAt.getTime() - Date.now()) / 1000),
    );

    const qr_token = jwt.sign(
      {
        bookingId: booking.id,
        userId: booking.user_id,
        type: "BOOKING_CHECKIN",
      },
      secret,
      { expiresIn: expiresInSeconds },
    );

    return {
      booking_id: booking.id,
      qr_token,
      expires_at: expiresAt.toISOString(),
    };
  },

  async getOwnerBookings(ownerId, query) {
    await syncBookingLifecycle();

    const { items, total } = await bookingsRepository.findOwnerBookings(
      ownerId,
      query,
    );

    return {
      items,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  },

  async getOwnerBookingDetail(ownerId, bookingId) {
    await syncBookingLifecycle();

    const booking = await bookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    return booking;
  },

  async approveOwnerBooking(ownerId, bookingId) {
    const booking = await bookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ForbiddenError("Chỉ booking đang chờ xác nhận mới được duyệt");
    }

    const nextStatus =
      booking.requested_payment_method === "BANK_TRANSFER"
        ? "AWAITING_PAYMENT"
        : "APPROVED";

    const updatedBooking = await bookingsRepository.approveOwnerBooking(
      ownerId,
      bookingId,
      nextStatus,
    );

    await safeCreateNotification({
      user_id: updatedBooking.user_id,
      title: "Đơn đặt sân đã được duyệt",
      body:
        nextStatus === "AWAITING_PAYMENT"
          ? "Chủ sân đã xác nhận đơn đặt sân của bạn. Vui lòng tiến hành thanh toán."
          : "Chủ sân đã xác nhận đơn đặt sân của bạn. Vui lòng đến sân đúng giờ.",
      type: "BOOKING",
    });

    return updatedBooking;
  },

  async rejectOwnerBooking(ownerId, bookingId, payload) {
    const booking = await bookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status !== "PENDING_CONFIRM") {
      throw new ForbiddenError(
        "Chỉ booking đang chờ xác nhận mới được từ chối",
      );
    }

    const updatedBooking = await bookingsRepository.rejectOwnerBooking(
      ownerId,
      bookingId,
      payload.note,
    );

    await safeCreateNotification({
      user_id: updatedBooking.user_id,
      title: "Đơn đặt sân bị từ chối",
      body:
        payload.note ||
        "Rất tiếc, đơn đặt sân của bạn đã bị từ chối. Vui lòng chọn khung giờ khác.",
      type: "BOOKING",
    });

    return updatedBooking;
  },

  async checkInOwnerBooking(ownerId, bookingId, payload) {
    const booking = await bookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    assertCanCheckInBooking(booking);

    return bookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
      "MANUAL",
      payload.note,
    );
  },

  async scanOwnerBookingQr(ownerId, payload) {
    const secret = process.env.CHECKIN_QR_SECRET;

    if (!secret) {
      throw new Error("CHECKIN_QR_SECRET chưa được cấu hình");
    }

    let decoded;

    try {
      decoded = jwt.verify(payload.qr_token, secret);
    } catch {
      throw new AuthError("QR token không hợp lệ hoặc đã hết hạn");
    }

    if (decoded?.type !== "BOOKING_CHECKIN") {
      throw new ValidationError("QR token không đúng loại");
    }

    const bookingId = Number(decoded.bookingId);

    if (Number.isNaN(bookingId) || bookingId <= 0) {
      throw new ValidationError("QR token không hợp lệ");
    }

    const booking = await bookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking thuộc owner này");
    }

    assertCanCheckInBooking(booking);

    return bookingsRepository.markOwnerBookingCheckedIn(
      ownerId,
      bookingId,
      "QR",
      "Checked in by owner via QR",
    );
  },

  async completeOwnerBooking(ownerId, bookingId, payload) {
    await syncBookingLifecycle();

    const booking = await bookingsRepository.findOwnerBookingById(
      ownerId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (booking.status === "COMPLETED") {
      return booking;
    }

    if (booking.status !== "CHECKED_IN") {
      throw new ForbiddenError(
        "Chỉ booking đã CHECKED_IN mới được chuyển COMPLETED",
      );
    }

    const now = new Date();
    const GRACE_MINUTES = 5;
    const threshold = new Date(now.getTime() - GRACE_MINUTES * 60 * 1000);

    if (new Date(booking.end_datetime).getTime() > threshold.getTime()) {
      throw new ForbiddenError(
        "Booking chưa đến giờ kết thúc. Hệ thống sẽ tự động hoàn thành sau khi hết giờ đặt sân.",
      );
    }

    return bookingsRepository.completeOwnerBooking(
      ownerId,
      bookingId,
      payload.note || "Completed after end time",
    );
  },

  async createMyRescheduleRequest(userId, bookingId, payload) {
    const booking = await bookingsRepository.findMyBookingById(
      userId,
      bookingId,
    );

    if (!booking) {
      throw new NotFoundError("Không tìm thấy booking");
    }

    if (!["APPROVED", "PAID"].includes(booking.status)) {
      throw new ForbiddenError("Booking hiện không thể đổi lịch");
    }

    if (booking.checked_in_at || booking.status === "CHECKED_IN") {
      throw new ForbiddenError("Booking đã check-in, không thể đổi lịch");
    }

    if (new Date() >= new Date(booking.start_datetime)) {
      throw new ForbiddenError(
        "Không thể đổi lịch booking đã bắt đầu hoặc đã qua",
      );
    }

    if (payload.start_datetime <= new Date()) {
      throw new ValidationError("Không thể đổi sang thời điểm đã qua");
    }

    assertSameBookingDuration(booking, payload);

    const existedPending =
      await bookingsRepository.findPendingRescheduleRequestByBookingId(
        booking.id,
      );

    if (existedPending) {
      throw new ConflictError("Booking này đang có yêu cầu đổi lịch chờ duyệt");
    }

    await assertRescheduleSlotAvailable(
      booking.field_id,
      payload.start_datetime,
      payload.end_datetime,
      booking.id,
    );

    const approvalMode = booking.approval_mode_snapshot || "MANUAL";

    if (approvalMode === "AUTO") {
      const request = await bookingsRepository.autoApproveRescheduleRequest({
        booking_id: booking.id,
        field_id: booking.field_id,
        requested_by: userId,
        old_start_datetime: booking.start_datetime,
        old_end_datetime: booking.end_datetime,
        new_start_datetime: payload.start_datetime,
        new_end_datetime: payload.end_datetime,
        booking_status: booking.status,
        reason: payload.reason,
      });

      await safeCreateNotification({
        user_id: booking.user_id,
        title: "Đổi lịch thành công",
        body: "Yêu cầu đổi lịch của bạn đã được hệ thống tự động duyệt.",
        type: "BOOKING",
      });

      return request;
    }

    const request = await bookingsRepository.createRescheduleRequest({
      booking_id: booking.id,
      requested_by: userId,
      old_start_datetime: booking.start_datetime,
      old_end_datetime: booking.end_datetime,
      new_start_datetime: payload.start_datetime,
      new_end_datetime: payload.end_datetime,
      reason: payload.reason,
    });

    const ownerId = booking.fields?.owner_id;

    if (ownerId) {
      await safeCreateNotification({
        user_id: ownerId,
        title: "Có yêu cầu đổi lịch mới",
        body: `Khách hàng yêu cầu đổi lịch cho sân ${
          booking.fields?.field_name || ""
        }.`,
        type: "BOOKING",
      });
    }

    return request;
  },

  async getOwnerRescheduleRequests(ownerId, query) {
    return bookingsRepository.findOwnerRescheduleRequests(ownerId, query);
  },

  async approveOwnerRescheduleRequest(ownerId, requestId) {
    const request = await bookingsRepository.findOwnerRescheduleRequestById(
      ownerId,
      requestId,
    );

    if (!request) {
      throw new NotFoundError("Không tìm thấy yêu cầu đổi lịch");
    }

    if (request.status !== "PENDING") {
      throw new ForbiddenError("Yêu cầu đổi lịch này đã được xử lý");
    }

    const booking = request.bookings;

    if (!["APPROVED", "PAID"].includes(booking.status)) {
      throw new ForbiddenError("Booking hiện không thể đổi lịch");
    }

    if (booking.checked_in_at || booking.status === "CHECKED_IN") {
      throw new ForbiddenError("Booking đã check-in, không thể đổi lịch");
    }

    const oldDuration = diffMinutes(
      new Date(booking.start_datetime),
      new Date(booking.end_datetime),
    );

    const newDuration = diffMinutes(
      new Date(request.new_start_datetime),
      new Date(request.new_end_datetime),
    );

    if (oldDuration !== newDuration) {
      throw new ValidationError("Không được thay đổi thời lượng khi đổi lịch");
    }

    await assertRescheduleSlotAvailable(
      booking.field_id,
      request.new_start_datetime,
      request.new_end_datetime,
      booking.id,
    );

    const updated = await bookingsRepository.approveRescheduleRequest(
      ownerId,
      requestId,
    );

    if (!updated) {
      throw new NotFoundError("Không tìm thấy yêu cầu đổi lịch");
    }

    await safeCreateNotification({
      user_id: booking.user_id,
      title: "Yêu cầu đổi lịch đã được duyệt",
      body: "Chủ sân đã duyệt yêu cầu đổi lịch của bạn.",
      type: "BOOKING",
    });

    return updated;
  },

  async rejectOwnerRescheduleRequest(ownerId, requestId, payload) {
    const request = await bookingsRepository.findOwnerRescheduleRequestById(
      ownerId,
      requestId,
    );

    if (!request) {
      throw new NotFoundError("Không tìm thấy yêu cầu đổi lịch");
    }

    if (request.status !== "PENDING") {
      throw new ForbiddenError("Yêu cầu đổi lịch này đã được xử lý");
    }

    const updated = await bookingsRepository.rejectRescheduleRequest(
      ownerId,
      requestId,
      payload.owner_note,
    );

    if (!updated) {
      throw new NotFoundError("Không tìm thấy yêu cầu đổi lịch");
    }

    await safeCreateNotification({
      user_id: request.bookings.user_id,
      title: "Yêu cầu đổi lịch bị từ chối",
      body:
        payload.owner_note || "Chủ sân đã từ chối yêu cầu đổi lịch của bạn.",
      type: "BOOKING",
    });

    return updated;
  },
};
