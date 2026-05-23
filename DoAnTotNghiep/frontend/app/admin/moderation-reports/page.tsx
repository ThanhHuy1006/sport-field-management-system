"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Flag,
  Star,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  MapPin,
  AlertTriangle,
  MoreHorizontal,
  RefreshCw,
  Image as ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Pagination } from "@/components/pagination"
import { useToast } from "@/hooks/use-toast"
import { apiGet, apiRequest } from "@/lib/api-client"
import { getImageUrl } from "@/lib/image-url"

// Types
type ReportStatus = "PENDING" | "REVIEWING" | "RESOLVED" | "REJECTED"

interface FieldReport {
  id: number
  type: "field"
  fieldName: string
  fieldId: number
  reporterName: string
  reporterEmail: string
  reason: string
  description: string
  status: ReportStatus
  createdAt: string
  updatedAt: string
  attachments: string[]
  adminNote?: string
}

interface ReviewReport {
  id: number
  type: "review"
  fieldName: string
  fieldId: number
  reviewAuthor: string
  reviewRating: number
  reviewText: string
  reporterName: string
  reporterEmail: string
  reason: string
  description: string
  status: ReportStatus
  createdAt: string
  updatedAt: string
  adminNote?: string
}

type Report = FieldReport | ReviewReport

type ApiListResponse<T> = {
  success?: boolean
  message?: string
  data?: {
    items?: T[]
    pagination?: {
      page?: number
      limit?: number
      total?: number
      total_pages?: number
    }
  }
}

type RawUser = {
  id?: number
  name?: string | null
  full_name?: string | null
  email?: string | null
  phone?: string | null
}

type RawField = {
  id?: number
  field_name?: string | null
  name?: string | null
  address?: string | null
  status?: string | null
}

type RawFieldReportAttachment =
  | string
  | {
      url?: string | null
      image_url?: string | null
      file_url?: string | null
      path?: string | null
    }

type RawFieldReport = {
  id: number
  field_id?: number | null
  field?: RawField | null
  reporter?: RawUser | null
  reporter_id?: number | null
  reporter_name?: string | null
  reporter_email?: string | null
  reason?: string | null
  description?: string | null
  status?: ReportStatus | null
  created_at?: string | null
  createdAt?: string | null
  updated_at?: string | null
  updatedAt?: string | null
  admin_note?: string | null
  adminNote?: string | null
  attachments?: RawFieldReportAttachment[] | null
  images?: RawFieldReportAttachment[] | null
}

type RawReview = {
  id?: number
  rating?: number | string | null
  comment?: string | null
  content?: string | null
  visible?: boolean | null
  user?: RawUser | null
  field?: RawField | null
}

type RawReviewReport = {
  id: number
  review_id?: number | null
  review?: RawReview | null
  reporter?: RawUser | null
  reporter_name?: string | null
  reporter_email?: string | null
  reason?: string | null
  description?: string | null
  status?: ReportStatus | null
  created_at?: string | null
  createdAt?: string | null
  updated_at?: string | null
  updatedAt?: string | null
  admin_note?: string | null
  adminNote?: string | null
  review_rating_snapshot?: number | string | null
  review_comment_snapshot?: string | null
  review_author_snapshot?: string | null
  field_name_snapshot?: string | null
  field_id?: number | null
}

function getArrayItems<T>(response: ApiListResponse<T>) {
  return Array.isArray(response.data?.items) ? response.data.items : []
}

function getDateValue(...values: Array<string | null | undefined>) {
  return values.find(Boolean) ?? new Date().toISOString()
}

function getUserName(user?: RawUser | null, fallback?: string | null) {
  return user?.name || user?.full_name || fallback || "Người dùng"
}

function getUserEmail(user?: RawUser | null, fallback?: string | null) {
  return user?.email || fallback || "Không có email"
}

function normalizeStatus(status?: ReportStatus | null): ReportStatus {
  if (
    status === "PENDING" ||
    status === "REVIEWING" ||
    status === "RESOLVED" ||
    status === "REJECTED"
  ) {
    return status
  }

  return "PENDING"
}

function normalizeRating(value: unknown) {
  const rating = Math.round(Number(value || 0))

  return Math.max(0, Math.min(5, rating))
}

function extractAttachmentUrls(
  attachments?: RawFieldReportAttachment[] | null,
) {
  if (!Array.isArray(attachments)) return []

  return attachments
    .map((item) => {
      if (typeof item === "string") return item

      return item.url || item.image_url || item.file_url || item.path || ""
    })
    .filter(Boolean)
    .map((url) => getImageUrl(url))
}

