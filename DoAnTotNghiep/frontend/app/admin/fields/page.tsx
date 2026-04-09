"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Check,
  X,
  Eye,
  Search,
  MapPin,
  Clock,
  DollarSign,
  User,
  Calendar,
  Star,
  Wifi,
  Car,
  ShowerHead,
  UtensilsCrossed,
  Shirt,
  LampDesk,
  AlertTriangle,
} from "lucide-react"
import { Pagination } from "@/components/pagination"

const mockFields = [
  {
    id: 1,
    name: "Sân Bóng Đá Thảo Điền",
    owner: "Nguyễn Văn A",
    ownerPhone: "0901234567",
    ownerEmail: "nguyenvana@email.com",
    location: "123 Nguyễn Văn Hưởng, Thảo Điền, Quận 2, TP.HCM",
    district: "Quận 2",
    type: "Football",
    typeName: "Bóng Đá",
    status: "approved",
    createdDate: "2024-06-15",
    priceWeekday: 300000,
    priceWeekend: 400000,
    openTime: "06:00",
    closeTime: "22:00",
    rating: 4.5,
    totalBookings: 156,
    totalReviews: 48,
    description:
      "Sân bóng đá cỏ nhân tạo chất lượng cao, phù hợp cho các trận đấu 5 người và 7 người. Có hệ thống đèn chiếu sáng hiện đại.",
    amenities: ["wifi", "parking", "shower", "canteen", "changing_room", "lighting"],
    images: ["/soccer-field-green-grass.png", "/professional-soccer-field-with-players.jpg"],
    size: "40m x 25m",
    capacity: "10-14 người",
  },
  {
    id: 2,
    name: "Sân Bóng Rổ Quận 7",
    owner: "Trần Thị B",
    ownerPhone: "0912345678",
    ownerEmail: "tranthib@email.com",
    location: "456 Nguyễn Thị Thập, Quận 7, TP.HCM",
    district: "Quận 7",
    type: "Basketball",
    typeName: "Bóng Rổ",
    status: "approved",
    createdDate: "2024-06-20",
    priceWeekday: 200000,
    priceWeekend: 280000,
    openTime: "07:00",
    closeTime: "21:00",
    rating: 4.2,
    totalBookings: 89,
    totalReviews: 32,
    description: "Sân bóng rổ trong nhà với sàn gỗ chuyên dụng. Phù hợp cho thi đấu và tập luyện.",
    amenities: ["wifi", "parking", "shower", "changing_room", "lighting"],
    images: ["/indoor-basketball-court.png", "/outdoor-basketball-court.png"],
    size: "28m x 15m",
    capacity: "10 người",
  },
  {
    id: 3,
    name: "Sân Tennis Bình Thạnh",
    owner: "Lê Văn C",
    ownerPhone: "0923456789",
    ownerEmail: "levanc@email.com",
    location: "789 Điện Biên Phủ, Bình Thạnh, TP.HCM",
    district: "Bình Thạnh",
    type: "Tennis",
    typeName: "Tennis",
    status: "pending",
    createdDate: "2024-01-15",
    priceWeekday: 250000,
    priceWeekend: 350000,
    openTime: "05:30",
    closeTime: "22:00",
    rating: 0,
    totalBookings: 0,
    totalReviews: 0,
    description: "Sân tennis mặt cứng tiêu chuẩn quốc tế. Có huấn luyện viên hỗ trợ.",
    amenities: ["wifi", "parking", "shower", "canteen", "changing_room", "lighting"],
    images: ["/professional-tennis-court.jpg", "/outdoor-tennis-court.png"],
    size: "23.77m x 10.97m",
    capacity: "2-4 người",
  },
  {
    id: 4,
    name: "Sân Cầu Lông Phú Nhuận",
    owner: "Phạm Thị D",
    ownerPhone: "0934567890",
    ownerEmail: "phamthid@email.com",
    location: "321 Phan Xích Long, Phú Nhuận, TP.HCM",
    district: "Phú Nhuận",
    type: "Badminton",
    typeName: "Cầu Lông",
    status: "rejected",
    createdDate: "2024-01-10",
    priceWeekday: 80000,
    priceWeekend: 120000,
    openTime: "06:00",
    closeTime: "22:00",
    rating: 0,
    totalBookings: 0,
    totalReviews: 0,
    description: "Sân cầu lông trong nhà với hệ thống điều hòa. Sàn gỗ chuyên dụng.",
    amenities: ["wifi", "parking", "changing_room", "lighting"],
    images: ["/badminton-court.png"],
    size: "13.4m x 6.1m",
    capacity: "2-4 người",
    rejectedReason: "Hình ảnh không rõ ràng, thiếu giấy phép kinh doanh",
  },
  {
    id: 5,
    name: "Sân Bóng Đá Mini Gò Vấp",
    owner: "Hoàng Văn E",
    ownerPhone: "0945678901",
    ownerEmail: "hoangvane@email.com",
    location: "555 Nguyễn Oanh, Gò Vấp, TP.HCM",
    district: "Gò Vấp",
    type: "Football",
    typeName: "Bóng Đá",
    status: "pending",
    createdDate: "2024-01-18",
    priceWeekday: 280000,
    priceWeekend: 380000,
    openTime: "06:00",
    closeTime: "23:00",
    rating: 0,
    totalBookings: 0,
    totalReviews: 0,
    description: "Sân bóng đá mini 5 người với cỏ nhân tạo thế hệ mới. Có dịch vụ cho thuê giày.",
    amenities: ["wifi", "parking", "shower", "canteen", "changing_room", "lighting"],
    images: ["/soccer-field-green-grass.png"],
    size: "30m x 20m",
    capacity: "10 người",
  },
]

const amenityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  wifi: { icon: <Wifi className="w-4 h-4" />, label: "Wifi miễn phí" },
  parking: { icon: <Car className="w-4 h-4" />, label: "Bãi đỗ xe" },
  shower: { icon: <ShowerHead className="w-4 h-4" />, label: "Phòng tắm" },
  canteen: { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Căn tin" },
  changing_room: { icon: <Shirt className="w-4 h-4" />, label: "Phòng thay đồ" },
  lighting: { icon: <LampDesk className="w-4 h-4" />, label: "Đèn chiếu sáng" },
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState(mockFields)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedField, setSelectedField] = useState<(typeof mockFields)[0] | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [fieldToReject, setFieldToReject] = useState<number | null>(null)
  const itemsPerPage = 8

  const filteredFields = fields.filter((f) => {
    const matchStatus = filterStatus === "all" || f.status === filterStatus
    const matchSearch =
      searchQuery === "" ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.location.toLowerCase().includes(searchQuery.toLowerCase())
    return matchStatus && matchSearch
  })

  const totalPages = Math.ceil(filteredFields.length / itemsPerPage)
  const paginatedFields = filteredFields.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Stats
  const stats = {
    total: fields.length,
    pending: fields.filter((f) => f.status === "pending").length,
    approved: fields.filter((f) => f.status === "approved").length,
    rejected: fields.filter((f) => f.status === "rejected").length,
  }

  const handleApprove = (id: number) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, status: "approved" } : f)))
    if (selectedField?.id === id) {
      setSelectedField({ ...selectedField, status: "approved" })
    }
  }

  const openRejectDialog = (id: number) => {
    setFieldToReject(id)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const handleReject = () => {
    if (fieldToReject === null) return

    setFields(
      fields.map((f) =>
        f.id === fieldToReject ? { ...f, status: "rejected", rejectedReason: rejectReason || "Không đạt yêu cầu" } : f,
      ),
    )

    if (selectedField?.id === fieldToReject) {
      setSelectedField({
        ...selectedField,
        status: "rejected",
        rejectedReason: rejectReason || "Không đạt yêu cầu",
      })
    }

    setShowRejectDialog(false)
    setFieldToReject(null)
    setRejectReason("")
  }

  const handleViewDetail = (field: (typeof mockFields)[0]) => {
    setSelectedField(field)
    setShowDetailDialog(true)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND"
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản Lý Sân</h1>
        <p className="text-muted-foreground">Phê duyệt và quản lý các sân thể thao trong hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Tổng số sân</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Chờ duyệt</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Đã duyệt</p>
          <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-muted-foreground">Từ chối</p>
          <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên sân, chủ sân, địa chỉ..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: `Chờ Duyệt (${stats.pending})` },
            { value: "approved", label: "Đã Duyệt" },
            { value: "rejected", label: "Từ Chối" },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => {
                setFilterStatus(status.value)
                setCurrentPage(1)
              }}
              className={`px-4 py-2 rounded-lg font-medium transition text-sm ${
                filterStatus === status.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-4 mb-8">
        {paginatedFields.map((field) => (
          <Card key={field.id} className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-start gap-4">
              {/* Field Image */}
              <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                <img
                  src={field.images[0] || "/placeholder.svg?height=96&width=128&query=sports field"}
                  alt={field.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Field Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{field.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline">{field.typeName}</Badge>
                      <span>•</span>
                      <span>{field.district}</span>
                    </div>
                  </div>
                  <Badge
                    className={`flex-shrink-0 ${
                      field.status === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : field.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {field.status === "pending" ? "Chờ Duyệt" : field.status === "approved" ? "Đã Duyệt" : "Từ Chối"}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground truncate">{field.owner}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{formatPrice(field.priceWeekday)}/h</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">
                      {field.openTime} - {field.closeTime}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground">{field.createdDate}</span>
                  </div>
                </div>

                {field.status === "approved" && (
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="font-medium">{field.rating}</span>
                    </div>
                    <span className="text-muted-foreground">{field.totalBookings} lượt đặt</span>
                    <span className="text-muted-foreground">{field.totalReviews} đánh giá</span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                {field.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleApprove(field.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive bg-transparent"
                      onClick={() => openRejectDialog(field.id)}
                    >
                      <X className="w-4 h-4 mr-1" />
                      Từ Chối
                    </Button>
                  </>
                )}
                <Button variant="outline" size="sm" onClick={() => handleViewDetail(field)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Xem
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredFields.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy sân nào</p>
        </Card>
      )}

      {/* Pagination */}
      {filteredFields.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          totalItems={filteredFields.length}
        />
      )}

      {/* Field Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          {selectedField && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle className="text-xl">{selectedField.name}</DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedField.location}
                    </p>
                  </div>
                  <Badge
                    className={`${
                      selectedField.status === "pending"
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                        : selectedField.status === "approved"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }`}
                  >
                    {selectedField.status === "pending"
                      ? "Chờ Duyệt"
                      : selectedField.status === "approved"
                        ? "Đã Duyệt"
                        : "Từ Chối"}
                  </Badge>
                </div>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Hình ảnh - chỉ hiện 1 ảnh chính */}
                {selectedField.images.length > 0 && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                    <img
                      src={selectedField.images[0] || "/placeholder.svg"}
                      alt={selectedField.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Thông tin chính - 2 columns */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Loại sân</p>
                    <p className="font-medium">{selectedField.typeName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Kích thước</p>
                    <p className="font-medium">{selectedField.size}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Sức chứa</p>
                    <p className="font-medium">{selectedField.capacity}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Giờ hoạt động</p>
                    <p className="font-medium">
                      {selectedField.openTime} - {selectedField.closeTime}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Giá ngày thường</p>
                    <p className="font-medium text-primary">{formatPrice(selectedField.priceWeekday)}/giờ</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Giá cuối tuần</p>
                    <p className="font-medium text-primary">{formatPrice(selectedField.priceWeekend)}/giờ</p>
                  </div>
                </div>

                {/* Tiện ích */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tiện ích</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedField.amenities.map((amenity) => (
                      <Badge key={amenity} variant="secondary">
                        {amenityIcons[amenity]?.label || amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Mô tả */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Mô tả</p>
                  <p className="text-sm">{selectedField.description}</p>
                </div>

                {/* Chủ sân */}
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Chủ sân</p>
                  <p className="font-medium">{selectedField.owner}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedField.ownerPhone} • {selectedField.ownerEmail}
                  </p>
                </div>

                {/* Thống kê (nếu đã duyệt) */}
                {selectedField.status === "approved" && (
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{selectedField.rating}</p>
                      <p className="text-xs text-muted-foreground">Đánh giá</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{selectedField.totalBookings}</p>
                      <p className="text-xs text-muted-foreground">Lượt đặt</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">{selectedField.totalReviews}</p>
                      <p className="text-xs text-muted-foreground">Đánh giá</p>
                    </div>
                  </div>
                )}

                {/* Lý do từ chối */}
                {selectedField.status === "rejected" && selectedField.rejectedReason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">Lý do từ chối</p>
                    <p className="text-sm text-red-600 dark:text-red-400">{selectedField.rejectedReason}</p>
                  </div>
                )}

                {/* Actions */}
                {selectedField.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleApprove(selectedField.id)}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Phê Duyệt
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                      onClick={() => {
                        setShowDetailDialog(false)
                        setShowRejectDialog(true)
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Từ Chối
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Từ Chối Sân
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejectReason">
                Lý do từ chối <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="rejectReason"
                placeholder="Nhập lý do từ chối sân này (ví dụ: Hình ảnh không rõ ràng, thiếu giấy phép kinh doanh...)"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">Lý do này sẽ được gửi đến chủ sân để họ có thể cải thiện.</p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false)
                setFieldToReject(null)
                setRejectReason("")
              }}
            >
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleReject} disabled={!rejectReason.trim()}>
              <X className="w-4 h-4 mr-2" />
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
