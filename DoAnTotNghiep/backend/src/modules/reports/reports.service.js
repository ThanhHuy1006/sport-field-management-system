import { reportsRepository } from "./reports.repository.js";

const REVENUE_BOOKING_STATUSES = new Set(["PAID", "CHECKED_IN", "COMPLETED"]);
const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function toNumber(value) {
  if (value === null || value === undefined) return 0;
  return Number(value) || 0;
}

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function addDays(date, days) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function getRange(query) {
  const now = new Date();
  const range = query.range || "month";

  if (range === "custom") {
    return {
      range,
      from: startOfDay(new Date(`${query.from}T00:00:00`)),
      to: endOfDay(new Date(`${query.to}T00:00:00`)),
    };
  }

  if (range === "today") {
    return {
      range,
      from: startOfDay(now),
      to: endOfDay(now),
    };
  }

  if (range === "7d") {
    return {
      range,
      from: startOfDay(addDays(now, -6)),
      to: endOfDay(now),
    };
  }

  if (range === "30d") {
    return {
      range,
      from: startOfDay(addDays(now, -29)),
      to: endOfDay(now),
    };
  }

  if (range === "year") {
    return {
      range,
      from: new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0),
      to: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999),
    };
  }

  return {
    range: "month",
    from: new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0),
    to: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999),
  };
}

