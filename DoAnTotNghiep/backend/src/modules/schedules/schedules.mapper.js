export function toOperatingHourResponse(item) {
  const windows = Array.isArray(item.windows)
    ? item.windows
    : item.open_time && item.close_time
      ? [
          {
            id: item.id ?? null,
            start_time: item.open_time,
            end_time: item.close_time,
          },
        ]
      : [];

  return {
    id: item.id ?? null,
    field_id: item.field_id,
    day_of_week: item.day_of_week,
    is_closed:
      item.is_closed ??
      windows.length === 0,

    windows: windows.map((window) => ({
      id: window.id ?? null,
      start_time: window.start_time,
      end_time: window.end_time,
    })),

    // Giữ lại để không làm vỡ frontend cũ nếu còn chỗ dùng open_time/close_time.
    open_time: windows[0]?.start_time ?? item.open_time ?? null,
    close_time: windows[0]?.end_time ?? item.close_time ?? null,
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