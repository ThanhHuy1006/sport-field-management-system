export function toOperatingHourResponse(item) {
  return {
    id: item.id,
    field_id: item.field_id,
    day_of_week: item.day_of_week,
    open_time: item.open_time,
    close_time: item.close_time,
  };
}

export function toAvailabilityResponse({ fieldId, date, slots, isBlackout, blackoutReason }) {
  return {
    field_id: fieldId,
    date,
    is_blackout: isBlackout,
    blackout_reason: blackoutReason || null,
    slots,
  };
}