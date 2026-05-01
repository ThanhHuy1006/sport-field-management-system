export type FieldReportReason =
  | "WRONG_INFO"
  | "FAKE_IMAGE"
  | "FIELD_CLOSED"
  | "BAD_QUALITY"
  | "OWNER_ATTITUDE"
  | "OTHER"

export type FieldReportStatus =
  | "PENDING"
  | "REVIEWING"
  | "RESOLVED"
  | "REJECTED"

export type CreateFieldReportPayload = {
  field_id: number
  booking_id?: number | null
  reason: FieldReportReason
  description?: string | null
  images?: File[]
}

export type FieldReportAttachment = {
  id: number
  image_url: string
  file_name: string | null
  mime_type: string | null
  file_size: number | null
  created_at: string | null
}

export type FieldReport = {
  id: number
  reporter_id: number
  field_id: number
  booking_id: number | null
  reason: FieldReportReason
  description: string | null
  status: FieldReportStatus
  admin_note: string | null
  handled_by: number | null
  handled_at: string | null
  created_at: string | null
  updated_at: string | null

  reporter: {
    id: number
    name: string | null
    email: string | null
    phone: string | null
  } | null

  field: {
    id: number
    field_name: string
    sport_type: string | null
    address: string | null
    status: string
  } | null

  booking: {
    id: number
    status: string
    start_datetime: string
    end_datetime: string
    total_price: string | number
  } | null

  admin: {
    id: number
    name: string | null
    email: string | null
  } | null

  attachments: FieldReportAttachment[]
}