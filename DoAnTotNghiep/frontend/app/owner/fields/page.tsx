"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Plus,
  Edit,
  Trash2,
  MapPin,
  Users,
  Search,
  Filter,
  Clock,
  DollarSign,
  Eye,
  ShieldAlert,
  RefreshCcw,
  Loader2,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"
import {
  getOwnerFields,
  updateOwnerFieldStatus,
  type OwnerFieldApi,
  type OwnerFieldStatus,
} from "@/features/fields/services/owner-fields.service"

type HiddenByRole = "OWNER" | "ADMIN" | "SYSTEM"

type OwnerFieldApiWithHidden = OwnerFieldApi & {
  hidden_by_role?: HiddenByRole | null
  hidden_reason?: string | null
  hidden_at?: string | null
}

type OwnerFieldView = {
  id: number
  name: string
  type: string
  location: string
  capacity: number
  price: number
  weekendPrice: number
  openTime: string
  closeTime: string
  status: OwnerFieldStatus
  image: string

  hiddenByRole: HiddenByRole | null
  hiddenReason: string | null
  hiddenAt: string | null
}

const ITEMS_PER_PAGE = 6

const SPORT_TYPE_LABEL: Record<string, string> = {
  soccer: "Bóng Đá",
  basketball: "Bóng Rổ",
  tennis: "Tennis",
  badminton: "Cầu Lông",
  volleyball: "Bóng Chuyền",
  pickleball: "Pickleball",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "Chờ Duyệt",
  active: "Hoạt Động",
  hidden: "Đã Ẩn",
  inactive: "Đã Ẩn",
  maintenance: "Bảo Trì",
}

function getStatusClass(status: OwnerFieldStatus) {
  if (status === "active") {
    return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
  }

  if (status === "pending") {
    return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
  }

  if (status === "maintenance") {
    return "bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300"
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
}

function normalizeOwnerFieldStatus(status?: string | null): OwnerFieldStatus {
  const normalized = String(status || "pending").trim().toLowerCase()

  if (normalized === "inactive") {
    return "hidden" as OwnerFieldStatus
  }

  if (
    normalized === "active" ||
    normalized === "pending" ||
    normalized === "hidden" ||
    normalized === "maintenance"
  ) {
    return normalized as OwnerFieldStatus
  }

  return "pending" as OwnerFieldStatus
}

function extractOwnerFieldItems(response: unknown): OwnerFieldApiWithHidden[] {
  const data = (response as { data?: unknown })?.data

  if (Array.isArray(data)) {
    return data as OwnerFieldApiWithHidden[]
  }

  if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as { items?: unknown }).items)
  ) {
    return (data as { items: OwnerFieldApiWithHidden[] }).items
  }

  return []
}

function getFieldImageUrl(field: OwnerFieldApiWithHidden) {
  const primaryImage =
    field.images?.find((img) => img.is_primary) || field.images?.[0]

  if (!primaryImage?.url) {
    return "/placeholder.svg"
  }

  const normalizedPath = primaryImage.url.replaceAll("\\", "/")

  if (normalizedPath.startsWith("http")) {
    return normalizedPath
  }

  const apiBaseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"

  const backendOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, "")

  return `${backendOrigin}/${normalizedPath.replace(/^\/+/, "")}`
}

function getPriceByDayType(
  field: OwnerFieldApiWithHidden,
  dayType: "WEEKDAY" | "WEEKEND",
) {
  const rule = field.pricing_rules?.find((item) => item.day_type === dayType)

  return Number(rule?.price || field.base_price_per_hour || 0)
}

function getOperatingHourText(field: OwnerFieldApiWithHidden) {
  const activeHours = field.operating_hours?.filter(
    (item) => !item.is_closed && item.open_time && item.close_time,
  )

  if (!activeHours || activeHours.length === 0) {
    return {
      openTime: "Chưa cấu hình",
      closeTime: "",
    }
  }

  const first = activeHours[0]

  return {
    openTime: first.open_time || "Chưa cấu hình",
    closeTime: first.close_time || "",
  }
}

function mapOwnerFieldToView(field: OwnerFieldApiWithHidden): OwnerFieldView {
  const location =
    field.address ||
    [field.address_line, field.ward, field.district, field.province]
      .filter(Boolean)
      .join(", ") ||
    "Chưa cập nhật địa chỉ"

  const operatingHour = getOperatingHourText(field)

  return {
    id: field.id,
    name: field.field_name || "Chưa có tên sân",
    type: field.sport_type
      ? SPORT_TYPE_LABEL[field.sport_type] || field.sport_type
      : "Chưa cập nhật",
    location,
    capacity: field.max_players || 0,

    price: getPriceByDayType(field, "WEEKDAY"),
    weekendPrice: getPriceByDayType(field, "WEEKEND"),

    openTime: operatingHour.openTime,
    closeTime: operatingHour.closeTime,

    status: normalizeOwnerFieldStatus(field.status),
    image: getFieldImageUrl(field),

    hiddenByRole: field.hidden_by_role ?? null,
    hiddenReason: field.hidden_reason ?? null,
    hiddenAt: field.hidden_at ?? null,
  }
}

