const ALLOWED_VOUCHER_TYPES = ["PERCENT", "FIXED"];
const ALLOWED_VOUCHER_STATUSES = ["active", "inactive", "expired"];

export function validateVoucherCodePayload(payload) {
  const code = String(payload.code || "").trim().toUpperCase();
  const order_amount = Number(payload.order_amount || 0);
  const owner_id = payload.owner_id ? Number(payload.owner_id) : null;

  if (!code) {
    throw new Error("code là bắt buộc");
  }

  if (Number.isNaN(order_amount) || order_amount < 0) {
    throw new Error("order_amount không hợp lệ");
  }

  return {
    code,
    order_amount,
    owner_id: owner_id && !Number.isNaN(owner_id) ? owner_id : null,
  };
}

export function validateCreateVoucherPayload(payload) {
  const code = String(payload.code || "").trim().toUpperCase();
  const type = String(payload.type || "").trim().toUpperCase();
  const discount_value = Number(payload.discount_value);
  const max_discount_amount =
    payload.max_discount_amount !== undefined
      ? Number(payload.max_discount_amount)
      : null;
  const min_order_value =
    payload.min_order_value !== undefined ? Number(payload.min_order_value) : 0;
  const usage_limit_total =
    payload.usage_limit_total !== undefined
      ? Number(payload.usage_limit_total)
      : 0;
  const usage_limit_per_user =
    payload.usage_limit_per_user !== undefined
      ? Number(payload.usage_limit_per_user)
      : 0;

  if (!code) throw new Error("code là bắt buộc");

  if (!ALLOWED_VOUCHER_TYPES.includes(type)) {
    throw new Error("type không hợp lệ");
  }

  if (Number.isNaN(discount_value) || discount_value <= 0) {
    throw new Error("discount_value phải > 0");
  }

  if (
    max_discount_amount !== null &&
    (Number.isNaN(max_discount_amount) || max_discount_amount < 0)
  ) {
    throw new Error("max_discount_amount không hợp lệ");
  }

  if (Number.isNaN(min_order_value) || min_order_value < 0) {
    throw new Error("min_order_value không hợp lệ");
  }

  if (Number.isNaN(usage_limit_total) || usage_limit_total < 0) {
    throw new Error("usage_limit_total không hợp lệ");
  }

  if (Number.isNaN(usage_limit_per_user) || usage_limit_per_user < 0) {
    throw new Error("usage_limit_per_user không hợp lệ");
  }

  if (!payload.start_date || !payload.end_date) {
    throw new Error("start_date và end_date là bắt buộc");
  }

  const start_date = new Date(payload.start_date);
  const end_date = new Date(payload.end_date);

  if (Number.isNaN(start_date.getTime()) || Number.isNaN(end_date.getTime())) {
    throw new Error("start_date hoặc end_date không hợp lệ");
  }

  if (start_date > end_date) {
    throw new Error("end_date phải lớn hơn hoặc bằng start_date");
  }

  return {
    code,
    type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit_total,
    usage_limit_per_user,
    start_date,
    end_date,
    status: "active",
  };
}

export function validateUpdateVoucherPayload(payload) {
  const data = {};

  if (payload.discount_value !== undefined) {
    const value = Number(payload.discount_value);
    if (Number.isNaN(value) || value <= 0) {
      throw new Error("discount_value phải > 0");
    }
    data.discount_value = value;
  }

  if (payload.max_discount_amount !== undefined) {
    const value =
      payload.max_discount_amount === null
        ? null
        : Number(payload.max_discount_amount);
    if (value !== null && (Number.isNaN(value) || value < 0)) {
      throw new Error("max_discount_amount không hợp lệ");
    }
    data.max_discount_amount = value;
  }

  if (payload.min_order_value !== undefined) {
    const value = Number(payload.min_order_value);
    if (Number.isNaN(value) || value < 0) {
      throw new Error("min_order_value không hợp lệ");
    }
    data.min_order_value = value;
  }

  if (payload.usage_limit_total !== undefined) {
    const value = Number(payload.usage_limit_total);
    if (Number.isNaN(value) || value < 0) {
      throw new Error("usage_limit_total không hợp lệ");
    }
    data.usage_limit_total = value;
  }

  if (payload.usage_limit_per_user !== undefined) {
    const value = Number(payload.usage_limit_per_user);
    if (Number.isNaN(value) || value < 0) {
      throw new Error("usage_limit_per_user không hợp lệ");
    }
    data.usage_limit_per_user = value;
  }

  if (payload.start_date !== undefined) {
    const value = new Date(payload.start_date);
    if (Number.isNaN(value.getTime())) {
      throw new Error("start_date không hợp lệ");
    }
    data.start_date = value;
  }

  if (payload.end_date !== undefined) {
    const value = new Date(payload.end_date);
    if (Number.isNaN(value.getTime())) {
      throw new Error("end_date không hợp lệ");
    }
    data.end_date = value;
  }

  if (Object.keys(data).length === 0) {
    throw new Error("Không có dữ liệu hợp lệ để cập nhật");
  }

  return data;
}

export function validateVoucherStatusPayload(payload) {
  const status = String(payload.status || "").trim().toLowerCase();

  if (!ALLOWED_VOUCHER_STATUSES.includes(status)) {
    throw new Error("status không hợp lệ");
  }

  return { status };
}