"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, MapPin, Users, Search, Filter, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"
import {
  getOwnerFields,
  updateOwnerFieldStatus,
  type OwnerFieldApi,
  type OwnerFieldStatus,
} from "@/features/fields/services/owner-fields.service"

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
}

const SPORT_TYPE_LABEL: Record<string, string> = {
  soccer: "Bóng Đá",
  basketball: "Bóng Rổ",
  tennis: "Tennis",
  badminton: "Cầu Lông",
  volleyball: "Bóng Chuyền",
  pickleball: "Pickleball",
}

const STATUS_LABEL: Record<OwnerFieldStatus, string> = {
  pending: "Chờ Duyệt",
  active: "Hoạt Động",
  hidden: "Đã Ẩn",
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

function getFieldImageUrl(field: OwnerFieldApi) {
  const primaryImage = field.images?.find((img) => img.is_primary) || field.images?.[0]

  if (!primaryImage?.url) {
    return "/placeholder.svg"
  }

  const normalizedPath = primaryImage.url.replaceAll("\\", "/")

  if (normalizedPath.startsWith("http")) {
    return normalizedPath
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
  const backendOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, "")

  return `${backendOrigin}/${normalizedPath.replace(/^\/+/, "")}`
}

function getPriceByDayType(field: OwnerFieldApi, dayType: "WEEKDAY" | "WEEKEND") {
  const rule = field.pricing_rules?.find((item) => item.day_type === dayType)

  return Number(rule?.price || field.base_price_per_hour || 0)
}

function getOperatingHourText(field: OwnerFieldApi) {
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

function mapOwnerFieldToView(field: OwnerFieldApi): OwnerFieldView {
  const location =
    field.address ||
    [field.address_line, field.ward, field.district, field.province].filter(Boolean).join(", ") ||
    "Chưa cập nhật địa chỉ"

  const operatingHour = getOperatingHourText(field)

  return {
    id: field.id,
    name: field.field_name || "Chưa có tên sân",
    type: field.sport_type ? SPORT_TYPE_LABEL[field.sport_type] || field.sport_type : "Chưa cập nhật",
    location,
    capacity: field.max_players || 0,

    price: getPriceByDayType(field, "WEEKDAY"),
    weekendPrice: getPriceByDayType(field, "WEEKEND"),

    openTime: operatingHour.openTime,
    closeTime: operatingHour.closeTime,

    status: field.status,
    image: getFieldImageUrl(field),
  }
}

export default function OwnerFieldsPage() {
  const [fields, setFields] = useState<OwnerFieldView[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [hideDialog, setHideDialog] = useState<number | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  const { toast } = useToast()

  const itemsPerPage = 6

  useEffect(() => {
    async function fetchOwnerFields() {
      try {
        setIsLoading(true)

        const response = await getOwnerFields()
        const mappedFields = response.data.map(mapOwnerFieldToView)

        setFields(mappedFields)
      } catch (error) {
        toast({
          title: "Không tải được danh sách sân",
          description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOwnerFields()
  }, [toast])

  const filteredFields = fields.filter((field) => {
    const keyword = searchQuery.toLowerCase()

    const matchesSearch =
      field.name.toLowerCase().includes(keyword) ||
      field.type.toLowerCase().includes(keyword) ||
      field.location.toLowerCase().includes(keyword)

    const matchesStatus = statusFilter === "all" || field.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredFields.length / itemsPerPage)

  const paginatedFields = filteredFields.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const handleHideField = async (id: number) => {
    try {
      const response = await updateOwnerFieldStatus(id, "hidden")
      const updatedField = mapOwnerFieldToView(response.data)

      setFields((prev) => prev.map((field) => (field.id === id ? updatedField : field)))
      setHideDialog(null)

      toast({
        title: "Đã ẩn sân",
        description: "Sân đã được ẩn khỏi danh sách công khai.",
      })
    } catch (error) {
      toast({
        title: "Không thể ẩn sân",
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/owner/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Quản lý sân</span>
          </div>
          <h1 className="text-xl font-bold">Quản Lý Sân</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sân..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
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
              <SelectTrigger className="w-full md:w-[200px]">
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
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân
              </Button>
            </Link>
          </div>
        </Card>

        <div className="text-sm text-muted-foreground mb-4">
          Hiển thị {filteredFields.length} / {fields.length} sân
        </div>

        {isLoading && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Đang tải danh sách sân...</p>
          </Card>
        )}

        {!isLoading && fields.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">Chưa có sân nào</p>
            <Link href="/owner/fields/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân Đầu Tiên
              </Button>
            </Link>
          </Card>
        )}

        {!isLoading && fields.length > 0 && filteredFields.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Không tìm thấy sân phù hợp</p>
          </Card>
        )}

        {!isLoading && filteredFields.length > 0 && (
          <div className="space-y-4 mb-8">
            {paginatedFields.map((field) => (
              <Card key={field.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <img
                    src={field.image || "/placeholder.svg"}
                    alt={field.name}
                    className="w-full md:w-48 h-48 object-cover"
                  />

                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-4 gap-4">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-1">{field.name}</h3>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            {field.location}
                          </div>
                        </div>

                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(field.status)}`}>
                          {STATUS_LABEL[field.status]}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Loại</p>
                          <p className="font-medium text-foreground">{field.type}</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground">Sức Chứa</p>
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
                          <p className="font-medium text-primary">{field.price.toLocaleString()} VND/h</p>
                        </div>

                        <div>
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            Giá T7-CN
                          </p>
                          <p className="font-medium text-primary">{field.weekendPrice.toLocaleString()} VND/h</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                        <Clock className="w-4 h-4" />
                        <span>
                          Giờ hoạt động:{" "}
                          {field.closeTime ? `${field.openTime} - ${field.closeTime}` : field.openTime}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-border">
                      <Link href={`/owner/fields/${field.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Sửa
                        </Button>
                      </Link>

                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent"
                        onClick={() => setHideDialog(field.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Ẩn sân
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && filteredFields.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredFields.length}
          />
        )}
      </div>

      <Dialog open={hideDialog !== null} onOpenChange={() => setHideDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận ẩn sân</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn ẩn sân này khỏi danh sách công khai không?
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setHideDialog(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => hideDialog && handleHideField(hideDialog)}>
              Xác Nhận Ẩn
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}