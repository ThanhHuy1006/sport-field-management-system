"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
} from "lucide-react";
import { Pagination } from "@/components/pagination";
import { apiGet, apiRequest } from "@/lib/api-client";
import { getImageUrl } from "@/lib/image-url";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

type AdminFieldsPagination = {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
};

type AdminFieldsListData =
  | AdminField[]
  | {
      items?: AdminField[];
      pagination?: AdminFieldsPagination;
    };

type AdminFieldDetailData =
  | AdminField
  | {
      item?: AdminField;
      field?: AdminField;
    };

type AdminField = {
  id: number;
  owner_id: number;
  field_name: string | null;
  sport_type: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  base_price_per_hour: number;
  currency: string | null;
  status: "pending" | "active" | "hidden" | "maintenance" | string;
  reject_reason: string | null;
  min_duration_minutes: number | null;
  max_players: number | null;
  created_at: string | null;

  owner: {
    id: number;
    name: string | null;
    email: string | null;
    phone?: string | null;
  } | null;

  primary_image: {
    id: number;
    url: string;
    is_primary: boolean;
    order_no: number | null;
  } | null;

  images?: {
    id: number;
    url: string;
    is_primary: boolean;
    order_no: number | null;
  }[];

  operating_hours?: {
    id: number;
    day_of_week: number;
    open_time: string | null;
    close_time: string | null;
  }[];

  amenities?: {
    id: number;
    name: string;
    icon: string | null;
  }[];

  pricing_rules?: {
    id: number;
    day_type: "WEEKDAY" | "WEEKEND" | "HOLIDAY" | "CUSTOM" | string;
    start_time: string | null;
    end_time: string | null;
    price: number;
    currency: string | null;
    priority: number;
    active: boolean;
  }[];

  total_bookings?: number;
  total_reviews?: number;
  rating?: number;
};

type UiField = {
  id: number;
  name: string;
  owner: string;
  ownerPhone: string;
  ownerEmail: string;
  location: string;
  district: string;
  type: string;
  typeName: string;
  status: string;
  createdDate: string;
  priceWeekday: number;
  priceWeekend: number;
  openTime: string;
  closeTime: string;
  rating: number;
  totalBookings: number;
  totalReviews: number;
  description: string;
  amenities: string[];
  images: string[];
  size: string;
  capacity: string;
  rejectedReason?: string;
};

const PLACEHOLDER_IMAGE = "/placeholder.svg?height=96&width=128&query=sports field";
const DETAIL_PLACEHOLDER_IMAGE =
  "/placeholder.svg?height=300&width=600&query=sports field";

const amenityIcons: Record<string, { icon: ReactNode; label: string }> = {
  wifi: { icon: <Wifi className="w-4 h-4" />, label: "Wifi miễn phí" },
  parking: { icon: <Car className="w-4 h-4" />, label: "Bãi đỗ xe" },
  shower: { icon: <ShowerHead className="w-4 h-4" />, label: "Phòng tắm" },
  canteen: { icon: <UtensilsCrossed className="w-4 h-4" />, label: "Căn tin" },
  changing_room: {
    icon: <Shirt className="w-4 h-4" />,
    label: "Phòng thay đồ",
  },
  lighting: { icon: <LampDesk className="w-4 h-4" />, label: "Đèn chiếu sáng" },
};

function normalizeFieldStatus(status?: string | null) {
  return String(status || "pending").toLowerCase();
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN");
}

function toAssetUrl(url?: string | null) {
  if (!url) return PLACEHOLDER_IMAGE;
  return getImageUrl(url);
}

function getDistrictFromAddress(address?: string | null) {
  if (!address) return "-";

  const parts = address
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts.length >= 2 ? parts[parts.length - 2] : parts[0] || "-";
}

