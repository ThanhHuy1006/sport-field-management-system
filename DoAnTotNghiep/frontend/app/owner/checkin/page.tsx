"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  QrCode,
  Camera,
  CheckCircle2,
  XCircle,
  Search,
  Calendar,
  Clock,
  User,
  Phone,
  MapPin,
  Keyboard,
  History,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import {
  checkInOwnerBooking,
  completeOwnerBooking,
  getOwnerBookingDetail,
  getOwnerBookings,
  scanOwnerBookingQr,
  type OwnerBookingDetail,
} from "@/features/bookings/services/owner-checkin";

type CheckinResult = "success" | "error" | "already" | "completed" | null;

type CheckinHistoryItem = {
  bookingRef: string;
  customerName: string;
  time: string;
  fieldName: string;
};

const QR_READER_ID = "owner-qr-reader";

function parseBookingId(value: string) {
  const raw = value.trim();

  if (!raw) return NaN;

  const directNumber = Number(raw);
  if (!Number.isNaN(directNumber) && directNumber > 0) {
    return directNumber;
  }

  const match = raw.match(/\d+$/);
  return match ? Number(match[0]) : NaN;
}

function formatCurrency(value: string | number) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

function formatTimeRange(start: string, end: string) {
  return `${formatTime(start)} - ${formatTime(end)}`;
}

function getDurationHours(start: string, end: string) {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const diffMs = endDate.getTime() - startDate.getTime();
  const hours = diffMs / 1000 / 60 / 60;

  return Number.isFinite(hours) ? hours : 0;
}

function getCustomerName(booking: OwnerBookingDetail) {
  return booking.contact_name || booking.user?.name || "Khách hàng";
}

function getCustomerPhone(booking: OwnerBookingDetail) {
  return booking.contact_phone || booking.user?.phone || "Chưa cập nhật";
}

function getFieldName(booking: OwnerBookingDetail) {
  return booking.field?.field_name || "Sân thể thao";
}

function getBookingRef(booking: OwnerBookingDetail) {
  return `BK-${booking.id}`;
}

function getPaymentMethodLabel(
  method: OwnerBookingDetail["requested_payment_method"]
) {
  if (method === "BANK_TRANSFER") return "Chuyển khoản ngân hàng";
  return "Thanh toán tại sân";
}

