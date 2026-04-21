export function toOwnerOperatingHourResponse(item) {
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

export function toOwnerBlackoutDateResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    field_id: item.field_id,
    start_datetime: item.start_datetime,
    end_datetime: item.end_datetime,
    reason: item.reason ?? null,
    created_at: item.created_at,
  };
}