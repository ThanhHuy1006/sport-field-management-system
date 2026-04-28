"use client"

import type React from "react"

import { useCallback, useEffect, useState } from "react"
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
import { apiGet, apiRequest } from "@/lib/api-client"

type ApiResponse<T> = {
  success: boolean
  message: string
  data: T
}

type AdminField = {
  id: number
  owner_id: number
  field_name: string | null
  sport_type: string | null
  description: string | null
  address: string | null
  latitude: number | null
  longitude: number | null
  base_price_per_hour: number
  currency: string | null
  status: "pending" | "active" | "inactive" | "maintenance" | string
  min_duration_minutes: number | null
  max_players: number | null
  created_at: string | null
  owner: {
    id: number
    name: string | null
    email: string | null
  } | null
  primary_image: {
    id: number
    url: string
    is_primary: boolean
    order_no: number | null
  } | null
}

type UiField = {
  id: number
  name: string
  owner: string
  ownerPhone: string
  ownerEmail: string
  location: string
  district: string
  type: string
  typeName: string
  status: "pending" | "active" | "inactive" | "maintenance" | string
  createdDate: string
  priceWeekday: number
  priceWeekend: number
  openTime: string
  closeTime: string
  rating: number
  totalBookings: number
  totalReviews: number
  description: string
  amenities: string[]
  images: string[]
  size: string
  capacity: string
  rejectedReason?: string
}

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/api\/v1\/?$/, "")

const amenityIcons: Record<string, { icon: React.ReactNode; label: string }> = {
  wifi: { icon: <Wifi className="w-4 h-4" />, label: "Wifi miễn phí" },
  parking: { icon: <Car className="w-4 h-4" />, label: "Bãi đỗ xe" },
  shower: { icon: <ShowerHead className="w-4 h-4" />, label: "Phòng tắm" },
  canteen: { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Căn tin" },
  changing_room: { icon: <Shirt className="w-4 h-4" />, label: "Phòng thay đồ" },
  lighting: { icon: <LampDesk className="w-4 h-4" />, label: "Đèn chiếu sáng" },
}

function formatDate(value?: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString("vi-VN")
}

function toAssetUrl(url?: string | null) {
  if (!url) return "/placeholder.svg?height=96&width=128&query=sports field"
  if (url.startsWith("http")) return url
  if (url.startsWith("/uploads")) return `${API_ORIGIN}${url}`
  return url
}

function getDistrictFromAddress(address?: string | null) {
  if (!address) return "-"
  const parts = address
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)

  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "-"
}

function getSportTypeName(type?: string | null) {
  const value = String(type || "").toLowerCase()

  if (value.includes("football") || value.includes("soccer") || value.includes("bóng đá")) return "Bóng Đá"
  if (value.includes("basketball") || value.includes("bóng rổ")) return "Bóng Rổ"
  if (value.includes("badminton") || value.includes("cầu lông")) return "Cầu Lông"
  if (value.includes("tennis")) return "Tennis"
  if (value.includes("volleyball") || value.includes("bóng chuyền")) return "Bóng Chuyền"

  return type || "Khác"
}

function mapFieldToUi(field: AdminField): UiField {
  const imageUrl = toAssetUrl(field.primary_image?.url)
  const price = Number(field.base_price_per_hour || 0)

  return {
    id: field.id,
    name: field.field_name || "Chưa cập nhật tên sân",
    owner: field.owner?.name || "Chưa cập nhật",
    ownerPhone: "-",
    ownerEmail: field.owner?.email || "-",
    location: field.address || "-",
    district: getDistrictFromAddress(field.address),
    type: field.sport_type || "unknown",
    typeName: getSportTypeName(field.sport_type),
    status: field.status,
    createdDate: formatDate(field.created_at),
    priceWeekday: price,
    priceWeekend: price,
    openTime: "-",
    closeTime: "-",
    rating: 0,
    totalBookings: 0,
    totalReviews: 0,
    description: field.description || "Chưa có mô tả.",
    amenities: [],
    images: [imageUrl],
    size: "-",
    capacity: field.max_players ? `${field.max_players} người` : "-",
    rejectedReason: field.status === "inactive" ? "Sân đã bị từ chối hoặc đã bị ẩn." : undefined,
  }
}

