export function toReviewReportResponse(report) {
  if (!report) return null;

  return {
    id: report.id,
    reporter_id: report.reporter_id,
    review_id: report.review_id,
    reason: report.reason,
    description: report.description,
    status: report.status,
    admin_note: report.admin_note,
    handled_by: report.handled_by,
    handled_at: report.handled_at,

    review_rating_snapshot: report.review_rating_snapshot,
    review_comment_snapshot: report.review_comment_snapshot,
    review_author_id_snapshot: report.review_author_id_snapshot,

    created_at: report.created_at,
    updated_at: report.updated_at,

    reporter: report.reporter
      ? {
          id: report.reporter.id,
          name: report.reporter.name,
          email: report.reporter.email,
          phone: report.reporter.phone,
        }
      : null,

    review: report.review
      ? {
          id: report.review.id,
          booking_id: report.review.booking_id,
          field_id: report.review.field_id,
          user_id: report.review.user_id,
          rating: report.review.rating,
          comment: report.review.comment,
          visible: report.review.visible,
          reply_text: report.review.reply_text,
          reply_at: report.review.reply_at,
          created_at: report.review.created_at,

          user: report.review.users
            ? {
                id: report.review.users.id,
                name: report.review.users.name,
                avatar_url: report.review.users.avatar_url,
              }
            : null,

          field: report.review.fields
            ? {
                id: report.review.fields.id,
                field_name: report.review.fields.field_name,
                owner_id: report.review.fields.owner_id,
              }
            : null,
        }
      : null,

    admin: report.admin
      ? {
          id: report.admin.id,
          name: report.admin.name,
          email: report.admin.email,
        }
      : null,
  };
}