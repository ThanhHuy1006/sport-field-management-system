"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ArrowLeft, Search, Filter, Eye, Ban, CheckCircle, Download, Phone, Mail, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Pagination } from "@/components/pagination"

const mockBookings = [
  {
    id: 1,
    refCode: "BOOK-001",
    customer: { name: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0901234567" },
    field: { name: "Sân Bóng Đá Green Valley", owner: "Nguyễn Văn X", location: "Quận 2" },
    date: "2025-01-20",
    time: "18:00",
    duration: 2,
    price: 1000000,
    status: "pending",
    createdAt: "2025-01-15",
  },
  {
    id: 2,
    refCode: "BOOK-002",
    customer: { name: "Trần Thị B", email: "tranthib@email.com", phone: "0912345678" },
    field: { name: "Sân Bóng Rổ Arena", owner: "Trần Thị Y", location: "Quận 7" },
    date: "2025-01-18",
    time: "14:00",
    duration: 1,
    price: 400000,
    status: "confirmed",
    createdAt: "2025-01-10",
  },
  {
    id: 3,
    refCode: "BOOK-003",
    customer: { name: "Lê Văn C", email: "levanc@email.com", phone: "0923456789" },
    field: { name: "Sân Bóng Đá Green Valley", owner: "Nguyễn Văn X", location: "Quận 2" },
    date: "2025-01-15",
    time: "10:00",
    duration: 1,
    price: 500000,
    status: "completed",
    createdAt: "2025-01-08",
  },
  {
    id: 4,
    refCode: "BOOK-004",
    customer: { name: "Phạm Thị D", email: "phamthid@email.com", phone: "0934567890" },
    field: { name: "Sân Tennis Bình Thạnh", owner: "Lê Văn Z", location: "Bình Thạnh" },
    date: "2025-01-22",
    time: "16:00",
    duration: 2,
    price: 800000,
    status: "pending",
    createdAt: "2025-01-16",
  },
]

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState(mockBookings)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedBooking, setSelectedBooking] = useState<(typeof mockBookings)[0] | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      searchQuery === "" ||
      booking.refCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.field.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage)
  const paginatedBookings = filteredBookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    revenue: bookings.reduce((sum, b) => sum + b.price, 0),
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
            Chờ Xác Nhận
          </Badge>
        )
      case "confirmed":
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600">
            Đã Xác Nhận
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600">
            Hoàn Thành
          </Badge>
        )
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600">
            Đã Hủy
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const handleViewDetails = (booking: (typeof mockBookings)[0]) => {
    setSelectedBooking(booking)
    setShowDetailsDialog(true)
  }

  const handleOverrideStatus = (bookingId: number, newStatus: string) => {
    setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b)))
    toast.success(`Đã cập nhật trạng thái booking thành ${newStatus}`)
  }

  const handleExport = () => {
    toast.success("Đang xuất dữ liệu...")
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" asChild>
                <Link href="/admin/dashboard">
                  <ArrowLeft className="w-5 h-5" />
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Quản Lý Đặt Sân</h1>
                <p className="text-sm text-muted-foreground">Xem và quản lý tất cả đơn đặt sân</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/schedule">
                  <Calendar className="w-4 h-4 mr-2" />
                  Xem Lịch
                </Link>
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <Download className="w-4 h-4 mr-2" />
                Xuất Excel
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm theo mã đơn, tên khách, tên sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Lọc trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất Cả</SelectItem>
                <SelectItem value="pending">Chờ Xác Nhận</SelectItem>
                <SelectItem value="confirmed">Đã Xác Nhận</SelectItem>
                <SelectItem value="completed">Hoàn Thành</SelectItem>
                <SelectItem value="cancelled">Đã Hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Đơn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-orange-600">Chờ Duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Đã Xác Nhận</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.confirmed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hoàn Thành</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Doanh Thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold text-primary">{stats.revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">VNĐ</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium">Mã Đơn</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Khách Hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Sân</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Ngày/Giờ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Giá</th>
                    <th className="px-4 py-3 text-left text-sm font-medium">Trạng Thái</th>
                    <th className="px-4 py-3 text-right text-sm font-medium">Thao Tác</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedBookings.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                        Không tìm thấy đơn đặt sân nào
                      </td>
                    </tr>
                  ) : (
                    paginatedBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-border hover:bg-muted/50 transition">
                        <td className="px-4 py-4">
                          <div className="font-medium text-primary">{booking.refCode}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(booking.createdAt).toLocaleDateString("vi-VN")}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{booking.customer.name}</div>
                          <div className="text-sm text-muted-foreground">{booking.customer.phone}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{booking.field.name}</div>
                          <div className="text-sm text-muted-foreground">Chủ: {booking.field.owner}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-medium">{booking.date}</div>
                          <div className="text-sm text-muted-foreground">
                            {booking.time} • {booking.duration}h
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="font-bold text-primary">{booking.price.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">VNĐ</div>
                        </td>
                        <td className="px-4 py-4">{getStatusBadge(booking.status)}</td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(booking)}>
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filteredBookings.length > 0 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  totalItems={filteredBookings.length}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đặt Sân</DialogTitle>
            <DialogDescription>Mã đơn: {selectedBooking?.refCode}</DialogDescription>
          </DialogHeader>

          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Thông Tin Khách Hàng</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">Tên:</span>
                      <span>{selectedBooking.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{selectedBooking.customer.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span>{selectedBooking.customer.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Thông Tin Sân</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Sân:</span> {selectedBooking.field.name}
                    </div>
                    <div>
                      <span className="font-medium">Chủ sân:</span> {selectedBooking.field.owner}
                    </div>
                    <div>
                      <span className="font-medium">Khu vực:</span> {selectedBooking.field.location}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Chi Tiết Đặt Sân</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Ngày:</span> {selectedBooking.date}
                  </div>
                  <div>
                    <span className="font-medium">Giờ:</span> {selectedBooking.time}
                  </div>
                  <div>
                    <span className="font-medium">Thời lượng:</span> {selectedBooking.duration} giờ
                  </div>
                  <div>
                    <span className="font-medium">Trạng thái:</span> {getStatusBadge(selectedBooking.status)}
                  </div>
                  <div>
                    <span className="font-medium">Ngày đặt:</span> {selectedBooking.createdAt}
                  </div>
                  <div>
                    <span className="font-medium text-lg">Tổng giá:</span>{" "}
                    <span className="text-lg font-bold text-primary">{selectedBooking.price.toLocaleString()} VNĐ</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-3">Admin Actions</h3>
                <div className="flex gap-2">
                  {selectedBooking.status === "pending" && (
                    <Button
                      variant="outline"
                      className="text-green-600 border-green-600 bg-transparent"
                      onClick={() => {
                        handleOverrideStatus(selectedBooking.id, "confirmed")
                        setShowDetailsDialog(false)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Xác Nhận Đơn
                    </Button>
                  )}
                  {selectedBooking.status !== "cancelled" && (
                    <Button
                      variant="outline"
                      className="text-red-600 border-red-600 bg-transparent"
                      onClick={() => {
                        handleOverrideStatus(selectedBooking.id, "cancelled")
                        setShowDetailsDialog(false)
                      }}
                    >
                      <Ban className="w-4 h-4 mr-2" />
                      Hủy Đơn
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
