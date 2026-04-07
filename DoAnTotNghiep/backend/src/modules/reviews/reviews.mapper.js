export function toReviewResponse(item) {
  if (!item) return null;

  return {
    id: item.id,
    booking_id: item.booking_id,
    field_id: item.field_id,
    user_id: item.user_id,
    rating: item.rating,
    comment: item.comment,
    visible: item.visible,
    reply_text: item.reply_text,
    reply_at: item.reply_at,
    created_at: item.created_at,
    user: item.users
      ? {
          id: item.users.id,
          name: item.users.name,
          avatar_url: item.users.avatar_url,
        }
      : null,
    field: item.fields
      ? {
          id: item.fields.id,
          field_name: item.fields.field_name,
        }
      : null,
  };
}