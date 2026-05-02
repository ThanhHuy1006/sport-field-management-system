import { ValidationError } from "../../core/errors/index.js";

const REVIEW_REPORT_REASONS = [
  "SPAM",
  "OFFENSIVE_LANGUAGE",
  "FAKE_REVIEW",
  "IRRELEVANT",
  "HARASSMENT",
  "OTHER",
];

const REVIEW_REPORT_STATUSES = [
  "PENDING",
  "REVIEWING",
  "RESOLVED",
  "REJECTED",
];

function toPositiveInt(value, fieldName) {
  const number = Number(value);

  if (!Number.isInteger(number) || number <= 0) {
    throw new ValidationError(`${fieldName} không hợp lệ`);
  }

  return number;
}

export function validateCreateReviewReportPayload(payload) {
  const review_id = toPositiveInt(payload.review_id, "review_id");

  const reason = String(payload.reason || "").trim();

  if (!REVIEW_REPORT_REASONS.includes(reason)) {
    throw new ValidationError("reason không hợp lệ");
  }

  const description =
    payload.description !== undefined && payload.description !== null
      ? String(payload.description).trim()
      : null;

  if (description && description.length > 500) {
    throw new ValidationError("description không được vượt quá 500 ký tự");
  }

  return {
    review_id,
    reason,
    description: description || null,
  };
}

export function validateReviewReportIdParams(params) {
  return {
    reportId: toPositiveInt(params.reportId, "reportId"),
  };
}

export function validateAdminReviewReportQuery(query) {
  const page = query.page ? toPositiveInt(query.page, "page") : 1;
  const limit = query.limit ? toPositiveInt(query.limit, "limit") : 10;

  if (limit > 100) {
    throw new ValidationError("limit không được vượt quá 100");
  }

  const status = query.status ? String(query.status).trim() : undefined;

  if (status && !REVIEW_REPORT_STATUSES.includes(status)) {
    throw new ValidationError("status không hợp lệ");
  }

  const reason = query.reason ? String(query.reason).trim() : undefined;

  if (reason && !REVIEW_REPORT_REASONS.includes(reason)) {
    throw new ValidationError("reason không hợp lệ");
  }

  return {
    page,
    limit,
    status,
    reason,
  };
}

export function validateUpdateReviewReportStatusPayload(payload) {
  const status = String(payload.status || "").trim();

  if (!REVIEW_REPORT_STATUSES.includes(status)) {
    throw new ValidationError("status không hợp lệ");
  }

  const admin_note =
    payload.admin_note !== undefined && payload.admin_note !== null
      ? String(payload.admin_note).trim()
      : null;

  if (admin_note && admin_note.length > 500) {
    throw new ValidationError("admin_note không được vượt quá 500 ký tự");
  }

  return {
    status,
    admin_note: admin_note || null,
    hide_review: Boolean(payload.hide_review),
  };
}