import { apiGet } from "@/lib/api-client";

export type BookingAvailabilitySlotsResponse = {
  success: boolean;
  message: string;
  data: {
    field: {
      id: number;
      owner_id?: number;
      field_name: string;
      address: string | null;
      sport_type: string | null;
      base_price_per_hour: string | number | null;
      currency: string | null;
      min_duration_minutes?: number | null;
      status?: string | null;
      approval_mode?: string | null;
    };
    date: string;
    is_open: boolean;
    is_blackout?: boolean;
    blackout_reason?: string | null;
    open_time: string | null;
    close_time: string | null;
    windows?: Array<{
      id: number;
      start_time: string;
      end_time: string;
    }>;
    slot_step_minutes: number;
    duration_minutes: number;
    slots: Array<{
      start_datetime: string;
      end_datetime: string;
      start_time: string;
      end_time: string;
      available: boolean;
      reason: string | null;
      booking_status: string | null;

      pricing_rule_id?: number | null;
      pricing_day_type?: string | null;
      price_per_hour?: number | string | null;
      total_price?: number | string | null;
      currency?: string | null;

      status?: "available" | "booked" | "past" | string;
      is_past?: boolean;
      booking_id?: number | null;
    }>;
  };
};

type Params = {
  field_id: number;
  date: string;
  duration_minutes?: number;
};

export async function getBookingAvailabilitySlots(params: Params) {
  return apiGet<BookingAvailabilitySlotsResponse>(
    "/bookings/availability-slots",
    {
      field_id: params.field_id,
      date: params.date,
      duration_minutes: params.duration_minutes,
    },
    {
      requireAuth: false,
    },
  );
}