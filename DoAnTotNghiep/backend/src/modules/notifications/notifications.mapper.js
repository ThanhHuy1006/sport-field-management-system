function parseData(value) {
  if (value == null) return null;

  if (typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  return value;
}

export function toNotificationResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    user_id: item.user_id,
    type: item.type,
    title: item.title,
    message: item.message,
    data: parseData(item.data),
    is_read: item.is_read,
    read_at: item.read_at,
    created_at: item.created_at,
  };
}