function getSportTypeName(type?: string | null) {
  const value = String(type || "").toLowerCase();

  if (
    value.includes("football") ||
    value.includes("soccer") ||
    value.includes("bóng đá")
  ) {
    return "Bóng Đá";
  }

  if (value.includes("basketball") || value.includes("bóng rổ")) {
    return "Bóng Rổ";
  }

  if (value.includes("badminton") || value.includes("cầu lông")) {
    return "Cầu Lông";
  }

  if (value.includes("tennis")) return "Tennis";

  if (value.includes("volleyball") || value.includes("bóng chuyền")) {
    return "Bóng Chuyền";
  }

  return type || "Khác";
}

function getPriceByDayType(
  rules: AdminField["pricing_rules"],
  dayType: "WEEKDAY" | "WEEKEND",
  fallbackPrice: number,
) {
  if (!Array.isArray(rules) || rules.length === 0) {
    return fallbackPrice;
  }

  const rule = rules.find(
    (item) =>
      String(item.day_type).toUpperCase() === dayType && item.active !== false,
  );

  return rule ? Number(rule.price || fallbackPrice) : fallbackPrice;
}

function getOperatingTimeText(hours?: AdminField["operating_hours"]) {
  if (!Array.isArray(hours) || hours.length === 0) {
    return {
      openTime: "-",
      closeTime: "-",
    };
  }

  const validHours = hours.filter((hour) => hour.open_time && hour.close_time);

  if (validHours.length === 0) {
    return {
      openTime: "-",
      closeTime: "-",
    };
  }

  const first = validHours[0];

  return {
    openTime: first.open_time || "-",
    closeTime: first.close_time || "-",
  };
}