function getPreviousRange({ from, to, range }) {
  const diffMs = to.getTime() - from.getTime();

  if (range === "year") {
    return {
      from: new Date(from.getFullYear() - 1, 0, 1, 0, 0, 0, 0),
      to: new Date(from.getFullYear() - 1, 11, 31, 23, 59, 59, 999),
    };
  }

  if (range === "month") {
    return {
      from: new Date(from.getFullYear(), from.getMonth() - 1, 1, 0, 0, 0, 0),
      to: new Date(from.getFullYear(), from.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  return {
    from: new Date(from.getTime() - diffMs - 1),
    to: new Date(from.getTime() - 1),
  };
}

function isRevenueBooking(booking) {
  return REVENUE_BOOKING_STATUSES.has(String(booking.status));
}

function calculateGrowth(current, previous) {
  if (previous <= 0) {
    return current > 0 ? 100 : 0;
  }

  return Number((((current - previous) / previous) * 100).toFixed(1));
}

function formatDateKey(date) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date) {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}`;
}

function formatMonthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function formatMonthLabel(date) {
  return `T${new Date(date).getMonth() + 1}`;
}

function getRevenueSeries(bookings, rangeInfo) {
  const revenueBookings = bookings.filter(isRevenueBooking);
  const seriesMap = new Map();

  if (rangeInfo.range === "year") {
    for (let month = 0; month < 12; month += 1) {
      const date = new Date(rangeInfo.from.getFullYear(), month, 1);
      seriesMap.set(formatMonthKey(date), {
        key: formatMonthKey(date),
        label: formatMonthLabel(date),
        revenue: 0,
        bookings: 0,
      });
    }

    revenueBookings.forEach((booking) => {
      const key = formatMonthKey(booking.start_datetime);
      const item = seriesMap.get(key);
      if (!item) return;
      item.revenue += toNumber(booking.total_price);
      item.bookings += 1;
    });

    return Array.from(seriesMap.values());
  }

  let cursor = startOfDay(rangeInfo.from);
  const end = startOfDay(rangeInfo.to);

  while (cursor <= end) {
    const key = formatDateKey(cursor);
    seriesMap.set(key, {
      key,
      label: formatDateLabel(cursor),
      revenue: 0,
      bookings: 0,
    });
    cursor = addDays(cursor, 1);
  }

  revenueBookings.forEach((booking) => {
    const key = formatDateKey(booking.start_datetime);
    const item = seriesMap.get(key);
    if (!item) return;
    item.revenue += toNumber(booking.total_price);
    item.bookings += 1;
  });

  return Array.from(seriesMap.values());
}

function getBookingStatus(bookings) {
  const map = new Map();

  bookings.forEach((booking) => {
    const status = String(booking.status || "UNKNOWN");
    map.set(status, (map.get(status) || 0) + 1);
  });

  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

function getPaymentMethods(bookings) {
  const map = new Map();

  bookings.filter(isRevenueBooking).forEach((booking) => {
    const method = String(
      booking.payments?.provider || booking.requested_payment_method || "UNKNOWN"
    );

    const item = map.get(method) || { method, count: 0, amount: 0 };
    item.count += 1;
    item.amount += toNumber(booking.total_price);
    map.set(method, item);
  });

  return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
}

function getVoucherImpact(bookings) {
  const revenueBookings = bookings.filter(isRevenueBooking);
  const usedVoucherBookings = revenueBookings.filter((booking) => booking.voucher_id);

  const originalRevenue = revenueBookings.reduce(
    (sum, booking) => sum + toNumber(booking.original_price),
    0
  );

  const finalRevenue = revenueBookings.reduce(
    (sum, booking) => sum + toNumber(booking.total_price),
    0
  );

  const discountTotal = revenueBookings.reduce(
    (sum, booking) => sum + toNumber(booking.discount_amount),
    0
  );

  return {
    original_revenue: originalRevenue,
    final_revenue: finalRevenue,
    discount_total: discountTotal,
    voucher_booking_count: usedVoucherBookings.length,
    voucher_usage_rate:
      revenueBookings.length > 0
        ? Number(((usedVoucherBookings.length / revenueBookings.length) * 100).toFixed(1))
        : 0,
  };
}

function getPeakHours(bookings) {
  const map = new Map();

  bookings.forEach((booking) => {
    const hour = new Date(booking.start_datetime).getHours();
    const start = Math.floor(hour / 2) * 2;
    const end = start + 2;
    const label = `${String(start).padStart(2, "0")}-${String(end).padStart(2, "0")}h`;

    map.set(label, (map.get(label) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([time, bookings]) => ({ time, bookings }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

function getBookingsByDay(bookings) {
  const map = new Map();

  WEEKDAY_LABELS.forEach((day) => {
    map.set(day, { day, bookings: 0, revenue: 0 });
  });

  bookings.forEach((booking) => {
    const day = WEEKDAY_LABELS[new Date(booking.start_datetime).getDay()];
    const item = map.get(day);

    item.bookings += 1;

    if (isRevenueBooking(booking)) {
      item.revenue += toNumber(booking.total_price);
    }
  });

  return Array.from(map.values());
}

function getAverageRating(reviews) {
  const ratings = reviews
    .map((review) => Number(review.rating))
    .filter((rating) => !Number.isNaN(rating));

  if (ratings.length === 0) return 0;

  return Number((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1));
}

function getFieldPerformance(fields, bookings, reviews) {
  return fields
    .map((field) => {
      const fieldBookings = bookings.filter((booking) => booking.field_id === field.id);
      const revenueBookings = fieldBookings.filter(isRevenueBooking);
      const fieldReviews = reviews.filter((review) => review.field_id === field.id);

      return {
        field_id: field.id,
        field_name: field.field_name || `Sân #${field.id}`,
        sport_type: field.sport_type,
        district: field.district,
        status: field.status,
        bookings: fieldBookings.length,
        revenue: revenueBookings.reduce((sum, booking) => sum + toNumber(booking.total_price), 0),
        voucher_discount: revenueBookings.reduce(
          (sum, booking) => sum + toNumber(booking.discount_amount),
          0
        ),
        avg_rating: getAverageRating(fieldReviews),
        review_count: fieldReviews.length,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

function getBookingsByField(bookings) {
  const map = new Map();

  bookings.forEach((booking) => {
    const fieldId = booking.field_id;
    const name = booking.fields?.field_name || `Sân #${fieldId}`;
    const item = map.get(fieldId) || { field_id: fieldId, name, value: 0 };

    item.value += 1;
    map.set(fieldId, item);
  });

  return Array.from(map.values()).sort((a, b) => b.value - a.value);
}

function getTopCustomers(bookings) {
  const map = new Map();

  bookings.filter(isRevenueBooking).forEach((booking) => {
    const userId = booking.user_id;
    const item = map.get(userId) || {
      user_id: userId,
      name: booking.users?.name || "Khách hàng",
      phone: booking.users?.phone || null,
      email: booking.users?.email || null,
      bookings: 0,
      total_spent: 0,
      last_booking_at: null,
    };

    item.bookings += 1;
    item.total_spent += toNumber(booking.total_price);

    if (!item.last_booking_at || new Date(booking.start_datetime) > new Date(item.last_booking_at)) {
      item.last_booking_at = booking.start_datetime;
    }

    map.set(userId, item);
  });

  return Array.from(map.values())
    .sort((a, b) => b.total_spent - a.total_spent)
    .slice(0, 10);
}

function getTopFields(bookings) {
  const map = new Map();

  bookings.filter(isRevenueBooking).forEach((booking) => {
    const fieldId = booking.field_id;
    const item = map.get(fieldId) || {
      field_id: fieldId,
      field_name: booking.fields?.field_name || `Sân #${fieldId}`,
      owner_id: booking.fields?.owner_id || null,
      owner_name: booking.fields?.users?.name || "Chủ sân",
      sport_type: booking.fields?.sport_type || null,
      district: booking.fields?.district || null,
      bookings: 0,
      revenue: 0,
    };

    item.bookings += 1;
    item.revenue += toNumber(booking.total_price);
    map.set(fieldId, item);
  });

  return Array.from(map.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function getTopOwners(bookings) {
  const map = new Map();

  bookings.filter(isRevenueBooking).forEach((booking) => {
    const ownerId = booking.fields?.owner_id;
    if (!ownerId) return;

    const item = map.get(ownerId) || {
      owner_id: ownerId,
      owner_name: booking.fields?.users?.name || "Chủ sân",
      bookings: 0,
      revenue: 0,
      field_count: new Set(),
    };

    item.bookings += 1;
    item.revenue += toNumber(booking.total_price);
    item.field_count.add(booking.field_id);
    map.set(ownerId, item);
  });

  return Array.from(map.values())
    .map((item) => ({
      ...item,
      field_count: item.field_count.size,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);
}

function getBreakdownByFieldProp(bookings, propName, outputName) {
  const map = new Map();

  bookings.filter(isRevenueBooking).forEach((booking) => {
    const label = booking.fields?.[propName] || "Khác";
    const item = map.get(label) || {
      [outputName]: label,
      bookings: 0,
      revenue: 0,
    };

    item.bookings += 1;
    item.revenue += toNumber(booking.total_price);
    map.set(label, item);
  });

  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

function getFieldStatus(fields) {
  const map = new Map();

  fields.forEach((field) => {
    const status = String(field.status || "unknown");
    map.set(status, (map.get(status) || 0) + 1);
  });

  return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
}

export const reportsService = {
  async getOwnerReports(ownerId, query) {
    const rangeInfo = getRange(query);
    const previousRange = getPreviousRange(rangeInfo);

    const [fields, bookings, previousBookings, reviews] = await Promise.all([
      reportsRepository.getOwnerFields(ownerId),
      reportsRepository.getOwnerBookings(ownerId, {
        from: rangeInfo.from,
        to: rangeInfo.to,
        fieldId: query.field_id,
      }),
      reportsRepository.getOwnerBookings(ownerId, {
        from: previousRange.from,
        to: previousRange.to,
        fieldId: query.field_id,
      }),
      reportsRepository.getOwnerReviews(ownerId, {
        from: rangeInfo.from,
        to: rangeInfo.to,
        fieldId: query.field_id,
      }),
    ]);

    const revenueBookings = bookings.filter(isRevenueBooking);
    const previousRevenueBookings = previousBookings.filter(isRevenueBooking);

    const totalRevenue = revenueBookings.reduce(
      (sum, booking) => sum + toNumber(booking.total_price),
      0
    );

    const previousRevenue = previousRevenueBookings.reduce(
      (sum, booking) => sum + toNumber(booking.total_price),
      0
    );

    const uniqueCustomerIds = new Set(bookings.map((booking) => booking.user_id));

    return {
      range: {
        key: rangeInfo.range,
        from: rangeInfo.from,
        to: rangeInfo.to,
      },
      filters: {
        field_id: query.field_id,
      },
      summary: {
        total_revenue: totalRevenue,
        total_bookings: bookings.length,
        revenue_bookings: revenueBookings.length,
        total_customers: uniqueCustomerIds.size,
        avg_rating: getAverageRating(reviews),
        voucher_discount_total: getVoucherImpact(bookings).discount_total,
        revenue_growth_percent: calculateGrowth(totalRevenue, previousRevenue),
        booking_growth_percent: calculateGrowth(bookings.length, previousBookings.length),
      },
      revenue_series: getRevenueSeries(bookings, rangeInfo),
      booking_status: getBookingStatus(bookings),
      bookings_by_field: getBookingsByField(bookings),
      bookings_by_time: getPeakHours(bookings),
      bookings_by_day: getBookingsByDay(bookings),
      field_performance: getFieldPerformance(
        query.field_id ? fields.filter((field) => field.id === query.field_id) : fields,
        bookings,
        reviews
      ),
      top_customers: getTopCustomers(bookings),
      payment_methods: getPaymentMethods(bookings),
      voucher_impact: getVoucherImpact(bookings),
    };
  },

  async getAdminReports(query) {
    const rangeInfo = getRange(query);
    const previousRange = getPreviousRange(rangeInfo);

    const [
      fields,
      bookings,
      previousBookings,
      reviews,
      totalUsers,
      totalOwners,
      lockedUsers,
    ] = await Promise.all([
      reportsRepository.getAllFields({
        sportType: query.sport_type,
        district: query.district,
      }),
      reportsRepository.getAdminBookings({
        from: rangeInfo.from,
        to: rangeInfo.to,
        sportType: query.sport_type,
        district: query.district,
      }),
      reportsRepository.getAdminBookings({
        from: previousRange.from,
        to: previousRange.to,
        sportType: query.sport_type,
        district: query.district,
      }),
      reportsRepository.getAdminReviews({
        from: rangeInfo.from,
        to: rangeInfo.to,
        sportType: query.sport_type,
        district: query.district,
      }),
      reportsRepository.countUsersByRole("USER"),
      reportsRepository.countUsersByRole("OWNER"),
      reportsRepository.countUsersByStatus("locked"),
    ]);

    const revenueBookings = bookings.filter(isRevenueBooking);
    const previousRevenueBookings = previousBookings.filter(isRevenueBooking);

    const totalRevenue = revenueBookings.reduce(
      (sum, booking) => sum + toNumber(booking.total_price),
      0
    );

    const previousRevenue = previousRevenueBookings.reduce(
      (sum, booking) => sum + toNumber(booking.total_price),
      0
    );

    return {
      range: {
        key: rangeInfo.range,
        from: rangeInfo.from,
        to: rangeInfo.to,
      },
      filters: {
        sport_type: query.sport_type,
        district: query.district,
      },
      summary: {
        total_revenue: totalRevenue,
        total_bookings: bookings.length,
        revenue_bookings: revenueBookings.length,
        total_users: totalUsers,
        total_owners: totalOwners,
        locked_users: lockedUsers,
        total_fields: fields.length,
        active_fields: fields.filter((field) => field.status === "active").length,
        pending_fields: fields.filter((field) => field.status === "pending").length,
        maintenance_fields: fields.filter((field) => field.status === "maintenance").length,
        avg_rating: getAverageRating(reviews),
        voucher_discount_total: getVoucherImpact(bookings).discount_total,
        revenue_growth_percent: calculateGrowth(totalRevenue, previousRevenue),
        booking_growth_percent: calculateGrowth(bookings.length, previousBookings.length),
      },
      revenue_series: getRevenueSeries(bookings, rangeInfo),
      booking_status: getBookingStatus(bookings),
      field_status: getFieldStatus(fields),
      top_fields: getTopFields(bookings),
      top_owners: getTopOwners(bookings),
      sport_breakdown: getBreakdownByFieldProp(bookings, "sport_type", "sport_type"),
      district_breakdown: getBreakdownByFieldProp(bookings, "district", "district"),
      payment_methods: getPaymentMethods(bookings),
      voucher_impact: getVoucherImpact(bookings),
    };
  },
};