function canOwnerHideField(field: OwnerFieldView) {
  return field.status === "active" || field.status === "maintenance"
}

function canOwnerShowFieldAgain(field: OwnerFieldView) {
  return field.status === "hidden" && field.hiddenByRole !== "ADMIN"
}

export default function OwnerFieldsPage() {
  const [fields, setFields] = useState<OwnerFieldView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [hideDialog, setHideDialog] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)

  const { toast } = useToast()

  const fetchOwnerFields = useCallback(async () => {
    try {
      setIsLoading(true)
      setErrorMessage("")

      const response = await getOwnerFields()
      const items = extractOwnerFieldItems(response)
      const mappedFields = items.map(mapOwnerFieldToView)

      setFields(mappedFields)
      setCurrentPage(1)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không tải được danh sách sân."

      setFields([])
      setErrorMessage(message)

      toast({
        title: "Không tải được danh sách sân",
        description: message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast])

  useEffect(() => {
    void fetchOwnerFields()
  }, [fetchOwnerFields])

  const filteredFields = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase()

    return fields.filter((field) => {
      const matchesSearch =
        !keyword ||
        field.name.toLowerCase().includes(keyword) ||
        field.type.toLowerCase().includes(keyword) ||
        field.location.toLowerCase().includes(keyword)

      const matchesStatus =
        statusFilter === "all" || field.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [fields, searchQuery, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredFields.length / ITEMS_PER_PAGE))

  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const handleUpdateFieldStatus = async (
    id: number,
    status: OwnerFieldStatus,
  ) => {
    try {
      setActionLoadingId(id)

      const response = await updateOwnerFieldStatus(id, status)
      const updatedField = mapOwnerFieldToView(
        response.data as OwnerFieldApiWithHidden,
      )

      setFields((prev) =>
        prev.map((field) => (field.id === id ? updatedField : field)),
      )

      setHideDialog(null)

      toast({
        title: status === "active" ? "Đã hiển thị lại sân" : "Đã ẩn sân",
        description:
          status === "active"
            ? "Sân đã được hiển thị công khai trở lại."
            : "Sân đã được ẩn khỏi danh sách công khai.",
      })
    } catch (error) {
      toast({
        title: "Cập nhật trạng thái thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleHideField = async (id: number) => {
    await handleUpdateFieldStatus(id, "hidden" as OwnerFieldStatus)
  }

  const handleShowFieldAgain = async (id: number) => {
    await handleUpdateFieldStatus(id, "active" as OwnerFieldStatus)
  }

  return (
    <main data-cy="owner-fields-page" className="min-h-screen bg-background">
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link
              href="/"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link
              href="/owner/dashboard"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Quản lý sân</span>
          </div>
          <h1 className="text-xl font-bold">Quản Lý Sân</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card data-cy="owner-fields-toolbar" className="p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                data-cy="owner-field-search-input"
                placeholder="Tìm kiếm sân..."
                value={searchQuery}
                onChange={(event) => {
                  setSearchQuery(event.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger
                data-cy="owner-field-status-filter"
                className="w-full md:w-[200px]"
              >
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="pending">Chờ duyệt</SelectItem>
                <SelectItem value="maintenance">Bảo trì</SelectItem>
                <SelectItem value="hidden">Đã ẩn</SelectItem>
              </SelectContent>
            </Select>

            <Link href="/owner/fields/new">
              <Button data-cy="owner-add-field-button">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân
              </Button>
            </Link>
          </div>
        </Card>

        {errorMessage && (
          <Card className="mb-4 border-destructive/30 bg-destructive/10 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <p className="text-sm text-destructive">{errorMessage}</p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => void fetchOwnerFields()}
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Thử lại
              </Button>
            </div>
          </Card>
        )}

        <div
          data-cy="owner-fields-result-count"
          className="text-sm text-muted-foreground mb-4"
        >
          Hiển thị {filteredFields.length} / {fields.length} sân
        </div>

        {isLoading && (
          <Card data-cy="owner-fields-loading" className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Đang tải danh sách sân...
            </p>
          </Card>
        )}

        {!isLoading && fields.length === 0 && !errorMessage && (
          <Card data-cy="owner-fields-empty" className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">Chưa có sân nào</p>
            <Link href="/owner/fields/new">
              <Button data-cy="owner-add-first-field-button">
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân Đầu Tiên
              </Button>
            </Link>
          </Card>
        )}

        {!isLoading && fields.length > 0 && filteredFields.length === 0 && (
          <Card data-cy="owner-fields-no-result" className="p-12 text-center">
            <p className="text-muted-foreground text-lg">
              Không tìm thấy sân phù hợp
            </p>
          </Card>
        )}

        {!isLoading && filteredFields.length > 0 && (
          <div data-cy="owner-fields-list" className="space-y-4 mb-8">
            {paginatedFields.map((field) => {
              const isAdminHidden =
                field.status === "hidden" && field.hiddenByRole === "ADMIN"

              return (
                <Card
                  key={field.id}
                  data-cy="owner-field-card"
                  className="overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    <img
                      src={field.image || "/placeholder.svg"}
                      alt={field.name}
                      className="w-full md:w-48 h-48 object-cover"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder.svg"
                      }}
                    />

                    <div className="flex-1 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between mb-4 gap-4">
                          <div>
                            <h3
                              data-cy="owner-field-name"
                              className="text-xl font-bold text-foreground mb-1"
                            >
                              {field.name}
                            </h3>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="w-4 h-4" />
                              {field.location}
                            </div>
                          </div>

                          <span
                            data-cy="owner-field-status"
                            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(
                              field.status,
                            )}`}
                          >
                            {STATUS_LABEL[field.status] ?? field.status}
                          </span>
                        </div>

                        {isAdminHidden && (
                          <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                            <div className="flex items-start gap-2">
                              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                              <p>
                                Sân đang bị quản trị viên ẩn
                                {field.hiddenReason ? `: ${field.hiddenReason}` : "."}
                              </p>
                            </div>
                          </div>
                        )}

                        {field.status === "hidden" &&
                          field.hiddenByRole === "OWNER" && (
                            <div className="mb-4 rounded-lg border border-muted bg-muted/50 px-3 py-2 text-sm text-muted-foreground">
                              Sân đang được ẩn bởi chủ sân
                              {field.hiddenReason ? `: ${field.hiddenReason}` : "."}
                            </div>
                          )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Loại</p>
                            <p className="font-medium text-foreground">
                              {field.type}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground">
                              Sức Chứa
                            </p>
                            <p className="font-medium text-foreground flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {field.capacity} người
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              Giá T2-T6
                            </p>
                            <p className="font-medium text-primary">
                              {field.price.toLocaleString()} VND/h
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              Giá T7-CN
                            </p>
                            <p className="font-medium text-primary">
                              {field.weekendPrice.toLocaleString()} VND/h
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                          <Clock className="w-4 h-4" />
                          <span>
                            Giờ hoạt động:{" "}
                            {field.closeTime
                              ? `${field.openTime} - ${field.closeTime}`
                              : field.openTime}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                        <Link href={`/owner/fields/${field.id}/edit`}>
                          <Button
                            data-cy="owner-edit-field-button"
                            variant="outline"
                            size="sm"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Sửa
                          </Button>
                        </Link>

                        {isAdminHidden && (
                          <Button variant="outline" size="sm" disabled>
                            <ShieldAlert className="w-4 h-4 mr-2" />
                            Bị admin ẩn
                          </Button>
                        )}

                        {!isAdminHidden && canOwnerShowFieldAgain(field) && (
                          <Button
                            data-cy="owner-show-field-button"
                            variant="outline"
                            size="sm"
                            disabled={actionLoadingId === field.id}
                            onClick={() => void handleShowFieldAgain(field.id)}
                          >
                            {actionLoadingId === field.id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Đang xử lý...
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4 mr-2" />
                                Hiển thị lại
                              </>
                            )}
                          </Button>
                        )}

                        {canOwnerHideField(field) && (
                          <Button
                            data-cy="owner-hide-field-button"
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-transparent"
                            disabled={actionLoadingId === field.id}
                            onClick={() => setHideDialog(field.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Ẩn sân
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}

        {!isLoading && filteredFields.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={ITEMS_PER_PAGE}
            totalItems={filteredFields.length}
          />
        )}
      </div>

      <Dialog
        open={hideDialog !== null}
        onOpenChange={(open) => {
          if (!open) {
            setHideDialog(null)
          }
        }}
      >
        <DialogContent data-cy="owner-hide-field-dialog">
          <DialogHeader>
            <DialogTitle>Xác nhận ẩn sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn ẩn sân này khỏi danh sách công khai không?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              data-cy="owner-hide-cancel-button"
              variant="outline"
              onClick={() => setHideDialog(null)}
            >
              Hủy
            </Button>

            <Button
              data-cy="owner-hide-confirm-button"
              variant="destructive"
              disabled={!hideDialog || actionLoadingId === hideDialog}
              onClick={() => hideDialog && void handleHideField(hideDialog)}
            >
              {hideDialog && actionLoadingId === hideDialog ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang ẩn...
                </>
              ) : (
                "Xác Nhận Ẩn"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
