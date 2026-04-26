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

type FieldUi = {
  id: number;
  name: string;
  location: string;
  image: string | null;
  pricePerHour: number;
  openTime: string | null;
  closeTime: string | null;
};

type SlotUi = {
  start_datetime: string;
  end_datetime: string;
  start_time: string;
  end_time: string;
  available: boolean;
  reason: string | null;
};

function mapFieldDetailToUi(data: FieldDetailResponse["data"]): FieldUi {
  return {
    id: data.id,
    name: data.field_name ?? "Chưa có tên sân",
    location: data.address ?? "Chưa cập nhật địa chỉ",
    image: data.images?.[0]?.url ?? null,
    pricePerHour: Number(data.base_price_per_hour ?? 0),
    openTime: data.openTime ?? null,
    closeTime: data.closeTime ?? null,
  };
}

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN");
}

function buildDateTime(date: string, time: string) {
  return `${date}T${time}:00`;
}

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const fieldId = Number(params?.id);

  const [step, setStep] = useState(1);
  const [field, setField] = useState<FieldUi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [error, setError] = useState("");

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
  const [createdBooking, setCreatedBooking] = useState<null | {
    id: number;
    status: string;
    total_price: string | number;
    requested_payment_method?: "ONSITE" | "BANK_TRANSFER" | null;
  }>(null);

  useEffect(() => {
    if (!fieldId || Number.isNaN(fieldId)) return;

    let cancelled = false;

    async function fetchField() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getFieldDetail(fieldId);

        if (cancelled) return;

        setField(mapFieldDetailToUi(result.data));
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
  }, [fieldId]);

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

        setSlots(result.data.slots ?? []);
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
  }, [fieldId, bookingData.date, bookingData.durationHours]);

  const selectedEndTime = bookingData.selectedSlot?.end_time ?? "";
  const subtotal = useMemo(() => {
    if (!field) return 0;
    return field.pricePerHour * bookingData.durationHours;
  }, [field, bookingData.durationHours]);

  const serviceFee = 50000;
  const finalAmount = subtotal + serviceFee;

  const handleDateChange = (value: string) => {
    setBookingData((prev) => ({
      ...prev,
      date: value,
      selectedSlot: null,
    }));
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
  };

  const handleCreateBooking = async () => {
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
      });

      setCreatedBooking({
        id: result.data.id,
        status: result.data.status,
        total_price: result.data.total_price,
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

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">
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
          <h1 className="text-2xl font-bold">Không thể tải trang đặt sân</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
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
          <Alert variant="destructive" className="mb-6 max-w-4xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {step === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">Chọn ngày và giờ</h2>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Ngày đặt
                  </label>
                  <input
                    type="date"
                    className="w-full border border-border rounded-md px-3 py-2 bg-background"
                    value={bookingData.date}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Thời lượng
                  </label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      onClick={() => handleDurationChange(-1)}
                      disabled={bookingData.durationHours <= 1}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-20 text-center">
                      {bookingData.durationHours} giờ
                    </span>
                    <Button
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
                    <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                      Vui lòng chọn ngày để xem các khung giờ trống
                    </div>
                  ) : slotsLoading ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Đang tải khung giờ...
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Không có khung giờ phù hợp trong ngày này
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {slots.map((slot) => {
                        const isSelected =
                          bookingData.selectedSlot?.start_datetime ===
                          slot.start_datetime;

                        return (
                          <button
                            key={slot.start_datetime}
                            disabled={!slot.available}
                            onClick={() =>
                              setBookingData((prev) => ({
                                ...prev,
                                selectedSlot: slot,
                              }))
                            }
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
                    onClick={() => setStep(2)}
                    disabled={!bookingData.date || !bookingData.selectedSlot}
                  >
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {step === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6">
                  Thông tin người đặt
                </h2>

                <div className="grid gap-4">
                  <input
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
                  <Button variant="outline" onClick={() => setStep(1)}>
                    Quay lại
                  </Button>
                  <Button onClick={() => setStep(3)}>Tiếp tục</Button>
                </div>
              </Card>
            )}

            {step === 3 && (
              <Card className="p-6">
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
                  <Button variant="outline" onClick={() => setStep(2)}>
                    Quay lại
                  </Button>
                  <Button onClick={handleCreateBooking}>
                    Xác nhận đặt sân
                  </Button>
                </div>
              </Card>
            )}

            {step === 4 && createdBooking && (
              <Card className="p-6 text-center">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Đặt sân thành công</h2>
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
                    <span className="text-muted-foreground">Trạng thái</span>
                    <span className="font-medium">{createdBooking.status}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-muted-foreground">Thanh toán</span>
                    <span className="font-medium">
                      {createdBooking.requested_payment_method ===
                      "BANK_TRANSFER"
                        ? "Chuyển khoản ngân hàng"
                        : "Thanh toán tại sân"}
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
                    <Button variant="outline">Về chi tiết sân</Button>
                  </Link>
                  <Link href="/bookings">
                    <Button>Xem lịch sử booking</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <img
                src={field.image || "/placeholder.svg"}
                alt={field.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />

              <h3 className="text-lg font-bold mb-2">{field.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {field.location}
              </p>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giờ hoạt động</span>
                  <span className="font-medium">
                    {field.openTime ?? "--:--"} - {field.closeTime ?? "--:--"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá / giờ</span>
                  <span className="font-medium">
                    {formatCurrency(field.pricePerHour)} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">
                    {formatCurrency(subtotal)} VND
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-medium">
                    {formatCurrency(serviceFee)} VND
                  </span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base">
                  <span className="font-semibold">Tổng cộng</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(finalAmount)} VND
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
