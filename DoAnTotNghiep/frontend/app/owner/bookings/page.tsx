"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Check, X, Clock, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"

const mockBookings = [
  {
    id: 1,
    customerName: "Nguyễn Văn A",
    fieldName: "Sân Bóng Đá Green Valley",
    date: "2025-01-20",
    time: "18:00",
    duration: 2,
    price: 1000000,
    status: "pending",
    customerEmail: "nguyenvana@example.com",
  },
  {
    id: 2,
    customerName: "Trần Thị B",
    fieldName: "Sân Bóng Rổ Arena",
    date: "2025-01-18",
    time: "14:00",
    duration: 1,
    price: 400000,
    status: "confirmed",
    customerEmail: "tranthib@example.com",
  },
  {
    id: 3,
    customerName: "Lê Văn C",
    fieldName: "Sân Bóng Đá Green Valley",
    date: "2025-01-15",
    time: "10:00",
    duration: 1,
    price: 500000,
    status: "completed",
    customerEmail: "levanc@example.com",
  },
]

export default function OwnerBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [filter, setFilter] = useState("all")
  const [approveDialog, setApproveDialog] = useState<number | null>(null)
  const [rejectDialog, setRejectDialog] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState("")
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5

  const filteredBookings = bookings.filter((b) => filter === "all" || b.status === filter)

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleApprove = (id: number) => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return

    const conflict = bookings.find(
      (b) =>
        b.id !== id &&
        b.status === "confirmed" &&
        b.fieldName === booking.fieldName &&
        b.date === booking.date &&
        b.time === booking.time,
    )

    if (conflict) {
      toast({
        title: "Xung đột lịch đặt sân",
        description: `Khung giờ này đã được đặt bởi ${conflict.customerName}. Vui lòng từ chối đơn này.`,
        variant: "destructive",
      })
      setApproveDialog(null)
      return
    }

    setBookings(bookings.map((b) => (b.id === id ? { ...b, status: "confirmed" } : b)))
    setApproveDialog(null)
    toast({
      title: "Đã duyệt đặt sân",
      description: `Đã xác nhận đơn đặt sân của ${booking.customerName}. Email xác nhận đã được gửi.`,
    })
  }

  const handleReject = (id: number) => {
    const booking = bookings.find((b) => b.id === id)
    if (!booking) return

    if (!rejectReason.trim()) {
      toast({
        title: "Vui lòng nhập lý do",
        description: "Bạn cần nhập lý do từ chối để customer hiểu rõ hơn.",
        variant: "destructive",
      })
      return
    }

    setBookings(
      bookings.map((b) =>
        b.id === id
          ? {
              ...b,
              status: "rejected",
              rejectionReason: rejectReason,
            }
          : b,
      ),
    )
    setRejectDialog(null)
    setRejectReason("")
    toast({
      title: "Đã từ chối đặt sân",
      description: `Đã từ chối đơn của ${booking.customerName}. Email thông báo đã được gửi.`,
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Quản Lý Đặt Sân</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: "Chờ Duyệt" },
            { value: "confirmed", label: "Đã Xác Nhận" },
            { value: "completed", label: "Hoàn Thành" },
            { value: "rejected", label: "Đã Từ Chối" },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setFilter(status.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === status.value ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-4 mb-8">
          {paginatedBookings.map((booking) => (
            <Card key={booking.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-foreground">{booking.customerName}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : booking.status === "confirmed"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : booking.status === "rejected"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                              : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      }`}
                    >
                      {booking.status === "pending"
                        ? "Chờ Duyệt"
                        : booking.status === "confirmed"
                          ? "Đã Xác Nhận"
                          : booking.status === "rejected"
                            ? "Đã Từ Chối"
                            : "Hoàn Thành"}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{booking.fieldName}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Ngày</p>
                      <p className="font-medium text-foreground">{booking.date}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Giờ</p>
                      <p className="font-medium text-foreground">{booking.time}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Thời Lượng</p>
                      <p className="font-medium text-foreground">{booking.duration} giờ</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Số Tiền</p>
                      <p className="font-medium text-primary">{booking.price.toLocaleString()} VND</p>
                    </div>
                  </div>

                  {booking.status === "rejected" && booking.rejectionReason && (
                    <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg">
                      <p className="text-sm text-red-800 dark:text-red-200">
                        <strong>Lý do từ chối:</strong> {booking.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>

                {booking.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => setApproveDialog(booking.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive bg-transparent"
                      onClick={() => setRejectDialog(booking.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Từ Chối
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredBookings.length === 0 && (
          <Card className="p-12 text-center">
            <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">
              Không có đơn đặt sân{" "}
              {filter === "all"
                ? ""
                : filter === "pending"
                  ? "chờ duyệt"
                  : filter === "confirmed"
                    ? "đã xác nhận"
                    : filter === "rejected"
                      ? "đã từ chối"
                      : "hoàn thành"}
            </p>
          </Card>
        )}

        {/* Pagination */}
        {filteredBookings.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredBookings.length}
          />
        )}
      </div>

      <Dialog open={approveDialog !== null} onOpenChange={() => setApproveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận duyệt đặt sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn duyệt đơn đặt sân này? Khách hàng sẽ nhận được email xác nhận.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog(null)}>
              Hủy
            </Button>
            <Button onClick={() => approveDialog && handleApprove(approveDialog)} className="bg-green-600">
              Xác Nhận Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={rejectDialog !== null}
        onOpenChange={() => {
          setRejectDialog(null)
          setRejectReason("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Từ chối đặt sân
            </DialogTitle>
            <DialogDescription>
              Vui lòng nhập lý do từ chối để khách hàng hiểu rõ tình huống. Thông tin này sẽ được gửi qua email.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="reason">Lý do từ chối *</Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Sân đang bảo trì, đã có booking khác, thời tiết xấu..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={4}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialog(null)
                setRejectReason("")
              }}
            >
              Hủy
            </Button>
            <Button onClick={() => rejectDialog && handleReject(rejectDialog)} variant="destructive">
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