function mapFieldReportToUi(item: RawFieldReport): FieldReport {
  return {
    id: item.id,
    type: "field",
    fieldName:
      item.field?.field_name ||
      item.field?.name ||
      "Không có dữ liệu sân",
    fieldId: item.field?.id ?? item.field_id ?? 0,
    reporterName: getUserName(item.reporter, item.reporter_name),
    reporterEmail: getUserEmail(item.reporter, item.reporter_email),
    reason: item.reason || "OTHER",
    description: item.description || "Không có mô tả",
    status: normalizeStatus(item.status),
    createdAt: getDateValue(item.created_at, item.createdAt),
    updatedAt: getDateValue(item.updated_at, item.updatedAt),
    attachments: extractAttachmentUrls(item.attachments ?? item.images),
    adminNote: item.admin_note || item.adminNote || undefined,
  }
}

function mapReviewReportToUi(item: RawReviewReport): ReviewReport {
  return {
    id: item.id,
    type: "review",
    fieldName:
      item.review?.field?.field_name ||
      item.review?.field?.name ||
      item.field_name_snapshot ||
      "Không có dữ liệu sân",
    fieldId: item.review?.field?.id ?? item.field_id ?? 0,
    reviewAuthor:
      getUserName(item.review?.user, item.review_author_snapshot) ||
      "Người dùng",
    reviewRating: normalizeRating(
      item.review?.rating ?? item.review_rating_snapshot,
    ),
    reviewText:
      item.review?.comment ||
      item.review?.content ||
      item.review_comment_snapshot ||
      "Không có nội dung đánh giá",
    reporterName: getUserName(item.reporter, item.reporter_name),
    reporterEmail: getUserEmail(item.reporter, item.reporter_email),
    reason: item.reason || "OTHER",
    description: item.description || "Không có mô tả",
    status: normalizeStatus(item.status),
    createdAt: getDateValue(item.created_at, item.createdAt),
    updatedAt: getDateValue(item.updated_at, item.updatedAt),
    adminNote: item.admin_note || item.adminNote || undefined,
  }
}

const FIELD_REASON_LABELS: Record<string, string> = {
  WRONG_INFO: "Thông tin không chính xác",
  FAKE_IMAGE: "Hình ảnh không đúng thực tế",
  FIELD_CLOSED: "Sân đã đóng cửa",
  BAD_QUALITY: "Chất lượng sân kém",
  OWNER_ATTITUDE: "Thái độ chủ sân",
  FRAUD: "Gian lận / Lừa đảo",
  OTHER: "Khác",
}

