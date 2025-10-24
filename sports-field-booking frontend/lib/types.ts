// ========== USER ==========
export type UserRole = "USER" | "OWNER" | "ADMIN";
export type UserStatus = "active" | "locked" | "deleted";

export interface User {
  id: number;
  name: string | null;
  email: string;
  phone?: string | null;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  updated_at: string;
}

// ========== FIELD ==========
export type FieldStatus = "active" | "hidden" | "maintenance";

export interface Field {
  id: number;
  owner_id: number;
  field_name: string;
  sport_type: string;
  description?: string | null;
  address: string;
  latitude?: number;
  longitude?: number;
  base_price_per_hour: number;
  currency: string;
  status: FieldStatus;
  min_duration_minutes: number;
  max_players?: number;
  created_at: string;
  updated_at: string;
  images?: FieldImage[];
  facilities?: Facility[];
  operating_hours?: OperatingHour[];
}

export interface FieldImage {
  id: number;
  field_id: number;
  url: string;
  is_primary: boolean;
  order_no: number;
}

export interface Facility {
  id: number;
  name: string;
  icon?: string | null;
  note?: string | null;
}

export interface OperatingHour {
  id: number;
  field_id: number;
  day_of_week: number;
  open_time?: string;
  close_time?: string;
}

// ========== BOOKING ==========
export type BookingStatus =
  | "PENDING_CONFIRM"
  | "APPROVED"
  | "AWAITING_PAYMENT"
  | "PAID"
  | "REJECTED"
  | "CANCELLED"
  | "COMPLETED"
  | "PAY_FAILED";

export interface Booking {
  id: number;
  user_id: number;
  field_id: number;
  start_datetime: string;
  end_datetime: string;
  status: BookingStatus;
  total_price?: number;
  created_at: string;
  updated_at: string;
  field?: Field;
  user?: User;
  payment?: Payment;
  review?: Review;
}

// ========== PAYMENT ==========
export type PaymentStatus = "pending" | "success" | "failed" | "refunded";

export interface Payment {
  id: number;
  booking_id: number;
  provider: "VNPAY" | "MOMO" | "ZALOPAY" | "ONSITE";
  amount: number;
  currency: string;
  status: PaymentStatus;
  transaction_code?: string;
  paid_at?: string;
}

// ========== REVIEW ==========
export interface Review {
  id: number;
  booking_id: number;
  field_id: number;
  user_id: number;
  rating: number;
  comment?: string;
  created_at: string;
}

// ========== VOUCHER ==========
export type VoucherType = "PERCENT" | "FIXED";
export type VoucherStatus = "active" | "expired" | "inactive";

export interface Voucher {
  id: number;
  code: string;
  type: VoucherType;
  discount_value: number;
  max_discount_amount?: number;
  min_order_value?: number;
  start_date: string;
  end_date: string;
  usage_limit_total: number;
  usage_limit_per_user: number;
  status: VoucherStatus;
  created_at: string;
}
