"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  Landmark,
  Loader2,
  XCircle,
  CircleDollarSign,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  createPayment,
  getPaymentByBooking,
  simulatePaymentFailed,
  simulatePaymentSuccess,
  type PaymentResponse,
} from "@/features/payments/services/payment"

function formatCurrency(value: string | number) {
  return Number(value || 0).toLocaleString("vi-VN") + " VND"
}

function formatDateTime(value?: string | null) {
  if (!value) return "—"

  return new Date(value).toLocaleString("vi-VN", {
    hour12: false,
    timeZone: "Asia/Ho_Chi_Minh",
  })
}

function getPaymentStatusUi(status?: string) {
  switch (status) {
    case "success":
      return {
        text: "Thanh toán thành công",
        className:
          "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      }
    case "failed":
      return {
        text: "Thanh toán thất bại",
        className:
          "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      }
    case "pending":
      return {
        text: "Chờ thanh toán",
        className:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      }
    default:
      return {
        text: "Chưa tạo giao dịch",
        className: "bg-gray-100 text-gray-700",
      }
  }
}

export default function PaymentPage() {
  const params = useParams<{ bookingId: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const bookingId = Number(params?.bookingId)

  const [payment, setPayment] = useState<PaymentResponse["data"] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const statusUi = useMemo(() => getPaymentStatusUi(payment?.status), [payment])

  const loadPayment = async () => {
    if (!bookingId || Number.isNaN(bookingId)) {
      setErrorMessage("bookingId không hợp lệ")
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setErrorMessage(null)

      const res = await getPaymentByBooking(bookingId)
      setPayment(res.data)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không tải được payment"

      // Booking chưa từng tạo payment thì cho phép user bấm tạo giao dịch.
      if (message.includes("Không tìm thấy payment")) {
        setPayment(null)
        setErrorMessage(null)
      } else {
        setErrorMessage(message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadPayment()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId])

  const handleCreatePayment = async () => {
    try {
      setIsCreating(true)
      setErrorMessage(null)

      // Trang này chỉ dùng cho BANK_TRANSFER.
      const res = await createPayment(bookingId)
      setPayment(res.data)

      toast({
        title: "Đã tạo giao dịch chuyển khoản",
        description: "Anh có thể giả lập thành công hoặc thất bại để test flow.",
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Tạo payment thất bại"

      setErrorMessage(message)
      toast({
        title: "Tạo payment thất bại",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  // const handleSimulateSuccess = async () => {
  //   if (!payment) return

  //   try {
  //     setIsSubmitting(true)

  //     const res = await simulatePaymentSuccess(payment.id)

  //     toast({
  //       title: "Thanh toán thành công",
  //       description: "Booking đã được chuyển sang trạng thái PAID.",
  //     })

  //     router.push(
  //       `/payment/success?bookingId=${bookingId}&paymentId=${res.data.id}`,
  //     )
  //   } catch (error) {
  //     toast({
  //       title: "Không thể giả lập thành công",
  //       description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
  //       variant: "destructive",
  //     })
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }
  const handleSimulateSuccess = async () => {
  if (!payment) return;

  try {
    setIsSubmitting(true);

    const res = await simulatePaymentSuccess(payment.id);

    toast({
      title: "Thanh toán thành công",
      description: "Booking đã được chuyển sang trạng thái PAID.",
    });

    router.replace(
      `/payment/success?bookingId=${res.data.booking_id}&paymentId=${res.data.id}`
    );
    return;
  } catch (error) {
    toast({
      title: "Không thể giả lập thành công",
      description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
      variant: "destructive",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  const handleSimulateFailed = async () => {
    if (!payment) return

    try {
      setIsSubmitting(true)

      const res = await simulatePaymentFailed(payment.id)

      toast({
        title: "Thanh toán thất bại",
        description: "Booking đã được chuyển sang trạng thái PAY_FAILED.",
      })

      router.push(
        `/payment/failed?bookingId=${bookingId}&paymentId=${res.data.id}`,
      )
    } catch (error) {
      toast({
        title: "Không thể giả lập thất bại",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/bookings"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>

          <h1 className="text-xl font-bold">Thanh toán booking</h1>

          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {isLoading ? (
          <Card className="p-8 text-center text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-3" />
            Đang tải thông tin thanh toán...
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Thông tin giao dịch
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      Booking #{bookingId}
                    </p>
                  </div>

                  <Badge className={statusUi.className}>{statusUi.text}</Badge>
                </div>

                {errorMessage && (
                  <div className="mb-4 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
                    <p className="text-sm text-red-700 dark:text-red-400">
                      {errorMessage}
                    </p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-3">
                      Phương thức thanh toán
                    </p>

                    <div className="rounded-lg border border-primary bg-primary/5 p-4">
                      <div className="flex items-start gap-3">
                        <Landmark className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="font-medium">Chuyển khoản ngân hàng</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Đây là thanh toán chuyển khoản giả lập. Sau khi tạo
                            giao dịch, anh có thể giả lập thành công hoặc thất bại
                            để test flow.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!payment ? (
                    <Button onClick={handleCreatePayment} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Đang tạo giao dịch...
                        </>
                      ) : (
                        <>
                          <CircleDollarSign className="w-4 h-4 mr-2" />
                          Tạo giao dịch chuyển khoản
                        </>
                      )}
                    </Button>
                  ) : (
                    <div className="flex flex-wrap gap-3 pt-2">
                      <Button
                        onClick={handleSimulateSuccess}
                        disabled={isSubmitting || payment.status === "success"}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Đang xử lý...
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Giả lập thành công
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        onClick={handleSimulateFailed}
                        disabled={isSubmitting || payment.status === "success"}
                        className="text-red-600 hover:text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        Giả lập thất bại
                      </Button>

                      <Button
                        variant="outline"
                        onClick={loadPayment}
                        disabled={isSubmitting}
                      >
                        Tải lại
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Tóm tắt</h3>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Booking ID</span>
                    <span className="font-medium">#{bookingId}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Provider</span>
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
                    <span className="text-muted-foreground">Currency</span>
                    <span className="font-medium">
                      {payment?.currency ?? "VND"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã giao dịch</span>
                    <span className="font-medium text-right break-all">
                      {payment?.transaction_code ?? "Chưa có"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Trạng thái booking
                    </span>
                    <span className="font-medium">
                      {payment?.booking?.status ?? "—"}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Thanh toán lúc
                    </span>
                    <span className="font-medium text-right">
                      {formatDateTime(payment?.paid_at)}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <Button
                    className="w-full"
                    onClick={() => router.push("/bookings")}
                  >
                    Về đơn đặt sân
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}