export function toNotificationResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    user_id: item.user_id,
    type: item.type,
    title: item.title,
    body: item.body,
    is_read: Boolean(item.is_read),
    created_at: item.created_at,
  };
}