function getAdminFieldListItems(data: AdminFieldsListData) {
  if (Array.isArray(data)) return data;

  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function getAdminFieldDetail(data: AdminFieldDetailData) {
  if ("id" in data) return data;

  return data.item ?? data.field ?? null;
}

function mapFieldToUi(field: AdminField): UiField {
  const fallbackImage = toAssetUrl(field.primary_image?.url);

  const images =
    Array.isArray(field.images) && field.images.length > 0
      ? field.images.map((image) => toAssetUrl(image.url))
      : [fallbackImage];

  const basePrice = Number(field.base_price_per_hour || 0);
  const priceWeekday = getPriceByDayType(field.pricing_rules, "WEEKDAY", basePrice);
  const priceWeekend = getPriceByDayType(field.pricing_rules, "WEEKEND", basePrice);
  const operatingTime = getOperatingTimeText(field.operating_hours);
  const normalizedStatus = normalizeFieldStatus(field.status);

  return {
    id: field.id,
    name: field.field_name || "Chưa cập nhật tên sân",
    owner: field.owner?.name || "Chưa cập nhật",
    ownerPhone: field.owner?.phone || "-",
    ownerEmail: field.owner?.email || "-",
    location: field.address || "-",
    district: getDistrictFromAddress(field.address),
    type: field.sport_type || "unknown",
    typeName: getSportTypeName(field.sport_type),
    status: normalizedStatus,
    rejectedReason:
      normalizedStatus === "hidden"
        ? field.reject_reason || "Sân đã bị từ chối hoặc đã bị ẩn."
        : undefined,
    createdDate: formatDate(field.created_at),
    priceWeekday,
    priceWeekend,
    openTime: operatingTime.openTime,
    closeTime: operatingTime.closeTime,
    rating: Number(field.rating || 0),
    totalBookings: Number(field.total_bookings || 0),
    totalReviews: Number(field.total_reviews || 0),
    description: field.description || "Chưa có mô tả.",
    amenities: Array.isArray(field.amenities)
      ? field.amenities.map((amenity) => amenity.name)
      : [],
    images,
    size: "-",
    capacity: field.max_players ? `${field.max_players} người` : "-",
  };
}

function getFieldStatusLabel(status: string) {
  const normalizedStatus = normalizeFieldStatus(status);

  if (normalizedStatus === "pending") return "Chờ Duyệt";
  if (normalizedStatus === "active") return "Đã Duyệt";
  if (normalizedStatus === "hidden") return "Từ Chối";
  if (normalizedStatus === "maintenance") return "Bảo Trì";

  return status || "Không xác định";
}

function getFieldStatusClassName(status: string) {
  const normalizedStatus = normalizeFieldStatus(status);

  if (normalizedStatus === "pending") {
    return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300";
  }

  if (normalizedStatus === "active") {
    return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
  }

  if (normalizedStatus === "maintenance") {
    return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  }

  return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<UiField[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedField, setSelectedField] = useState<UiField | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [fieldToReject, setFieldToReject] = useState<number | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const itemsPerPage = 8;

  const fetchAdminFields = useCallback(async () => {
    setLoading(true);

    try {
      const res = await apiGet<ApiResponse<AdminFieldsListData>>("/admin/fields");
      const items = getAdminFieldListItems(res.data);

      setFields(items.map(mapFieldToUi));
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Không thể tải danh sách sân",
      );
      setFields([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminFields();
  }, [fetchAdminFields]);

  const filteredFields = fields.filter((field) => {
    const matchStatus = filterStatus === "all" || field.status === filterStatus;
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const matchSearch =
      normalizedSearchQuery === "" ||
      field.name.toLowerCase().includes(normalizedSearchQuery) ||
      field.owner.toLowerCase().includes(normalizedSearchQuery) ||
      field.location.toLowerCase().includes(normalizedSearchQuery);

    return matchStatus && matchSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredFields.length / itemsPerPage));
  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = {
    total: fields.length,
    pending: fields.filter((field) => field.status === "pending").length,
    approved: fields.filter((field) => field.status === "active").length,
    rejected: fields.filter((field) => field.status === "hidden").length,
  };

  const handleApprove = async (id: number) => {
    if (actionLoadingId !== null) return;

    setActionLoadingId(id);

    try {
      await apiRequest<ApiResponse<AdminField>>(`/admin/fields/${id}/approve`, {
        method: "PATCH",
      });

      await fetchAdminFields();

      if (selectedField?.id === id) {
        setSelectedField((prev) =>
          prev ? { ...prev, status: "active", rejectedReason: undefined } : prev,
        );
      }
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể duyệt sân");
    } finally {
      setActionLoadingId(null);
    }
  };

  const openRejectDialog = (id: number) => {
    setFieldToReject(id);
    setRejectReason("");
    setShowRejectDialog(true);
  };

  const resetRejectDialog = () => {
    setShowRejectDialog(false);
    setFieldToReject(null);
    setRejectReason("");
  };

  const handleReject = async () => {
    if (fieldToReject === null || actionLoadingId !== null) return;

    const targetFieldId = fieldToReject;
    const reason = rejectReason.trim();

    if (!reason) return;

    setActionLoadingId(targetFieldId);

    try {
      await apiRequest<ApiResponse<AdminField>>(
        `/admin/fields/${targetFieldId}/reject`,
        {
          method: "PATCH",
          body: JSON.stringify({
            reject_reason: reason,
          }),
        },
      );

      await fetchAdminFields();

      if (selectedField?.id === targetFieldId) {
        setSelectedField((prev) =>
          prev
            ? {
                ...prev,
                status: "hidden",
                rejectedReason: reason || "Không đạt yêu cầu",
              }
            : prev,
        );
      }

      resetRejectDialog();
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Không thể từ chối sân");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleViewDetail = async (field: UiField) => {
    try {
      const res = await apiGet<ApiResponse<AdminFieldDetailData>>(
        `/admin/fields/${field.id}`,
      );
      const detail = getAdminFieldDetail(res.data);

      if (!detail) {
        throw new Error("Không tìm thấy dữ liệu chi tiết sân");
      }

      setSelectedField(mapFieldToUi(detail));
      setShowDetailDialog(true);
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error ? error.message : "Không thể tải chi tiết sân",
      );
    }
  };

  const formatPrice = (price: number) => {
    return `${new Intl.NumberFormat("vi-VN").format(price)} VND`;
  };

  return (
    <div data-cy="admin-fields-page" className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          data-cy="admin-fields-title"
          className="text-2xl font-bold text-foreground"
        >
          Quản Lý Sân
        </h1>
        <p className="text-muted-foreground">
          Phê duyệt và quản lý các sân thể thao trong hệ thống
        </p>
      </div>

      {/* Stats Cards */}
      <div
        data-cy="admin-fields-stats"
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      >
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
      <div
        data-cy="admin-fields-toolbar"
        className="flex flex-col md:flex-row gap-4 mb-6"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-cy="admin-fields-search-input"
            placeholder="Tìm kiếm theo tên sân, chủ sân, địa chỉ..."
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setCurrentPage(1);
            }}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: `Chờ Duyệt (${stats.pending})` },
            { value: "active", label: "Đã Duyệt" },
            { value: "hidden", label: "Từ Chối" },
          ].map((status) => (
            <button
              key={status.value}
              data-cy="admin-fields-status-filter"
              data-status={status.value}
              onClick={() => {
                setFilterStatus(status.value);
                setCurrentPage(1);
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
        <Card
          data-cy="admin-fields-loading"
          className="p-6 mb-6 text-center text-muted-foreground"
        >
          Đang tải dữ liệu...
        </Card>
      )}

      {/* Fields List */}
      {!loading && (
        <div data-cy="admin-fields-list" className="space-y-4 mb-8">
          {paginatedFields.map((field) => (
            <Card
              key={field.id}
              data-cy="admin-field-row"
              className="p-4 md:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Field Image */}
                <div className="w-full md:w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                  <img
                    src={field.images[0] || PLACEHOLDER_IMAGE}
                    alt={field.name}
                    className="w-full h-full object-cover"
                    onError={(event) => {
                      event.currentTarget.src = PLACEHOLDER_IMAGE;
                    }}
                  />
                </div>

                {/* Field Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3
                        data-cy="admin-field-name"
                        className="text-lg font-bold text-foreground"
                      >
                        {field.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{field.typeName}</Badge>
                        <span>•</span>
                        <span>{field.district}</span>
                      </div>
                    </div>
                    <Badge
                      data-cy="admin-field-status"
                      className={`flex-shrink-0 ${getFieldStatusClassName(field.status)}`}
                    >
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
                      <span className="text-foreground">
                        {formatPrice(field.priceWeekday)}/h
                      </span>
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
                      <span className="text-muted-foreground">
                        {field.totalBookings} lượt đặt
                      </span>
                      <span className="text-muted-foreground">
                        {field.totalReviews} đánh giá
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  {field.status === "pending" && (
                    <>
                      <Button
                        data-cy="admin-field-approve-button"
                        size="sm"
                        onClick={() => handleApprove(field.id)}
                        disabled={actionLoadingId === field.id}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Duyệt
                      </Button>
                      <Button
                        data-cy="admin-field-reject-button"
                        size="sm"
                        variant="outline"
                        className="text-destructive bg-transparent"
                        onClick={() => openRejectDialog(field.id)}
                        disabled={actionLoadingId === field.id}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Từ Chối
                      </Button>
                    </>
                  )}
                  <Button
                    data-cy="admin-field-detail-button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewDetail(field)}
                    disabled={actionLoadingId === field.id}
                  >
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
        <Card data-cy="admin-fields-empty" className="p-12 text-center">
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
      <Dialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open);

          if (!open) {
            setSelectedField(null);
            setPreviewImage(null);
          }
        }}
      >
        <DialogContent
          data-cy="admin-field-detail-dialog"
          className="max-w-2xl max-h-[85vh] overflow-y-auto"
        >
          {selectedField && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <DialogTitle
                      data-cy="admin-field-detail-name"
                      className="text-xl"
                    >
                      {selectedField.name}
                    </DialogTitle>
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
                {/* Hình ảnh */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage(selectedField.images[0] || DETAIL_PLACEHOLDER_IMAGE)
                    }
                    className="block w-full overflow-hidden rounded-lg"
                  >
                    <img
                      src={selectedField.images[0] || DETAIL_PLACEHOLDER_IMAGE}
                      alt={selectedField.name}
                      className="h-56 w-full rounded-lg object-cover transition hover:opacity-90"
                      onError={(event) => {
                        event.currentTarget.src = DETAIL_PLACEHOLDER_IMAGE;
                      }}
                    />
                  </button>

                  {selectedField.images.length > 1 && (
                    <div className="grid grid-cols-5 gap-2">
                      {selectedField.images.slice(1).map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setPreviewImage(image)}
                          className="overflow-hidden rounded-lg border border-border"
                        >
                          <img
                            src={image}
                            alt={`${selectedField.name} ${index + 2}`}
                            className="h-16 w-full object-cover transition hover:opacity-90"
                            onError={(event) => {
                              event.currentTarget.src = PLACEHOLDER_IMAGE;
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Thông tin chính - 2 columns */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Loại sân</p>
                    <p className="font-medium">{selectedField.typeName}</p>
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
                    <p className="font-medium text-primary">
                      {formatPrice(selectedField.priceWeekday)}/giờ
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Giá cuối tuần</p>
                    <p className="font-medium text-primary">
                      {formatPrice(selectedField.priceWeekend)}/giờ
                    </p>
                  </div>
                </div>

                {/* Tiện ích */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Tiện ích</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedField.amenities.length === 0 ? (
                      <span className="text-sm text-muted-foreground">
                        Chưa cập nhật
                      </span>
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
                      <p className="text-2xl font-bold text-primary">
                        {selectedField.rating}
                      </p>
                      <p className="text-xs text-muted-foreground">Điểm TB</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {selectedField.totalBookings}
                      </p>
                      <p className="text-xs text-muted-foreground">Lượt đặt</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-primary">
                        {selectedField.totalReviews}
                      </p>
                      <p className="text-xs text-muted-foreground">Đánh giá</p>
                    </div>
                  </div>
                )}

                {/* Lý do từ chối */}
                {selectedField.status === "hidden" && selectedField.rejectedReason && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">
                      Lý do từ chối
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {selectedField.rejectedReason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                {selectedField.status === "pending" && (
                  <div className="flex gap-3 pt-2">
                    <Button
                      data-cy="admin-field-detail-approve-button"
                      className="flex-1 bg-primary hover:bg-primary/90"
                      onClick={() => handleApprove(selectedField.id)}
                      disabled={actionLoadingId === selectedField.id}
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Phê Duyệt
                    </Button>
                    <Button
                      data-cy="admin-field-detail-reject-button"
                      variant="outline"
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20 bg-transparent"
                      onClick={() => {
                        const fieldId = selectedField.id;

                        setShowDetailDialog(false);
                        openRejectDialog(fieldId);
                      }}
                      disabled={actionLoadingId === selectedField.id}
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
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          if (open) {
            setShowRejectDialog(true);
            return;
          }

          if (actionLoadingId === fieldToReject) return;

          resetRejectDialog();
        }}
      >
        <DialogContent data-cy="admin-field-reject-dialog" className="max-w-md">
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
                data-cy="admin-field-reject-reason"
                id="rejectReason"
                placeholder="Nhập lý do từ chối sân này (ví dụ: Hình ảnh không rõ ràng, thiếu giấy phép kinh doanh...)"
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                Sau khi từ chối, sân sẽ không được hiển thị công khai trên hệ thống.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              data-cy="admin-field-reject-cancel"
              variant="outline"
              onClick={resetRejectDialog}
              disabled={actionLoadingId === fieldToReject}
            >
              Hủy
            </Button>
            <Button
              data-cy="admin-field-reject-confirm"
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoadingId === fieldToReject}
            >
              <X className="w-4 h-4 mr-2" />
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            type="button"
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 px-3 py-1 text-xl text-white hover:bg-white/20"
          >
            ×
          </button>

          <img
            src={previewImage}
            alt="Ảnh sân"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
            onError={(event) => {
              event.currentTarget.src = DETAIL_PLACEHOLDER_IMAGE;
            }}
          />
        </div>
      )}
    </div>
  );
}