const REVIEW_REASON_LABELS: Record<string, string> = {
  FAKE_REVIEW: "Đánh giá ảo",
  SPAM: "Spam",
  OFFENSIVE: "Nội dung không phù hợp",
  OFFENSIVE_LANGUAGE: "Nội dung không phù hợp",
  DEFAMATION: "Vu khống / Bôi nhọ",
  IRRELEVANT: "Nội dung không liên quan",
  HARASSMENT: "Quấy rối / Công kích cá nhân",
  OTHER: "Khác",
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; color: string; icon: any }> = {
  PENDING: { label: "Chờ xử lý", color: "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400", icon: Clock },
  REVIEWING: { label: "Đang xem xét", color: "bg-blue-100 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400", icon: Eye },
  RESOLVED: { label: "Đã xử lý", color: "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400", icon: CheckCircle },
  REJECTED: { label: "Từ chối", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400", icon: XCircle },
}

export default function ReportsManagementPage() {
  const [activeTab, setActiveTab] = useState<"field" | "review">("field")
  const [fieldReports, setFieldReports] = useState<FieldReport[]>([])
  const [reviewReports, setReviewReports] = useState<ReviewReport[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [reasonFilter, setReasonFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showActionDialog, setShowActionDialog] = useState(false)
  const [actionType, setActionType] = useState<"resolve" | "reject" | null>(null)
  const [adminNote, setAdminNote] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const itemsPerPage = 10

  async function fetchFieldReports() {
    const response = await apiGet<ApiListResponse<RawFieldReport>>(
      "/admin/field-reports",
      {
        page: 1,
        limit: 100,
      },
    )

    setFieldReports(getArrayItems(response).map(mapFieldReportToUi))
  }

  async function fetchReviewReports() {
    const response = await apiGet<ApiListResponse<RawReviewReport>>(
      "/admin/review-reports",
      {
        page: 1,
        limit: 100,
      },
    )

    setReviewReports(getArrayItems(response).map(mapReviewReportToUi))
  }

  async function fetchReports() {
    try {
      setIsLoading(true)

      await Promise.all([fetchFieldReports(), fetchReviewReports()])
    } catch (error) {
      toast({
        title: "Không thể tải báo cáo",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Get current reports based on active tab
  const currentReports = activeTab === "field" ? fieldReports : reviewReports
  const reasonLabels = activeTab === "field" ? FIELD_REASON_LABELS : REVIEW_REASON_LABELS

  // Filter reports
  const filteredReports = useMemo(() => {
    return currentReports.filter((report) => {
      const matchesSearch =
        searchTerm === "" ||
        ("fieldName" in report && report.fieldName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        report.reporterName.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || report.status === statusFilter
      const matchesReason = reasonFilter === "all" || report.reason === reasonFilter
      return matchesSearch && matchesStatus && matchesReason
    })
  }, [currentReports, searchTerm, statusFilter, reasonFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage))
  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Stats
  const stats = useMemo(() => {
    const reports = activeTab === "field" ? fieldReports : reviewReports
    return {
      total: reports.length,
      pending: reports.filter((r) => r.status === "PENDING").length,
      reviewing: reports.filter((r) => r.status === "REVIEWING").length,
      resolved: reports.filter((r) => r.status === "RESOLVED").length,
      rejected: reports.filter((r) => r.status === "REJECTED").length,
    }
  }, [activeTab, fieldReports, reviewReports])

  // Handle status update
  const handleUpdateStatus = async (
    status: ReportStatus,
    reportOverride?: Report,
  ) => {
    const targetReport = reportOverride ?? selectedReport

    if (!targetReport) return

    try {
      setIsLoading(true)

      const endpoint =
        targetReport.type === "field"
          ? `/admin/field-reports/${targetReport.id}/status`
          : `/admin/review-reports/${targetReport.id}/status`

      const body =
        targetReport.type === "field"
          ? {
              status,
              admin_note: adminNote || targetReport.adminNote || null,
              hide_field: false,
            }
          : {
              status,
              admin_note: adminNote || targetReport.adminNote || null,
              hide_review: false,
            }

      await apiRequest(endpoint, {
        method: "PATCH",
        body: JSON.stringify(body),
      })

      const updatedReport = {
        ...targetReport,
        status,
        updatedAt: new Date().toISOString(),
        adminNote: adminNote || targetReport.adminNote,
      }

      if (targetReport.type === "field") {
        setFieldReports((prev) =>
          prev.map((report) =>
            report.id === targetReport.id ? (updatedReport as FieldReport) : report,
          ),
        )
        await fetchFieldReports()
      } else {
        setReviewReports((prev) =>
          prev.map((report) =>
            report.id === targetReport.id ? (updatedReport as ReviewReport) : report,
          ),
        )
        await fetchReviewReports()
      }

      setShowActionDialog(false)
      setShowDetailDialog(false)
      setAdminNote("")
      setSelectedReport(null)

      toast({
        title: "Cập nhật thành công",
        description: `Báo cáo đã được ${
          status === "RESOLVED"
            ? "giải quyết"
            : status === "REJECTED"
              ? "từ chối"
              : "cập nhật"
        }.`,
      })
    } catch (error) {
      toast({
        title: "Cập nhật thất bại",
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật trạng thái báo cáo.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)

    if (Number.isNaN(date.getTime())) {
      return "Không xác định"
    }

    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Reset filters when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value as "field" | "review")
    setSearchTerm("")
    setStatusFilter("all")
    setReasonFilter("all")
    setCurrentPage(1)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-foreground mb-2">Quản lý báo cáo</h1>
        <p className="text-muted-foreground">
          Xem xét và xử lý các báo cáo từ người dùng về sân và đánh giá
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="bg-muted p-1 rounded-lg">
          <TabsTrigger
            value="field"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-4 py-2"
          >
            <MapPin className="w-4 h-4" />
            Báo cáo sân
            {stats.pending > 0 && activeTab === "field" && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {fieldReports.filter((r) => r.status === "PENDING").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="review"
            className="flex items-center gap-2 data-[state=active]:bg-card data-[state=active]:shadow-sm rounded-md px-4 py-2"
          >
            <Star className="w-4 h-4" />
            Báo cáo đánh giá
            {reviewReports.filter((r) => r.status === "PENDING").length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {reviewReports.filter((r) => r.status === "PENDING").length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground mb-1">Tổng cộng</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Clock className="w-3.5 h-3.5 text-orange-500" />
              Chờ xử lý
            </div>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Eye className="w-3.5 h-3.5 text-blue-500" />
              Đang xem xét
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.reviewing}</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              Đã xử lý
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <XCircle className="w-3.5 h-3.5 text-gray-500" />
              Từ chối
            </div>
            <div className="text-2xl font-bold text-gray-600">{stats.rejected}</div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-card border-border">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên sân, người báo cáo..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 bg-muted border-input"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-48 bg-muted border-input">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Chờ xử lý</SelectItem>
                <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
                <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
                <SelectItem value="REJECTED">Từ chối</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={reasonFilter}
              onValueChange={(value) => {
                setReasonFilter(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full md:w-48 bg-muted border-input">
                <SelectValue placeholder="Lý do" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">Tất cả lý do</SelectItem>
                {Object.entries(reasonLabels).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSearchTerm("")
                setStatusFilter("all")
                setReasonFilter("all")
                setCurrentPage(1)
                fetchReports()
              }}
              className="bg-transparent"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Reports Table */}
        <TabsContent value="field" className="mt-0">
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Sân</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Người báo cáo</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Lý do</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Trạng thái</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Ngày tạo</th>
                    <th className="text-right p-4 font-medium text-muted-foreground text-sm">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedReports.map((report) => {
                    const fieldReport = report as FieldReport
                    const statusConfig = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.PENDING
                    const StatusIcon = statusConfig.icon
                    return (
                      <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <MapPin className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{fieldReport.fieldName}</p>
                              <p className="text-xs text-muted-foreground">ID: {fieldReport.fieldId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-foreground">{report.reporterName}</p>
                          <p className="text-xs text-muted-foreground">{report.reporterEmail}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-normal">
                            {FIELD_REASON_LABELS[report.reason] || report.reason}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${statusConfig.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report)
                                  setShowDetailDialog(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {report.status === "PENDING" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedReport(report)
                                    handleUpdateStatus("REVIEWING", report)
                                  }}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Đánh dấu đang xem xét
                                </DropdownMenuItem>
                              )}
                              {(report.status === "PENDING" || report.status === "REVIEWING") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setAdminNote("")
                                      setActionType("resolve")
                                      setShowActionDialog(true)
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Giải quyết
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setAdminNote("")
                                      setActionType("reject")
                                      setShowActionDialog(true)
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Từ chối
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <div className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không tìm thấy báo cáo nào</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="review" className="mt-0">
          <Card className="bg-card border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px]">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Đánh giá</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Người báo cáo</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Lý do</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Trạng thái</th>
                    <th className="text-left p-4 font-medium text-muted-foreground text-sm">Ngày tạo</th>
                    <th className="text-right p-4 font-medium text-muted-foreground text-sm">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {paginatedReports.map((report) => {
                    const reviewReport = report as ReviewReport
                    const statusConfig = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.PENDING
                    const StatusIcon = statusConfig.icon
                    return (
                      <tr key={report.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                              <Star className="w-5 h-5 text-amber-600" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-foreground">{reviewReport.reviewAuthor}</span>
                                <div className="flex items-center gap-0.5">
                                  {Array.from({ length: 5 }).map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i < reviewReport.reviewRating
                                          ? "fill-amber-400 text-amber-400"
                                          : "text-muted-foreground"
                                      }`}
                                    />
                                  ))}
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground truncate max-w-xs">
                                {reviewReport.reviewText}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Sân: {reviewReport.fieldName}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-foreground">{report.reporterName}</p>
                          <p className="text-xs text-muted-foreground">{report.reporterEmail}</p>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-normal">
                            {REVIEW_REASON_LABELS[report.reason] || report.reason}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge className={`${statusConfig.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {formatDate(report.createdAt)}
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover border-border">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedReport(report)
                                  setShowDetailDialog(true)
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Xem chi tiết
                              </DropdownMenuItem>
                              {report.status === "PENDING" && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedReport(report)
                                    handleUpdateStatus("REVIEWING", report)
                                  }}
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Đánh dấu đang xem xét
                                </DropdownMenuItem>
                              )}
                              {(report.status === "PENDING" || report.status === "REVIEWING") && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setAdminNote("")
                                      setActionType("resolve")
                                      setShowActionDialog(true)
                                    }}
                                    className="text-green-600"
                                  >
                                    <CheckCircle className="w-4 h-4 mr-2" />
                                    Giải quyết
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setAdminNote("")
                                      setActionType("reject")
                                      setShowActionDialog(true)
                                    }}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Từ chối
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {filteredReports.length === 0 && (
              <div className="p-12 text-center">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Không tìm thấy báo cáo nào</p>
              </div>
            )}

            {totalPages > 1 && (
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <Flag className="w-5 h-5 text-red-500" />
              Chi tiết báo cáo #{selectedReport?.id}
            </DialogTitle>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Trạng thái</p>
                  <Badge className={`${STATUS_CONFIG[selectedReport.status].color} border-0`}>
                    {STATUS_CONFIG[selectedReport.status].label}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground mb-1">Ngày tạo</p>
                  <p className="text-sm font-medium text-foreground">{formatDate(selectedReport.createdAt)}</p>
                </div>
              </div>

              {/* Report Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Người báo cáo</p>
                  <p className="font-medium text-foreground">{selectedReport.reporterName}</p>
                  <p className="text-sm text-muted-foreground">{selectedReport.reporterEmail}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Lý do</p>
                  <Badge variant="outline">
                    {(selectedReport.type === "field" ? FIELD_REASON_LABELS : REVIEW_REASON_LABELS)[selectedReport.reason] || selectedReport.reason}
                  </Badge>
                </div>
              </div>

              {/* Target Info */}
              {selectedReport.type === "field" ? (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Sân bị báo cáo</p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{(selectedReport as FieldReport).fieldName}</p>
                      <p className="text-sm text-muted-foreground">ID: {(selectedReport as FieldReport).fieldId}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Đánh giá bị báo cáo</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">{(selectedReport as ReviewReport).reviewAuthor}</span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (selectedReport as ReviewReport).reviewRating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-foreground italic">"{(selectedReport as ReviewReport).reviewText}"</p>
                    <p className="text-xs text-muted-foreground">Sân: {(selectedReport as ReviewReport).fieldName}</p>
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Mô tả chi tiết</p>
                <p className="text-foreground bg-muted p-3 rounded-lg">{selectedReport.description}</p>
              </div>

              {/* Attachments */}
              {selectedReport.type === "field" && (selectedReport as FieldReport).attachments.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Hình ảnh đính kèm</p>
                  <div className="flex gap-2 flex-wrap">
                    {(selectedReport as FieldReport).attachments.map((url, i) => (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="relative w-20 h-20 rounded-lg bg-muted flex items-center justify-center border border-border overflow-hidden"
                      >
                        <img
                          src={url}
                          alt={`Ảnh báo cáo ${i + 1}`}
                          className="relative z-10 w-full h-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display = "none"
                          }}
                        />
                        <ImageIcon className="w-6 h-6 text-muted-foreground absolute" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Note */}
              {selectedReport.adminNote && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900">
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-1">Ghi chú admin</p>
                  <p className="text-sm text-blue-600 dark:text-blue-300">{selectedReport.adminNote}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)} className="bg-transparent">
              Đóng
            </Button>
            {selectedReport && (selectedReport.status === "PENDING" || selectedReport.status === "REVIEWING") && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdminNote("")
                    setActionType("reject")
                    setShowActionDialog(true)
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Từ chối
                </Button>
                <Button
                  onClick={() => {
                    setAdminNote("")
                    setActionType("resolve")
                    setShowActionDialog(true)
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Giải quyết
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog */}
      <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {actionType === "resolve" ? "Giải quyết báo cáo" : "Từ chối báo cáo"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {actionType === "resolve"
                ? "Xác nhận đã xử lý báo cáo này. Vui lòng nhập ghi chú về cách xử lý."
                : "Từ chối báo cáo này. Vui lòng nhập lý do từ chối."}
            </p>

            <div>
              <Label className="text-foreground">Ghi chú</Label>
              <Textarea
                placeholder={actionType === "resolve" ? "Nhập ghi chú về cách xử lý..." : "Nhập lý do từ chối..."}
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                className="mt-2 bg-muted border-input text-foreground"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActionDialog(false)} className="bg-transparent">
              Hủy
            </Button>
            <Button
              onClick={() => handleUpdateStatus(actionType === "resolve" ? "RESOLVED" : "REJECTED")}
              disabled={isLoading}
              className={
                actionType === "resolve"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-red-600 hover:bg-red-700 text-white"
              }
            >
              {isLoading ? "Đang xử lý..." : actionType === "resolve" ? "Giải quyết" : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
