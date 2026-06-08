"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  AlertCircle,
  Clock,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  getFieldDetail,
  type FieldDetailResponse,
} from "@/features/fields/services/get-field-detail";
import { getBookingAvailabilitySlots } from "@/features/bookings/services/get-booking-availability-slots";
import { createBooking } from "@/features/bookings/services/create-booking";
import {
  getAvailableVouchers,
  validateVoucher,
  type VoucherItem,
} from "@/features/vouchers/services/validate-voucher";
import {
  getStoredAccessToken,
  getStoredUser,
} from "@/features/auth/lib/auth-storage";
import { getImageUrl } from "@/lib/image-url";

type OperatingHourUi = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
};

type FieldUi = {
  id: number;
  ownerId: number | null;
  name: string;
  location: string;
  image: string | null;
  pricePerHour: number;
  currency: string;
  openTime: string | null;
  closeTime: string | null;
  operatingHours: OperatingHourUi[];
};

type SlotUi = {
  start_datetime: string;
  end_datetime: string;
  start_time: string;
  end_time: string;
  available: boolean;
  reason: string | null;
  booking_status?: string | null;

  // Giá trả về từ API availability-slots
  pricing_rule_id?: number | null;
  pricing_day_type?: "WEEKDAY" | "WEEKEND" | "HOLIDAY" | "CUSTOM" | string | null;
  price_per_hour?: number | string | null;
  total_price?: number | string | null;
  currency?: string | null;
};

type CreatedBookingUi = {
  id: number;
  field_id: number;
  user_id: number;
  start_datetime: string;
  end_datetime: string;
  status: string;
  original_price: string | number | null;
  discount_amount: string | number | null;
  total_price: string | number;
  voucher_id?: number | null;
  voucher?: {
    id: number;
    code: string;
    type: string;
    discount_value: string | number | null;
    max_discount_amount?: string | number | null;
  } | null;
  requested_payment_method?: "ONSITE" | "BANK_TRANSFER" | null;
};
function mapFieldDetailToUi(data: FieldDetailResponse["data"]): FieldUi {
  const source = data as FieldDetailResponse["data"] & {
    owner_id?: number | null;
    ownerId?: number | null;
    owner?: {
      id?: number | null;
      user_id?: number | null;
    } | null;

    openTime?: string | null;
    closeTime?: string | null;
    open_time?: string | null;
    close_time?: string | null;

    operating_hours?: Array<{
      id?: number;
      day_of_week?: number;
      dayOfWeek?: number;
      open_time?: string | null;
      openTime?: string | null;
      close_time?: string | null;
      closeTime?: string | null;
    }>;

    operatingHours?: Array<{
      id?: number;
      day_of_week?: number;
      dayOfWeek?: number;
      open_time?: string | null;
      openTime?: string | null;
      close_time?: string | null;
      closeTime?: string | null;
    }>;
  };

  const ownerId =
    source.owner_id ??
    source.ownerId ??
    source.owner?.id ??
    source.owner?.user_id ??
    null;

  const operatingHoursRaw = source.operating_hours ?? source.operatingHours ?? [];

  const operatingHours = operatingHoursRaw
    .map((item) => ({
      day_of_week: Number(item.day_of_week ?? item.dayOfWeek),
      open_time: item.open_time ?? item.openTime ?? null,
      close_time: item.close_time ?? item.closeTime ?? null,
    }))
    .filter((item) => Number.isFinite(item.day_of_week));

  return {
    id: data.id,
    ownerId,
    name: data.field_name ?? "Chưa có tên sân",
    location: data.address ?? "Chưa cập nhật địa chỉ",
    image: getImageUrl(data.images?.[0]?.url ?? null),
    pricePerHour: Number(data.base_price_per_hour ?? 0),
    currency: data.currency ?? "VND",
    openTime: source.openTime ?? source.open_time ?? null,
    closeTime: source.closeTime ?? source.close_time ?? null,
    operatingHours,
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN");
}

function formatVoucherDiscount(voucher: VoucherItem) {
  if (voucher.type === "PERCENT") {
    const maxDiscount = voucher.max_discount_amount
      ? `, tối đa ${formatCurrency(voucher.max_discount_amount)} VND`
      : "";

    return `Giảm ${voucher.discount_value ?? 0}%${maxDiscount}`;
  }

  return `Giảm ${formatCurrency(Number(voucher.discount_value ?? 0))} VND`;
}

function formatVoucherCondition(voucher: VoucherItem) {
  const minOrder = Number(voucher.min_order_value ?? 0);

  if (minOrder > 0) {
    return `Đơn tối thiểu ${formatCurrency(minOrder)} VND`;
  }

  return "Không yêu cầu đơn tối thiểu";
}

function buildDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

function getTodayLocalDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDayOfWeekCandidatesForDb(date: string) {
  if (!date) return [];

  const jsDay = new Date(`${date}T00:00:00`).getDay();

  // Hỗ trợ cả 2 kiểu lưu phổ biến:
  // - JavaScript style: Chủ nhật = 0, Thứ 2 = 1, ..., Thứ 7 = 6
  // - Business style: Thứ 2 = 1, ..., Thứ 7 = 6, Chủ nhật = 7
  if (jsDay === 0) {
    return [0, 7];
  }

  return [jsDay];
}

function formatOperatingTime(value?: string | null) {
  if (!value) return "--:--";
  return value.slice(0, 5);
}

function formatDateDisplay(value?: string | null) {
  if (!value) return "--/--/----";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--/--/----";
  }

  return date.toLocaleDateString("vi-VN");
}

