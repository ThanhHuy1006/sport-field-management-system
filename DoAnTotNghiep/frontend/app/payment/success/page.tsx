"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getPaymentByBooking,
  type PaymentResponse,
} from "@/features/payments/services/payment";
import {
  getStoredAccessToken,
  getStoredUser,
} from "@/features/auth/lib/auth-storage";

function formatCurrency(value: string | number) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND";
}

function formatDateTime(value?: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("vi-VN", {
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  });
}

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const bookingId = Number(searchParams.get("bookingId"));
  const paymentId = Number(searchParams.get("paymentId"));

  const [payment, setPayment] = useState<PaymentResponse["data"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const token = getStoredAccessToken();
    const user = getStoredUser();
    const role = String(user?.role ?? "").toUpperCase();

    if (!token || !user) {
      router.replace(
        `/login?redirect=${encodeURIComponent(
          `/payment/success?bookingId=${bookingId}&paymentId=${paymentId}`
        )}`
      );
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
  }, [bookingId, paymentId, router]);

  useEffect(() => {
    if (!authChecked) return;

    async function loadPayment() {
      if (!bookingId || Number.isNaN(bookingId)) {
        setErrorMessage("bookingId không hợp lệ");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);

        const res = await getPaymentByBooking(bookingId);
        setPayment(res.data);
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Không tải được thông tin thanh toán"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadPayment();
  }, [authChecked, bookingId]);

  if (!authChecked) {
    return null;
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin" />
          <p>Đang tải thông tin thanh toán...</p>
        </Card>
      </main>
    );
  }

  if (errorMessage) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 max-w-md w-full text-center">
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <Button onClick={() => router.push("/bookings")}>
            Về đơn đặt sân
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-10">
        <Card className="p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" />
          </div>

          <h1 className="text-2xl font-bold mb-2">Thanh toán thành công</h1>
          <p className="text-muted-foreground mb-8">
            Booking của anh đã được thanh toán và chuyển sang trạng thái PAID.
          </p>

          <div className="rounded-lg border border-border p-5 text-left space-y-3 mb-8">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-medium">#{bookingId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment ID</span>
              <span className="font-medium">#{paymentId}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Mã giao dịch</span>
              <span className="font-medium text-right break-all">
                {payment?.transaction_code ?? "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Phương thức</span>
              <span className="font-medium">
                {payment?.provider ?? "BANK_TRANSFER"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Số tiền</span>
              <span className="font-medium text-primary">
                {payment?.amount ? formatCurrency(payment.amount) : "—"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái payment</span>
              <span className="font-medium text-green-500">
                {payment?.status ?? "success"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Trạng thái booking</span>
              <span className="font-medium">
                {payment?.booking?.status ?? "PAID"}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-muted-foreground">Thanh toán lúc</span>
              <span className="font-medium text-right">
                {formatDateTime(payment?.paid_at)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => router.push("/bookings")}>
              Về đơn đặt sân
            </Button>

            <Button variant="outline" onClick={() => router.push("/")}>
              Về trang chủ
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}