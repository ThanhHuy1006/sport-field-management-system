export function toVoucherResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    owner_id: item.owner_id,
    created_by: item.created_by,
    code: item.code,
    type: item.type,
    discount_value: item.discount_value ? Number(item.discount_value) : null,
    max_discount_amount: item.max_discount_amount
      ? Number(item.max_discount_amount)
      : null,
    min_order_value: item.min_order_value
      ? Number(item.min_order_value)
      : null,
    usage_limit_total: item.usage_limit_total,
    usage_limit_per_user: item.usage_limit_per_user,
    start_date: item.start_date,
    end_date: item.end_date,
    status: item.status,
    created_at: item.created_at,
  };
}

export function toVoucherValidationResponse({
  voucher,
  order_amount,
  discount_amount,
  final_amount,
}) {
  return {
    voucher: toVoucherResponse(voucher),
    order_amount,
    discount_amount,
    final_amount,
  };
}