function getStatusLabel(status: string) {
  switch (status) {
    case "PENDING_CONFIRM":
      return "Chờ xác nhận";
    case "APPROVED":
      return "Đã xác nhận";
    case "AWAITING_PAYMENT":
      return "Chờ thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "CHECKED_IN":
      return "Đã check-in";
    case "COMPLETED":
      return "Hoàn thành";
    case "PAY_FAILED":
      return "Thanh toán thất bại";
    case "REJECTED":
      return "Đã từ chối";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function canCheckIn(booking: OwnerBookingDetail | null) {
  if (!booking) return false;

  if (booking.checked_in_at || booking.status === "CHECKED_IN") {
    return false;
  }

  if (booking.requested_payment_method === "BANK_TRANSFER") {
    return booking.status === "PAID";
  }

  return booking.status === "APPROVED";
}

function canComplete(booking: OwnerBookingDetail | null) {
  return booking?.status === "CHECKED_IN";
}

function isToday(value: string) {
  const target = new Date(value);
  const now = new Date();

  return (
    target.getFullYear() === now.getFullYear() &&
    target.getMonth() === now.getMonth() &&
    target.getDate() === now.getDate()
  );
}

export default function OwnerCheckinPage() {
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const [inputMethod, setInputMethod] = useState<"camera" | "manual">("manual");
  const [manualCode, setManualCode] = useState("");
  const [qrToken, setQrToken] = useState("");
  const [scanning, setScanning] = useState(false);

  const [todayBookings, setTodayBookings] = useState<OwnerBookingDetail[]>([]);
  const [foundBooking, setFoundBooking] = useState<OwnerBookingDetail | null>(
    null
  );
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [checkinResult, setCheckinResult] = useState<CheckinResult>(null);
  const [checkinHistory, setCheckinHistory] = useState<CheckinHistoryItem[]>(
    []
  );

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const scannerRef = useRef<any>(null);
  const hasScannedRef = useRef(false);

  const todayStats = {
    total: todayBookings.length,
    checkedIn: todayBookings.filter(
      (item) => item.status === "CHECKED_IN" || item.status === "COMPLETED"
    ).length,
    pending: todayBookings.filter((item) => canCheckIn(item)).length,
  };

  async function loadTodayBookings() {
    try {
      const res = await getOwnerBookings({
        page: 1,
        limit: 50,
      });

      const items = res.data.items.filter((item) =>
        isToday(item.start_datetime)
      );

      setTodayBookings(items);
    } catch {
      setTodayBookings([]);
    }
  }

  async function loadBookingById(bookingId: number) {
    if (!bookingId || Number.isNaN(bookingId)) {
      toast({
        title: "Mã booking không hợp lệ",
        description: "Vui lòng nhập ID booking, ví dụ: 36 hoặc BK-36",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);

      const res = await getOwnerBookingDetail(bookingId);
      setFoundBooking(res.data);

      if (res.data.status === "CHECKED_IN") {
        setCheckinResult("already");
      } else if (res.data.status === "COMPLETED") {
        setCheckinResult("completed");
      } else {
        setCheckinResult(null);
      }

      setShowResultDialog(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không tìm thấy booking";

      setFoundBooking(null);

      toast({
        title: "Không tìm thấy booking",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const handleManualSearch = async () => {
    const bookingId = parseBookingId(manualCode);
    await loadBookingById(bookingId);
  };

  const handleCheckin = async () => {
    if (!foundBooking) return;

    if (!canCheckIn(foundBooking)) {
      toast({
        title: "Không thể check-in",
        description:
          foundBooking.requested_payment_method === "BANK_TRANSFER"
            ? "Booking chuyển khoản phải thanh toán thành công trước khi check-in."
            : "Booking thanh toán tại sân phải được xác nhận trước khi check-in.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await checkInOwnerBooking(foundBooking.id);
      setFoundBooking(res.data);
      setCheckinResult("success");

      setCheckinHistory((prev) => [
        {
          bookingRef: getBookingRef(res.data),
          customerName: getCustomerName(res.data),
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          fieldName: getFieldName(res.data),
        },
        ...prev.slice(0, 4),
      ]);

      await loadTodayBookings();

      toast({
        title: "Check-in thành công",
        description: `${getCustomerName(res.data)} đã check-in tại ${getFieldName(
          res.data
        )}.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Check-in thất bại";

      setCheckinResult("error");

      toast({
        title: "Check-in thất bại",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleComplete = async () => {
    if (!foundBooking) return;

    if (!canComplete(foundBooking)) {
      toast({
        title: "Không thể hoàn thành",
        description: "Chỉ booking đã CHECKED_IN mới được hoàn thành.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await completeOwnerBooking(foundBooking.id);
      setFoundBooking(res.data);
      setCheckinResult("completed");

      await loadTodayBookings();

      toast({
        title: "Hoàn thành booking",
        description: `Booking #${res.data.id} đã được chuyển sang COMPLETED.`,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Hoàn thành booking thất bại";

      toast({
        title: "Hoàn thành thất bại",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stopCameraScanning = async () => {
    try {
      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }
    } finally {
      setScanning(false);
    }
  };

  const handleScanQrToken = async (token: string) => {
    const qrTokenValue = token.trim();

    if (!qrTokenValue) {
      toast({
        title: "QR token trống",
        description: "Không đọc được dữ liệu từ QR.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await scanOwnerBookingQr(qrTokenValue);

      setFoundBooking(res.data);
      setCheckinResult("success");
      setShowResultDialog(true);
      setQrToken(qrTokenValue);

      setCheckinHistory((prev) => [
        {
          bookingRef: getBookingRef(res.data),
          customerName: getCustomerName(res.data),
          time: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          fieldName: getFieldName(res.data),
        },
        ...prev.slice(0, 4),
      ]);

      await loadTodayBookings();

      toast({
        title: "Quét QR thành công",
        description: `${getCustomerName(res.data)} đã được check-in.`,
      });
    } catch (error) {
      toast({
        title: "Quét QR thất bại",
        description:
          error instanceof Error
            ? error.message
            : "QR không hợp lệ hoặc đã hết hạn",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScanQr = async () => {
    await handleScanQrToken(qrToken);
  };

  const startCameraScanning = async () => {
    try {
      setScanning(true);
      hasScannedRef.current = false;

      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => resolve());
      });

      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }

      const { Html5Qrcode } = await import("html5-qrcode");

      const scanner = new Html5Qrcode(QR_READER_ID);
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: {
            width: 250,
            height: 250,
          },
        },
        async (decodedText: string) => {
          if (hasScannedRef.current) return;

          hasScannedRef.current = true;
          setQrToken(decodedText);

          await stopCameraScanning();
          await handleScanQrToken(decodedText);
        },
        () => {
          // Bỏ qua lỗi từng frame khi camera chưa thấy QR.
        }
      );
    } catch (error) {
      setScanning(false);

      if (scannerRef.current) {
        await scannerRef.current.stop().catch(() => {});
        await scannerRef.current.clear().catch(() => {});
        scannerRef.current = null;
      }

      toast({
        title: "Không thể mở camera",
        description:
          error instanceof Error
            ? error.message
            : "Vui lòng kiểm tra quyền camera của trình duyệt.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    void loadTodayBookings();

    const bookingIdFromQuery = searchParams.get("bookingId");

    if (bookingIdFromQuery) {
      setManualCode(bookingIdFromQuery);
      void loadBookingById(parseBookingId(bookingIdFromQuery));
    }

    return () => {
      void stopCameraScanning();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Check-in Khách Hàng
        </h1>
        <p className="text-muted-foreground mt-1">
          Quét mã QR hoặc nhập mã đặt sân để check-in
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đơn hôm nay</p>
              <p className="text-2xl font-bold">{todayStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Đã check-in</p>
              <p className="text-2xl font-bold">{todayStats.checkedIn}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ check-in</p>
              <p className="text-2xl font-bold">{todayStats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Phương thức Check-in</h2>

          <div className="flex gap-2 mb-6">
            <Button
              variant={inputMethod === "camera" ? "default" : "outline"}
              onClick={() => setInputMethod("camera")}
              className="flex-1"
            >
              <Camera className="w-4 h-4 mr-2" />
              Quét QR
            </Button>

            <Button
              variant={inputMethod === "manual" ? "default" : "outline"}
              onClick={() => {
                setInputMethod("manual");
                void stopCameraScanning();
              }}
              className="flex-1"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Nhập mã
            </Button>
          </div>

          {inputMethod === "camera" && (
            <div className="space-y-4">
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                {scanning ? (
                  <>
                    <div id={QR_READER_ID} className="w-full h-full" />

                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-primary rounded-lg relative">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
                        <div className="absolute inset-x-0 top-0 h-0.5 bg-primary animate-pulse" />
                      </div>
                    </div>

                    <p className="absolute bottom-4 left-0 right-0 text-center text-white text-sm pointer-events-none">
                      Đang quét... Hướng camera vào mã QR của khách.
                    </p>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                    <QrCode className="w-16 h-16 mb-4" />
                    <p>Nhấn nút bên dưới để bật camera</p>
                  </div>
                )}
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={
                  scanning
                    ? () => void stopCameraScanning()
                    : startCameraScanning
                }
              >
                {scanning ? (
                  <>
                    <XCircle className="w-5 h-5 mr-2" />
                    Dừng quét
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5 mr-2" />
                    Bắt đầu quét
                  </>
                )}
              </Button>

              <div>
                <Label htmlFor="qrToken">QR token</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="qrToken"
                    placeholder="Dán qr_token từ mã QR của khách"
                    value={qrToken}
                    onChange={(event) => setQrToken(event.target.value)}
                    className="flex-1"
                  />

                  <Button onClick={handleScanQr} disabled={isSubmitting}>
                    Xác nhận QR
                  </Button>
                </div>
              </div>
            </div>
          )}

          {inputMethod === "manual" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="bookingCode">Mã đặt sân</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="bookingCode"
                    placeholder="VD: 36 hoặc BK-36"
                    value={manualCode}
                    onChange={(event) => setManualCode(event.target.value)}
                    onKeyDown={(event) =>
                      event.key === "Enter" && handleManualSearch()
                    }
                    className="flex-1"
                  />

                  <Button onClick={handleManualSearch} disabled={isLoading}>
                    <Search className="w-4 h-4 mr-2" />
                    {isLoading ? "Đang tìm..." : "Tìm"}
                  </Button>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">
                  Đơn hôm nay chờ check-in
                </p>

                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {todayBookings.filter(canCheckIn).length === 0 ? (
                    <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-center">
                      Không có đơn nào đang chờ check-in.
                    </div>
                  ) : (
                    todayBookings
                      .filter(canCheckIn)
                      .map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition"
                          onClick={() => {
                            setFoundBooking(booking);
                            setCheckinResult(null);
                            setShowResultDialog(true);
                          }}
                        >
                          <div>
                            <p className="font-medium">
                              {getCustomerName(booking)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {getFieldName(booking)} •{" "}
                              {formatTime(booking.start_datetime)}
                            </p>
                          </div>

                          <Badge variant="outline">
                            {getBookingRef(booking)}
                          </Badge>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">Check-in gần đây</h2>
          </div>

          <div className="space-y-3">
            {checkinHistory.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có check-in nào trong phiên làm việc này</p>
              </div>
            ) : (
              checkinHistory.map((checkin, index) => (
                <div
                  key={`${checkin.bookingRef}-${index}`}
                  className="flex items-center justify-between p-4 bg-muted/50 border border-green-500/30 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>

                    <div>
                      <p className="font-medium text-foreground">
                        {checkin.customerName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {checkin.fieldName}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-mono text-foreground">
                      {checkin.bookingRef}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {checkin.time}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {checkinResult === "success"
                ? "Check-in thành công"
                : checkinResult === "already"
                ? "Đã check-in trước đó"
                : checkinResult === "completed"
                ? "Booking đã hoàn thành"
                : checkinResult === "error"
                ? "Check-in thất bại"
                : "Thông tin đặt sân"}
            </DialogTitle>

            <DialogDescription>
              {checkinResult === "success"
                ? "Khách hàng đã được check-in thành công"
                : checkinResult === "already"
                ? "Đơn đặt sân này đã được check-in trước đó"
                : checkinResult === "completed"
                ? "Đơn đặt sân này đã hoàn thành"
                : checkinResult === "error"
                ? "Có lỗi xảy ra khi check-in"
                : "Xác nhận thông tin và check-in khách hàng"}
            </DialogDescription>
          </DialogHeader>

          {foundBooking && (
            <div className="space-y-4 py-4">
              {checkinResult && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-lg border ${
                    checkinResult === "success" ||
                    checkinResult === "completed"
                      ? "bg-green-500/10 border-green-500/30"
                      : checkinResult === "already"
                      ? "bg-yellow-500/10 border-yellow-500/30"
                      : "bg-red-500/10 border-red-500/30"
                  }`}
                >
                  {checkinResult === "success" ||
                  checkinResult === "completed" ? (
                    <CheckCircle2 className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : checkinResult === "already" ? (
                    <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                  ) : (
                    <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}

                  <div>
                    <p className="font-medium text-foreground">
                      {checkinResult === "success"
                        ? "Check-in hoàn tất"
                        : checkinResult === "completed"
                        ? "Booking đã hoàn thành"
                        : checkinResult === "already"
                        ? "Đã check-in"
                        : "Không thể check-in"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {checkinResult === "success"
                        ? `Lúc ${new Date().toLocaleTimeString("vi-VN")}`
                        : checkinResult === "completed"
                        ? "Khách đã hoàn tất sử dụng sân"
                        : checkinResult === "already"
                        ? foundBooking.checked_in_at
                          ? `Đã check-in lúc ${formatTime(
                              foundBooking.checked_in_at
                            )}`
                          : "Khách hàng đã đến trước đó"
                        : "Vui lòng thử lại"}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Khách hàng</p>
                    <p className="font-medium text-foreground">
                      {getCustomerName(foundBooking)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Số điện thoại
                    </p>
                    <p className="font-medium text-foreground">
                      {getCustomerPhone(foundBooking)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Sân</p>
                    <p className="font-medium text-foreground">
                      {getFieldName(foundBooking)}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Ngày</p>
                      <p className="font-medium text-foreground">
                        {formatDate(foundBooking.start_datetime)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border rounded-lg">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Giờ</p>
                      <p className="font-medium text-foreground">
                        {formatTimeRange(
                          foundBooking.start_datetime,
                          foundBooking.end_datetime
                        )}{" "}
                        ({getDurationHours(
                          foundBooking.start_datetime,
                          foundBooking.end_datetime
                        )}
                        h)
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 p-3 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Mã đặt sân</span>
                    <span className="font-mono font-bold text-foreground">
                      {getBookingRef(foundBooking)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Trạng thái</span>
                    <Badge variant="outline">
                      {getStatusLabel(foundBooking.status)}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Thanh toán</span>
                    <span className="font-medium text-foreground">
                      {getPaymentMethodLabel(
                        foundBooking.requested_payment_method
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Tổng tiền</span>
                    <span className="font-bold text-foreground">
                      {formatCurrency(foundBooking.total_price)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowResultDialog(false)}
            >
              Đóng
            </Button>

            {foundBooking && canCheckIn(foundBooking) && (
              <Button
                onClick={handleCheckin}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isSubmitting ? "Đang check-in..." : "Xác nhận Check-in"}
              </Button>
            )}

            {foundBooking && canComplete(foundBooking) && (
              <Button onClick={handleComplete} disabled={isSubmitting}>
                <CheckCircle2 className="w-4 h-4 mr-2" />
                {isSubmitting ? "Đang hoàn thành..." : "Hoàn thành booking"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}