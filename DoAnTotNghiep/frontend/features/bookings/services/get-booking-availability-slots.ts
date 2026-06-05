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
    is_blackout?: boolean;
    blackout_reason?: string | null;
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
      status?: "available" | "booked" | "past" | string;
      is_past?: boolean;
      booking_id?: number | null;
    }>;
  };
};

type FieldAvailabilityResponse = {
  success: boolean;
  message: string;
  data: {
    field_id: number;
    date: string;
    is_blackout: boolean;
    blackout_reason: string | null;
    slots: Array<{
      start_time: string;
      end_time: string;
      start_datetime: string;
      end_datetime: string;
      status: "available" | "booked" | "past" | string;
      available?: boolean;
      is_past?: boolean;
      reason?: string | null;
      booking_id: number | null;
    }>;
  };
};

type Params = {
  field_id: number;
  date: string;
  duration_minutes?: number;
};

export async function getBookingAvailabilitySlots(params: Params) {
  const result = await apiGet<FieldAvailabilityResponse>(
    `/fields/${params.field_id}/availability`,
    {
      date: params.date,
      duration_minutes: params.duration_minutes,
    },
    {
      requireAuth: false,
    },
  );

  const slots = result.data.slots || [];

  return {
    success: result.success,
    message: result.message,
    data: {
      field: {
        id: result.data.field_id,
        field_name: "",
        address: null,
        sport_type: null,
        base_price_per_hour: null,
        currency: null,
      },
      date: result.data.date,
      is_open: !result.data.is_blackout && slots.length > 0,
      is_blackout: result.data.is_blackout,
      blackout_reason: result.data.blackout_reason,
      open_time: slots[0]?.start_time ?? null,
      close_time: slots.length > 0 ? slots[slots.length - 1].end_time : null,
      slot_step_minutes: 30,
      duration_minutes: params.duration_minutes ?? 60,
      slots: slots.map((slot) => {
        const available =
          typeof slot.available === "boolean"
            ? slot.available
            : slot.status === "available" && !slot.is_past;

        const reason =
          slot.reason ??
          (slot.is_past || slot.status === "past"
            ? "Đã qua"
            : slot.status === "booked"
              ? "Đã có người đặt"
              : null);

        return {
          start_datetime: slot.start_datetime,
          end_datetime: slot.end_datetime,
          start_time: slot.start_time,
          end_time: slot.end_time,
          available,
          reason,
          booking_status: slot.status === "booked" ? "booked" : null,
          status: slot.status,
          is_past: slot.is_past,
          booking_id: slot.booking_id,
        };
      }),
    },
  } satisfies BookingAvailabilitySlotsResponse;
}