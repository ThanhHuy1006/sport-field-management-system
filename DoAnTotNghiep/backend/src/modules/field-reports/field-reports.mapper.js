export function toFieldReportResponse(report) {
  if (!report) return null;

  return {
    id: report.id,
    reporter_id: report.reporter_id,
    field_id: report.field_id,
    booking_id: report.booking_id,
    reason: report.reason,
    description: report.description,
    status: report.status,
    admin_note: report.admin_note,
    handled_by: report.handled_by,
    handled_at: report.handled_at,
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

    field: report.field
      ? {
          id: report.field.id,
          field_name: report.field.field_name,
          sport_type: report.field.sport_type,
          address: report.field.address,
          status: report.field.status,
        }
      : null,

    booking: report.booking
      ? {
          id: report.booking.id,
          status: report.booking.status,
          start_datetime: report.booking.start_datetime,
          end_datetime: report.booking.end_datetime,
          total_price: report.booking.total_price,
        }
      : null,

    admin: report.admin
      ? {
          id: report.admin.id,
          name: report.admin.name,
          email: report.admin.email,
        }
      : null,

    attachments:
      report.attachments?.map((item) => ({
        id: item.id,
        image_url: item.image_url,
        file_name: item.file_name,
        mime_type: item.mime_type,
        file_size: item.file_size,
        created_at: item.created_at,
      })) ?? [],
  };
}