import { apiGet } from "@/lib/api-client";

export type BookingAvailabilitySlotsResponse = {
  success: boolean;
  message: string;
  data: {
    field: {
      id: number;
      field_name: string;
      address: string | null;
      sport_type: string | null;
      base_price_per_hour: string | number | null;
      currency: string | null;
    };
    date: string;
    is_open: boolean;
    open_time: string | null;
    close_time: string | null;
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
    }>;
  };
};

type Params = {
  field_id: number;
  date: string;
  duration_minutes?: number;
};

export function getBookingAvailabilitySlots(params: Params) {
  return apiGet<BookingAvailabilitySlotsResponse>("/bookings/availability-slots", params, {
    requireAuth: false,
  });
}