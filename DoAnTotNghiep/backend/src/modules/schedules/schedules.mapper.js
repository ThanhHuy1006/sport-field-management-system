export function toOperatingHourResponse(item) {
  return {
    id: item.id ?? null,
    field_id: item.field_id,
    day_of_week: item.day_of_week,
    open_time: item.open_time ?? null,
    close_time: item.close_time ?? null,
    is_closed:
      item.is_closed ??
      (item.open_time == null && item.close_time == null),
  };
}

export function toAvailabilityResponse({
  fieldId,
  date,
  slots,
  isBlackout,
  blackoutReason,
}) {
  return {
    field_id: fieldId,
    date,
    is_blackout: isBlackout,
    blackout_reason: blackoutReason || null,
    slots,
  };
}