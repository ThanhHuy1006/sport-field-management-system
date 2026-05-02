export type ReviewReportReason =
  | "SPAM"
  | "OFFENSIVE_LANGUAGE"
  | "FAKE_REVIEW"
  | "IRRELEVANT"
  | "HARASSMENT"
  | "OTHER";

export type ReviewReportStatus =
  | "PENDING"
  | "REVIEWING"
  | "RESOLVED"
  | "REJECTED";

export type CreateReviewReportPayload = {
  review_id: number;
  reason: ReviewReportReason;
  description?: string | null;
};

export type ReviewReport = {
  id: number;
  reporter_id: number;
  review_id: number;
  reason: ReviewReportReason;
  description: string | null;
  status: ReviewReportStatus;
  admin_note: string | null;
  handled_by: number | null;
  handled_at: string | null;

  review_rating_snapshot: number | null;
  review_comment_snapshot: string | null;
  review_author_id_snapshot: number | null;

  created_at: string | null;
  updated_at: string | null;

  reporter: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  } | null;

  review: {
    id: number;
    booking_id: number;
    field_id: number;
    user_id: number;
    rating: number | null;
    comment: string | null;
    visible: boolean | null;
    reply_text: string | null;
    reply_at: string | null;
    created_at: string | null;

    user: {
      id: number;
      name: string | null;
      avatar_url: string | null;
    } | null;

    field: {
      id: number;
      field_name: string;
      owner_id: number;
    } | null;
  } | null;

  admin: {
    id: number;
    name: string | null;
    email: string | null;
  } | null;
};