function getFieldStatusLabel(status: string) {
  if (status === "pending") return "Chờ Duyệt"
  if (status === "active") return "Đã Duyệt"
  if (status === "inactive") return "Từ Chối"
  if (status === "maintenance") return "Bảo Trì"
  return status
}

function getFieldStatusClassName(status: string) {
  if (status === "pending") {
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
  }

  if (status === "active") {
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
  }

  if (status === "maintenance") {
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
  }

  return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<UiField[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedField, setSelectedField] = useState<UiField | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [fieldToReject, setFieldToReject] = useState<number | null>(null)
  const itemsPerPage = 8

  const fetchAdminFields = useCallback(async () => {
    setLoading(true)

    try {
      const res = await apiGet<ApiResponse<AdminField[]>>("/admin/fields")
      setFields(res.data.map(mapFieldToUi))
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAdminFields()
  }, [fetchAdminFields])

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

  const stats = {
    total: fields.length,
    pending: fields.filter((f) => f.status === "pending").length,
    approved: fields.filter((f) => f.status === "active").length,
    rejected: fields.filter((f) => f.status === "inactive").length,
  }

  const handleApprove = async (id: number) => {
    try {
      await apiRequest<ApiResponse<AdminField>>(`/admin/fields/${id}/approve`, {
        method: "PATCH",
      })

      await fetchAdminFields()

      if (selectedField?.id === id) {
        setSelectedField((prev) => (prev ? { ...prev, status: "active" } : prev))
      }
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Không thể duyệt sân")
    }
  }

  const openRejectDialog = (id: number) => {
    setFieldToReject(id)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const handleReject = async () => {
    if (fieldToReject === null) return

    try {
      await apiRequest<ApiResponse<AdminField>>(`/admin/fields/${fieldToReject}/reject`, {
        method: "PATCH",
      })

      await fetchAdminFields()

      if (selectedField?.id === fieldToReject) {
        setSelectedField((prev) =>
          prev
            ? {
                ...prev,
                status: "inactive",
                rejectedReason: rejectReason || "Không đạt yêu cầu",
              }
            : prev
        )
      }

      setShowRejectDialog(false)
      setFieldToReject(null)
      setRejectReason("")
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : "Không thể từ chối sân")
    }
  }

  const handleViewDetail = (field: UiField) => {
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
            { value: "active", label: "Đã Duyệt" },
            { value: "inactive", label: "Từ Chối" },
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

      {loading && (
        <Card className="p-6 mb-6 text-center text-muted-foreground">
          Đang tải dữ liệu...
        </Card>
      )}

      {/* Fields List */}
      {!loading && (
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
                    <Badge className={`flex-shrink-0 ${getFieldStatusClassName(field.status)}`}>
                      {getFieldStatusLabel(field.status)}
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

                  {field.status === "active" && (
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
      )}

      {!loading && filteredFields.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy sân nào</p>
        </Card>
      )}

      {/* Pagination */}
      {!loading && filteredFields.length > 0 && (
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
                  <Badge className={`${getFieldStatusClassName(selectedField.status)}`}>
                    {getFieldStatusLabel(selectedField.status)}
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
                    {selectedField.amenities.length === 0 ? (
                      <span className="text-sm text-muted-foreground">Chưa cập nhật</span>
                    ) : (
                      selectedField.amenities.map((amenity) => (
                        <Badge key={amenity} variant="secondary">
                          {amenityIcons[amenity]?.label || amenity}
                        </Badge>
                      ))
                    )}
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

                {/* Thống kê nếu đã duyệt */}
                {selectedField.status === "active" && (
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
                {selectedField.status === "inactive" && selectedField.rejectedReason && (
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
                        setFieldToReject(selectedField.id)
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
              <p className="text-sm text-muted-foreground">
                Hiện backend đang chuyển sân sang inactive. Nếu muốn lưu lý do từ chối, cần bổ sung cột reject_reason cho bảng fields.
              </p>
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