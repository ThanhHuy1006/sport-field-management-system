import { apiGet } from "@/lib/api-client";

export type BookingAvailabilitySlot = {
  start_datetime: string;
  end_datetime: string;
  start_time: string;
  end_time: string;
  available: boolean;
  reason?: string | null;
  booking_status?: string | null;

  pricing_rule_id?: number | null;
  pricing_day_type?: string | null;
  price_per_hour?: number | string | null;
  total_price?: number | string | null;
  currency?: string | null;
};

export type BookingAvailabilitySlotsResponse = {
  success: boolean;
  message: string;
  data: {
    field?: {
      id: number;
      field_name?: string | null;
      address?: string | null;
      sport_type?: string | null;
      base_price_per_hour?: number | string | null;
      currency?: string | null;
    } | null;
    date: string;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
    windows: Array<{
      id: number;
      start_time: string;
      end_time: string;
    }>;
    slot_step_minutes: number;
    duration_minutes: number;
    slots: BookingAvailabilitySlot[];
  };
};

export async function getBookingAvailabilitySlots(params: {
  field_id: number;
  date: string;
  duration_minutes: number;
}) {
  const query = new URLSearchParams({
    field_id: String(params.field_id),
    date: params.date,
    duration_minutes: String(params.duration_minutes),
  });

  return apiGet<BookingAvailabilitySlotsResponse>(
    `/bookings/availability-slots?${query.toString()}`,
  );
}