function formatTimeDisplay(value?: string | null) {
  if (!value) return "--:--";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDurationDisplay(start?: string | null, end?: string | null) {
  if (!start || !end) return "0 giờ";

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return "0 giờ";
  }

  const minutes = Math.max(
    0,
    Math.round((endDate.getTime() - startDate.getTime()) / 60000),
  );

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  if (remainMinutes === 0) {
    return `${hours} giờ`;
  }

  if (hours === 0) {
    return `${remainMinutes} phút`;
  }

  return `${hours} giờ ${remainMinutes} phút`;
}

function formatPaymentMethodLabel(
  method?: "ONSITE" | "BANK_TRANSFER" | null,
) {
  return method === "BANK_TRANSFER"
    ? "Chuyển khoản ngân hàng"
    : "Thanh toán tại sân";
}

function formatPricingDayType(value?: string | null) {
  switch (value) {
    case "WEEKDAY":
      return "Ngày thường";
    case "WEEKEND":
      return "Cuối tuần";
    case "HOLIDAY":
      return "Ngày lễ";
    case "CUSTOM":
      return "Giá tùy chỉnh";
    default:
      return null;
  }
}

export default function BookingPage() {
  
  // /booking/5 thì FieldId=5
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fieldId = Number(params?.id);

  const [step, setStep] = useState(1);
  const [field, setField] = useState<FieldUi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

  const [bookingData, setBookingData] = useState({
    date: "",
    durationHours: 1,
    selectedSlot: null as SlotUi | null,
    fullName: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "ONSITE" as "ONSITE" | "BANK_TRANSFER",
  });

  const [slots, setSlots] = useState<SlotUi[]>([]);
  const [createdBooking, setCreatedBooking] = useState<CreatedBookingUi | null>(
    null,
  );
  const [voucherCode, setVoucherCode] = useState("");
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);
  const [voucherError, setVoucherError] = useState("");
  const [voucherMessage, setVoucherMessage] = useState("");
  const [availableVouchers, setAvailableVouchers] = useState<VoucherItem[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [appliedVoucher, setAppliedVoucher] = useState<null | {
    voucher: {
      id: number;
      code: string;
      type: "FIXED" | "PERCENT";
      discount_value: number | null;
    };
    order_amount: number;
    discount_amount: number;
    final_amount: number;
  }>(null);

  useEffect(() => {
    if (!fieldId || Number.isNaN(fieldId)) {
      router.replace("/browse");
      return;
    }

    const token = getStoredAccessToken();
    const user = getStoredUser();
    const role = String(user?.role ?? "").toUpperCase();

    if (!token || !user) {
      router.replace(`/login?redirect=/booking/${fieldId}`);
      return;
    }

    if (role === "OWNER") {
      router.replace("/owner/dashboard");
      return;
    }

    if (role === "ADMIN") {
      router.replace("/admin/dashboard");
      return;
    }

    if (role !== "USER") {
      router.replace("/browse");
      return;
    }

    setAuthChecked(true);
  }, [fieldId, router]);
  useEffect(() => {
    if (!authChecked) return;
    if (!fieldId || Number.isNaN(fieldId)) return;

    let cancelled = false;

    async function fetchField() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getFieldDetail(fieldId);

        if (cancelled) return;

        const mappedField = mapFieldDetailToUi(result.data);

        console.log("FIELD DETAIL RESPONSE:", result.data);
        console.log("MAPPED FIELD:", mappedField);
        console.log("MAPPED OPERATING HOURS:", mappedField.operatingHours);

        setField(mappedField);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải thông tin sân",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchField();

    return () => {
      cancelled = true;
    };
  }, [authChecked, fieldId]);

  useEffect(() => {
    if (!authChecked) return;
    if (!field?.ownerId) {
      setAvailableVouchers([]);
      return;
    }

    let cancelled = false;

    async function fetchAvailableVouchers() {
      try {
        setVouchersLoading(true);

        const result = await getAvailableVouchers(field?.ownerId ?? null);

        if (cancelled) return;

        setAvailableVouchers(result.data ?? []);
      } catch (err) {
        if (cancelled) return;
        setAvailableVouchers([]);
        console.error("LOAD AVAILABLE VOUCHERS ERROR:", err);
      } finally {
        if (!cancelled) setVouchersLoading(false);
      }
    }

    fetchAvailableVouchers();

    return () => {
      cancelled = true;
    };
  }, [field?.ownerId]);

  useEffect(() => {
    if (!fieldId || !bookingData.date) {
      setSlots([]);
      return;
    }

    let cancelled = false;

    async function fetchSlots() {
      try {
        setSlotsLoading(true);
        setError("");

        const result = await getBookingAvailabilitySlots({
          field_id: fieldId,
          date: bookingData.date,
          duration_minutes: bookingData.durationHours * 60,
        });

        if (cancelled) return;

        setSlots((result.data.slots ?? []) as SlotUi[]);
        ///debug
        console.log("AVAILABILITY RESPONSE:", result.data);
        console.log("SLOTS:", result.data.slots);
      } catch (err) {
        if (cancelled) return;
        setSlots([]);
        setError(
          err instanceof Error ? err.message : "Không thể tải khung giờ",
        );
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    fetchSlots();

    return () => {
      cancelled = true;
    };
  }, [authChecked, fieldId, bookingData.date, bookingData.durationHours]);

  const selectedEndTime = bookingData.selectedSlot?.end_time ?? "";

  const selectedOperatingHour = useMemo(() => {
    if (!field || !bookingData.date) return null;

    const dayCandidates = getDayOfWeekCandidatesForDb(bookingData.date);

    return (
      field.operatingHours.find((item) =>
        dayCandidates.includes(Number(item.day_of_week)),
      ) ?? null
    );
  }, [field, bookingData.date]);
  const previewPricingSlot = useMemo(() => {
    if (bookingData.selectedSlot) {
      return bookingData.selectedSlot;
    }

    const firstAvailableSlot = slots.find((slot) => slot.available);

    return firstAvailableSlot ?? null;
  }, [bookingData.selectedSlot, slots]);

  const selectedSlotPricePerHour = useMemo(() => {
    if (!field) return 0;

    const slotPrice = previewPricingSlot?.price_per_hour;

    if (slotPrice !== undefined && slotPrice !== null) {
      return Number(slotPrice);
    }

    return field.pricePerHour;
  }, [field, previewPricingSlot]);

  const selectedSlotCurrency =
    previewPricingSlot?.currency || field?.currency || "VND";

  const selectedPricingDayLabel = formatPricingDayType(
    previewPricingSlot?.pricing_day_type,
  );

  const subtotal = useMemo(() => {
    if (!field) return 0;

    const slotTotal = previewPricingSlot?.total_price;

    if (slotTotal !== undefined && slotTotal !== null) {
      return Number(slotTotal);
    }

    return selectedSlotPricePerHour * bookingData.durationHours;
  }, [field, previewPricingSlot, selectedSlotPricePerHour, bookingData.durationHours]);

  const voucherDiscount = appliedVoucher?.discount_amount ?? 0;
  const serviceFee = 0;
  const finalAmount = Math.max(subtotal - voucherDiscount, 0);

  const handleDateChange = (value: string) => {
    setBookingData((prev) => ({
      ...prev,
      date: value,
      selectedSlot: null,
    }));
    setAppliedVoucher(null);
    setVoucherMessage("");
    setVoucherError("");
  };

  const handleDurationChange = (delta: number) => {
    setBookingData((prev) => {
      const next = Math.min(4, Math.max(1, prev.durationHours + delta));
      return {
        ...prev,
        durationHours: next,
        selectedSlot: null,
      };
    });

    setAppliedVoucher(null);
    setVoucherMessage("");
    setVoucherError("");
  };

  const handleApplyVoucher = async (codeOverride?: string) => {
    if (!field) return;

    const code = (codeOverride ?? voucherCode).trim().toUpperCase();

    if (!code) {
      setVoucherError("Vui lòng nhập mã voucher");
      setVoucherMessage("");
      setAppliedVoucher(null);
      return;
    }

    if (subtotal <= 0) {
      setVoucherError("Vui lòng chọn thời lượng đặt sân trước khi áp voucher");
      setVoucherMessage("");
      setAppliedVoucher(null);
      return;
    }

    try {
      setIsApplyingVoucher(true);
      setVoucherError("");
      setVoucherMessage("");

      const result = await validateVoucher({
        code,
        order_amount: subtotal,
        owner_id: field.ownerId,
      });

      setAppliedVoucher({
        voucher: result.data.voucher,
        order_amount: result.data.order_amount,
        discount_amount: result.data.discount_amount,
        final_amount: result.data.final_amount,
      });

      setVoucherCode(result.data.voucher.code);
      setVoucherMessage(
        `Áp dụng voucher thành công, giảm ${formatCurrency(
          result.data.discount_amount,
        )} VND`,
      );
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherMessage("");
      setVoucherError(
        err instanceof Error ? err.message : "Voucher không hợp lệ",
      );
    } finally {
      setIsApplyingVoucher(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCode("");
    setVoucherMessage("");
    setVoucherError("");
  };

  const handleCreateBooking = async () => {
    const token = getStoredAccessToken();
    const user = getStoredUser();
    const role = String(user?.role ?? "").toUpperCase();

    if (!token || !user) {
      router.push(`/login?redirect=/booking/${fieldId}`);
      return;
    }

    if (role !== "USER") {
      setError("Chỉ tài khoản khách hàng mới được đặt sân");
      return;
    }

    if (!field) return;

    if (!bookingData.date || !bookingData.selectedSlot) {
      setError("Vui lòng chọn ngày và khung giờ");
      return;
    }

    try {
      setError("");
      console.log("DURATION HOURS UI:", bookingData.durationHours);
      console.log("SELECTED SLOT:", bookingData.selectedSlot);
      console.log("CREATE BOOKING PAYLOAD:", {
        field_id: field.id,
        start_datetime: bookingData.selectedSlot.start_datetime,
        end_datetime: bookingData.selectedSlot.end_datetime,
        notes: bookingData.notes || null,
      });

      // const result = await createBooking({
      //   field_id: field.id,
      //   start_datetime: bookingData.selectedSlot.start_datetime,
      //   end_datetime: bookingData.selectedSlot.end_datetime,
      //   notes: bookingData.notes || null,
      // });
      const result = await createBooking({
        field_id: field.id,
        start_datetime: bookingData.selectedSlot.start_datetime,
        end_datetime: bookingData.selectedSlot.end_datetime,
        contact_name: bookingData.fullName || null,
        contact_email: bookingData.email || null,
        contact_phone: bookingData.phone || null,
        notes: bookingData.notes || null,
        requested_payment_method: bookingData.paymentMethod,
        voucher_code: appliedVoucher?.voucher.code ?? null,
      });

      setCreatedBooking({
        id: result.data.id,
        field_id: result.data.field_id,
        user_id: result.data.user_id,
        start_datetime: result.data.start_datetime,
        end_datetime: result.data.end_datetime,
        status: result.data.status,
        original_price: result.data.original_price ?? result.data.total_price,
        discount_amount: result.data.discount_amount ?? 0,
        total_price: result.data.total_price,
        voucher_id: result.data.voucher_id ?? null,
        voucher: result.data.voucher ?? null,
        requested_payment_method:
          result.data.requested_payment_method ?? bookingData.paymentMethod,
      });
      if (
        result.data.status === "AWAITING_PAYMENT" &&
        (result.data.requested_payment_method ?? bookingData.paymentMethod) ===
          "BANK_TRANSFER"
      ) {
        router.push(`/payment/${result.data.id}`);
        return;
      }

      setStep(4);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Tạo booking thất bại. Có thể bạn cần đăng nhập trước.",
      );
    }
  };
  if (!authChecked) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p data-cy="booking-loading" className="text-lg text-muted-foreground">
            Đang tải trang đặt sân...
          </p>
        </div>
      </main>
    );
  }

  if (error && !field) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 data-cy="booking-page-error-title" className="text-2xl font-bold">Không thể tải trang đặt sân</h1>
          <p data-cy="booking-page-error-message" className="text-muted-foreground mt-2">{error}</p>
          <Link href="/browse">
            <Button className="mt-4">Về danh sách sân</Button>
          </Link>
        </div>
      </main>
    );
  }

  if (!field) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href={`/field/${field.id}`}
            className="text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Hoàn tất đặt sân</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Ngày & Giờ" },
              { num: 2, label: "Thông tin" },
              { num: 3, label: "Xác nhận" },
              { num: 4, label: "Hoàn tất" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      s.num <= step
                        ? "bg-primary text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.num < step ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 text-center">{s.label}</span>
                </div>
                {idx < 3 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${s.num < step ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <Alert data-cy="booking-error" variant="destructive" className="mb-6 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card data-cy="booking-step-date-time" className="p-6">
                <h2 className="text-xl font-semibold mb-6">Chọn ngày và giờ</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Ngày đặt
                  </label>
                  <input
                    data-cy="booking-date-input"
                    type="date"
                    className="w-full border border-border rounded-md px-3 py-2 bg-background"
                    value={bookingData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={getTodayLocalDate()}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Thời lượng
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      data-cy="booking-duration-decrease"
                      variant="outline"
                      onClick={() => handleDurationChange(-1)}
                      disabled={bookingData.durationHours <= 1}
                    >
                      -
                    </Button>
                    <span data-cy="booking-duration-value" className="text-xl font-semibold w-20 text-center">
                      {bookingData.durationHours} giờ
                    </span>
                    <Button
                      data-cy="booking-duration-increase"
                      variant="outline"
                      onClick={() => handleDurationChange(1)}
                      disabled={bookingData.durationHours >= 4}
                    >
                      +
                    </Button>
                  </div>
                  {bookingData.selectedSlot && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Từ {bookingData.selectedSlot.start_time} đến{" "}
                      {selectedEndTime}
                    </p>
                  )}
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <CalendarDays className="w-5 h-5 text-primary" />
                    <h3 className="font-medium">Khung giờ khả dụng</h3>
                  </div>

                  {!bookingData.date ? (
                    <div data-cy="booking-no-date-message" className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                      Vui lòng chọn ngày để xem các khung giờ trống
                    </div>
                  ) : slotsLoading ? (
                    <div data-cy="booking-slots-loading" className="text-center py-8 text-muted-foreground">
                      Đang tải khung giờ...
                    </div>
                  ) : slots.length === 0 ? (
                    <div data-cy="booking-slots-empty" className="text-center py-8 text-muted-foreground">
                      Không có khung giờ phù hợp trong ngày này
                    </div>
                  ) : (
                    <div data-cy="booking-slots-grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot) => {
                        const isSelected =
                          bookingData.selectedSlot?.start_datetime ===
                          slot.start_datetime;

                        return (
                          <button
                            data-cy={slot.available ? "booking-slot-available" : "booking-slot-unavailable"}
                            key={slot.start_datetime}
                            disabled={!slot.available}
                            onClick={() => {
                              setBookingData((prev) => ({
                                ...prev,
                                selectedSlot: slot,
                              }));
                              setAppliedVoucher(null);
                              setVoucherMessage("");
                              setVoucherError("");
                            }}
                            className={`rounded-lg border px-3 py-3 text-sm transition ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary"
                                : slot.available
                                  ? "border-border hover:border-primary/50"
                                  : "border-border bg-muted text-muted-foreground cursor-not-allowed"
                            }`}
                            title={slot.reason ?? ""}
                          >
                            <div className="font-medium">{slot.start_time}</div>
                            <div className="text-xs mt-1">{slot.end_time}</div>
                            {slot.price_per_hour !== undefined &&
                              slot.price_per_hour !== null && (
                                <div className="text-[11px] mt-1 font-medium">
                                  {formatCurrency(Number(slot.price_per_hour))} VND/giờ
                                </div>
                              )}
                            {!slot.available && (
                              <div className="text-[10px] mt-1">
                                {slot.reason ?? "Không khả dụng"}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex justify-end mt-6">
                  <Button
                    data-cy="booking-step1-next"
                    onClick={() => setStep(2)}
                    disabled={!bookingData.date || !bookingData.selectedSlot}
                  >
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card data-cy="booking-step-info" className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Thông tin người đặt
                </h2>

                <div className="grid gap-4">
                  <input
                    data-cy="booking-full-name"
                    className="w-full border border-border rounded-md px-3 py-2 bg-background"
                    placeholder="Họ và tên"
                    value={bookingData.fullName}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        fullName: e.target.value,
                      }))
                    }
                  />
                  <input
                    data-cy="booking-email"
                    className="w-full border border-border rounded-md px-3 py-2 bg-background"
                    placeholder="Email"
                    value={bookingData.email}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                  />
                  <input
                    data-cy="booking-phone"
                    className="w-full border border-border rounded-md px-3 py-2 bg-background"
                    placeholder="Số điện thoại"
                    value={bookingData.phone}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                  />
                  <textarea
                    data-cy="booking-notes"
                    className="w-full min-h-[120px] border border-border rounded-md px-3 py-2 bg-background"
                    placeholder="Ghi chú"
                    value={bookingData.notes}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        notes: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="flex justify-between mt-6">
                  <Button data-cy="booking-step2-back" variant="outline" onClick={() => setStep(1)}>
                    Quay lại
                  </Button>
                  <Button data-cy="booking-step2-next" onClick={() => setStep(3)}>Tiếp tục</Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card data-cy="booking-step-confirm" className="p-6">
                <h2 className="text-xl font-semibold mb-6">Xác nhận đặt sân</h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sân</span>
                    <span className="font-medium">{field.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày</span>
                    <span className="font-medium">{bookingData.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giờ</span>
                    <span className="font-medium">
                      {bookingData.selectedSlot?.start_time} -{" "}
                      {bookingData.selectedSlot?.end_time}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời lượng</span>
                    <span className="font-medium">
                      {bookingData.durationHours} giờ
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Người đặt</span>
                    <span className="font-medium">
                      {bookingData.fullName || "Chưa nhập"}
                    </span>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="font-medium mb-3">Phương thức thanh toán</p>

                  <div className="grid gap-3">
                    <button
                      data-cy="payment-method-onsite"
                      type="button"
                      onClick={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          paymentMethod: "ONSITE",
                        }))
                      }
                      className={`text-left rounded-lg border p-4 transition ${
                        bookingData.paymentMethod === "ONSITE"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Thanh toán tại sân</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Khách thanh toán trực tiếp khi đến sân.
                      </div>
                    </button>

                    <button
                      data-cy="payment-method-bank-transfer"
                      type="button"
                      onClick={() =>
                        setBookingData((prev) => ({
                          ...prev,
                          paymentMethod: "BANK_TRANSFER",
                        }))
                      }
                      className={`text-left rounded-lg border p-4 transition ${
                        bookingData.paymentMethod === "BANK_TRANSFER"
                          ? "border-primary bg-primary/10"
                          : "border-border hover:border-primary/50"
                      }`}
                    >
                      <div className="font-medium">Chuyển khoản ngân hàng</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Sau khi booking được duyệt, hệ thống sẽ cho phép thanh
                        toán giả lập.
                      </div>
                    </button>
                  </div>
                </div>
                <div className="border-t border-border pt-4 mt-4">
                  <p className="font-medium mb-3">Mã giảm giá</p>

                  <div className="flex gap-2">
                    <input
                      data-cy="voucher-code-input"
                      className="flex-1 border border-border rounded-md px-3 py-2 bg-background"
                      placeholder="Nhập mã voucher"
                      value={voucherCode}
                      onChange={(e) => {
                        setVoucherCode(e.target.value.toUpperCase());
                        setVoucherError("");
                        setVoucherMessage("");
                      }}
                      disabled={Boolean(appliedVoucher) || isApplyingVoucher}
                    />

                    {appliedVoucher ? (
                      <Button
                        data-cy="voucher-remove-button"
                        type="button"
                        variant="outline"
                        onClick={handleRemoveVoucher}
                      >
                        Bỏ áp dụng
                      </Button>
                    ) : (
                      <Button
                        data-cy="voucher-apply-button"
                        type="button"
                        variant="outline"
                        onClick={() => handleApplyVoucher()}
                        disabled={isApplyingVoucher || !voucherCode.trim()}
                      >
                        {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                      </Button>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium">Voucher khả dụng</p>
                      {vouchersLoading && (
                        <span className="text-xs text-muted-foreground">
                          Đang tải...
                        </span>
                      )}
                    </div>

                    {vouchersLoading ? (
                      <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-3">
                        Đang tải voucher khả dụng...
                      </div>
                    ) : availableVouchers.length === 0 ? (
                      <div className="text-sm text-muted-foreground border border-dashed border-border rounded-lg p-3">
                        Hiện chưa có voucher khả dụng cho sân này.
                      </div>
                    ) : (
                      <div className="grid gap-2">
                        {availableVouchers.map((voucher) => {
                          const isSelected =
                            appliedVoucher?.voucher.code === voucher.code ||
                            voucherCode === voucher.code;

                          return (
                            <button
                              key={voucher.id}
                              type="button"
                              disabled={
                                Boolean(appliedVoucher) || isApplyingVoucher
                              }
                              onClick={() => {
                                setVoucherCode(voucher.code);
                                setVoucherError("");
                                setVoucherMessage("");
                                void handleApplyVoucher(voucher.code);
                              }}
                              className={`text-left rounded-lg border p-3 transition ${
                                isSelected
                                  ? "border-primary bg-primary/10"
                                  : "border-border hover:border-primary/50"
                              } ${
                                Boolean(appliedVoucher) || isApplyingVoucher
                                  ? "opacity-70 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="font-semibold text-sm">
                                    {voucher.code}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {formatVoucherDiscount(voucher)}
                                  </div>
                                  <div className="text-xs text-muted-foreground mt-1">
                                    {formatVoucherCondition(voucher)}
                                  </div>
                                </div>

                                <span className="text-xs font-medium text-primary whitespace-nowrap">
                                  {isSelected ? "Đã chọn" : "Dùng mã"}
                                </span>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {voucherMessage && (
                    <p data-cy="voucher-message" className="text-sm text-green-600 mt-2">
                      {voucherMessage}
                    </p>
                  )}

                  {voucherError && (
                    <p data-cy="voucher-error" className="text-sm text-red-600 mt-2">{voucherError}</p>
                  )}
                </div>

                <Alert className="mt-6">
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Nếu chọn chuyển khoản ngân hàng, booking chỉ được thanh toán
                    khi đã được duyệt hoặc sân đang ở chế độ tự động duyệt. Nếu
                    chọn thanh toán tại sân, anh sẽ thanh toán trực tiếp khi đến
                    sân.
                  </AlertDescription>
                </Alert>

                <div className="flex justify-between mt-6">
                  <Button data-cy="booking-step3-back" variant="outline" onClick={() => setStep(2)}>
                    Quay lại
                  </Button>
                  <Button data-cy="booking-submit" onClick={handleCreateBooking}>
                    Xác nhận đặt sân
                  </Button>
                </div>
              </Card>
            )}

            {step === 4 && createdBooking && (
              <Card data-cy="booking-success-card" className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 data-cy="booking-success-title" className="text-2xl font-bold mb-2">Đặt sân thành công</h2>
                {/* <p className="text-muted-foreground mb-6">
                  Booking của anh đã được tạo với mã #{createdBooking.id}
                </p> */}
                <p className="text-muted-foreground mb-6">
                  {createdBooking.requested_payment_method === "BANK_TRANSFER"
                    ? "Booking của anh đã được tạo. Sau khi chủ sân duyệt, anh có thể thanh toán trong mục lịch sử booking."
                    : "Booking của anh đã được tạo. Anh sẽ thanh toán trực tiếp khi đến sân."}
                </p>

                <div className="bg-muted rounded-lg p-4 text-left max-w-md mx-auto mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Mã booking</span>
                    <span className="font-medium">#{createdBooking.id}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Ngày đặt</span>
                    <span className="font-medium">
                      {formatDateDisplay(createdBooking.start_datetime)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Giờ đặt</span>
                    <span className="font-medium">
                      {formatTimeDisplay(createdBooking.start_datetime)} - {" "}
                      {formatTimeDisplay(createdBooking.end_datetime)}
                    </span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span className="font-medium">{createdBooking.status}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Thanh toán</span>
                    <span className="font-medium text-right">
                      {formatPaymentMethodLabel(
                        createdBooking.requested_payment_method,
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền</span>
                    <span className="font-medium">
                      {formatCurrency(Number(createdBooking.total_price))} VND
                    </span>
                  </div>
                </div>

                <div className="flex gap-4 justify-center">
                  <Link href={`/field/${field.id}`}>
                    <Button data-cy="back-to-field-detail" variant="outline">Về chi tiết sân</Button>
                  </Link>
                  <Link href="/bookings">
                    <Button data-cy="view-booking-history">Xem lịch sử booking</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card data-cy="booking-summary-card" className="p-6 sticky top-24">
              <img
                src={field.image || "/placeholder.svg"}
                alt={field.name}
                onError={(event) => {
                  event.currentTarget.src = "/placeholder.svg";
                }}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <h3
                data-cy="booking-summary-field-name"
                className="text-lg font-bold mb-2"
              >
                {field.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {field.location}
              </p>

              {createdBooking ? (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã booking</span>
                    <span className="font-medium">#{createdBooking.id}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày đặt</span>
                    <span className="font-medium">
                      {formatDateDisplay(createdBooking.start_datetime)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giờ đặt</span>
                    <span className="font-medium">
                      {formatTimeDisplay(createdBooking.start_datetime)} - {" "}
                      {formatTimeDisplay(createdBooking.end_datetime)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời lượng</span>
                    <span className="font-medium">
                      {formatDurationDisplay(
                        createdBooking.start_datetime,
                        createdBooking.end_datetime,
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span className="font-medium text-right">
                      {createdBooking.status}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thanh toán</span>
                    <span className="font-medium text-right">
                      {formatPaymentMethodLabel(
                        createdBooking.requested_payment_method,
                      )}
                    </span>
                  </div>

                  <div className="border-t border-border pt-3 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tạm tính</span>
                      <span className="font-medium">
                        {formatCurrency(
                          Number(createdBooking.original_price ?? 0),
                        )} {" "}
                        VND
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Phí dịch vụ</span>
                      <span className="font-medium">0 VND</span>
                    </div>

                    {Number(createdBooking.discount_amount ?? 0) > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          Giảm giá
                          {createdBooking.voucher?.code
                            ? ` (${createdBooking.voucher.code})`
                            : ""}
                        </span>
                        <span className="font-medium">
                          -
                          {formatCurrency(
                            Number(createdBooking.discount_amount ?? 0),
                          )} {" "}
                          VND
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between border-t border-border pt-3 text-base">
                      <span className="font-semibold">Tổng cộng</span>
                      <span className="font-bold text-primary">
                        {formatCurrency(Number(createdBooking.total_price ?? 0))} {" "}
                        VND
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giờ hoạt động</span>
                    <span className="font-medium">
                      {selectedOperatingHour
                        ? `${formatOperatingTime(
                            selectedOperatingHour.open_time,
                          )} - ${formatOperatingTime(
                            selectedOperatingHour.close_time,
                          )}`
                        : field.openTime && field.closeTime
                          ? `${formatOperatingTime(
                              field.openTime,
                            )} - ${formatOperatingTime(field.closeTime)}`
                          : bookingData.date
                            ? "Không hoạt động ngày này"
                            : "Chưa chọn ngày"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày đặt</span>
                    <span className="font-medium">
                      {bookingData.date || "Chưa chọn"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giờ đặt</span>
                    <span className="font-medium text-right">
                      {bookingData.selectedSlot
                        ? `${bookingData.selectedSlot.start_time} - ${bookingData.selectedSlot.end_time}`
                        : "Chưa chọn"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Thời lượng</span>
                    <span className="font-medium">
                      {bookingData.durationHours} giờ
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giá / giờ</span>
                    <span className="font-medium">
                      {formatCurrency(selectedSlotPricePerHour)} {selectedSlotCurrency}
                    </span>
                  </div>

                  {selectedPricingDayLabel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loại giá</span>
                      <span className="font-medium">
                        {selectedPricingDayLabel}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tạm tính</span>
                    <span className="font-medium">
                      {formatCurrency(subtotal)} {selectedSlotCurrency}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phí dịch vụ</span>
                    <span className="font-medium">
                      {formatCurrency(serviceFee)} {selectedSlotCurrency}
                    </span>
                  </div>

                  {appliedVoucher && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá ({appliedVoucher.voucher.code})</span>
                      <span className="font-medium">
                        -{formatCurrency(voucherDiscount)} {selectedSlotCurrency}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <span className="font-semibold">Tổng cộng</span>
                    <span className="font-bold text-primary">
                      {formatCurrency(finalAmount)} {selectedSlotCurrency}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
