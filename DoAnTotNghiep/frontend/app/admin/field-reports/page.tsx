"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Eye,
  ImageIcon,
  RefreshCw,
  ShieldAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pagination } from "@/components/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { getImageUrl } from "@/lib/image-url"
import {
  getAdminFieldReports,
  updateFieldReportStatus,
} from "@/features/field-reports/services/admin-field-reports"
import type {
  FieldReport,
  FieldReportReason,
  FieldReportStatus,
} from "@/types/field-report"

const ITEMS_PER_PAGE = 10

const STATUS_LABELS: Record<FieldReportStatus, string> = {
  PENDING: "Chờ xử lý",
  REVIEWING: "Đang xem xét",
  RESOLVED: "Đã xử lý",
  REJECTED: "Đã từ chối",
}

const REASON_LABELS: Record<FieldReportReason, string> = {
  WRONG_INFO: "Thông tin không chính xác",
  FAKE_IMAGE: "Hình ảnh không đúng thực tế",
  FIELD_CLOSED: "Sân đã đóng cửa / không hoạt động",
  BAD_QUALITY: "Chất lượng sân không tốt",
  OWNER_ATTITUDE: "Chủ sân xử lý không tốt",
  OTHER: "Lý do khác",
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("vi-VN")
}

function getStatusBadgeVariant(status: FieldReportStatus) {
  if (status === "PENDING") return "destructive"
  if (status === "REVIEWING") return "secondary"
  if (status === "RESOLVED") return "default"

  return "outline"
}

export default function AdminFieldReportsPage() {
  const [reports, setReports] = useState<FieldReport[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] =
    useState<FieldReportStatus | "all">("all")
  const [filterReason, setFilterReason] =
    useState<FieldReportReason | "all">("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const { toast } = useToast()

  async function fetchReports(page = currentPage) {
    try {
      setIsLoading(true)

      const response = await getAdminFieldReports({
        page,
        limit: ITEMS_PER_PAGE,
        status: filterStatus,
        reason: filterReason,
      })

      setReports(response.data.items)
      setCurrentPage(response.data.pagination.page)
      setTotalPages(response.data.pagination.total_pages)
      setTotalItems(response.data.pagination.total)
    } catch (error) {
      toast({
        title: "Không thể tải báo cáo sân",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterReason])

  const filteredReports = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase()

    if (!keyword) return reports

    return reports.filter((report) => {
      const fieldName = report.field?.field_name?.toLowerCase() ?? ""
      const reporterName = report.reporter?.name?.toLowerCase() ?? ""
      const reporterEmail = report.reporter?.email?.toLowerCase() ?? ""
      const description = report.description?.toLowerCase() ?? ""

      return (
        fieldName.includes(keyword) ||
        reporterName.includes(keyword) ||
        reporterEmail.includes(keyword) ||
        description.includes(keyword)
      )
    })
  }, [reports, searchTerm])

  const pendingCount = reports.filter(
    (item) => item.status === "PENDING"
  ).length
  const reviewingCount = reports.filter(
    (item) => item.status === "REVIEWING"
  ).length
  const resolvedCount = reports.filter(
    (item) => item.status === "RESOLVED"
  ).length
  const rejectedCount = reports.filter(
    (item) => item.status === "REJECTED"
  ).length

  async function handleUpdateStatus(
    reportId: number,
    status: FieldReportStatus,
    options?: {
      admin_note?: string | null
      hide_field?: boolean
    }
  ) {
    try {
      setIsActionLoading(true)

      await updateFieldReportStatus(reportId, {
        status,
        admin_note: options?.admin_note ?? null,
        hide_field: options?.hide_field ?? false,
      })

      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái báo cáo sân đã được cập nhật.",
      })

      await fetchReports(currentPage)
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
      setIsActionLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>

          <h1 className="text-xl font-bold">Báo cáo sân</h1>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchReports(currentPage)}
            disabled={isLoading}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Tải lại
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {pendingCount > 0 && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-red-800 dark:text-red-200">
                Có {pendingCount} báo cáo sân đang chờ Admin xem xét trong danh
                sách hiện tại.
              </p>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterStatus("PENDING")
                  setCurrentPage(1)
                }}
              >
                Xem ngay
              </Button>
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Tổng báo cáo
            </h3>
            <p className="text-3xl font-bold text-foreground">{totalItems}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Chờ xử lý
            </h3>
            <p className="text-3xl font-bold text-red-600">{pendingCount}</p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Đang xem xét
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {reviewingCount}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Đã xử lý
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {resolvedCount}
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Đã từ chối
            </h3>
            <p className="text-3xl font-bold text-muted-foreground">
              {rejectedCount}
            </p>
          </Card>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm theo sân, người báo cáo, email hoặc mô tả..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-full lg:w-96"
          />

          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value as FieldReportStatus | "all")
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full lg:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
              <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
              <SelectItem value="REJECTED">Đã từ chối</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filterReason}
            onValueChange={(value) => {
              setFilterReason(value as FieldReportReason | "all")
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full lg:w-64">
              <SelectValue placeholder="Lý do" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả lý do</SelectItem>
              <SelectItem value="WRONG_INFO">
                Thông tin không chính xác
              </SelectItem>
              <SelectItem value="FAKE_IMAGE">
                Hình ảnh không đúng thực tế
              </SelectItem>
              <SelectItem value="FIELD_CLOSED">Sân đã đóng cửa</SelectItem>
              <SelectItem value="BAD_QUALITY">
                Chất lượng sân không tốt
              </SelectItem>
              <SelectItem value="OWNER_ATTITUDE">
                Chủ sân xử lý không tốt
              </SelectItem>
              <SelectItem value="OTHER">Lý do khác</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1280px] table-fixed">
              <colgroup>
                <col className="w-[210px]" />
                <col className="w-[190px]" />
                <col className="w-[210px]" />
                <col className="w-[260px]" />
                <col className="w-[80px]" />
                <col className="w-[110px]" />
                <col className="w-[130px]" />
                <col className="w-[290px]" />
              </colgroup>

              <thead className="border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Sân bị báo cáo
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Người báo cáo
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Lý do
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Mô tả
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Ảnh
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Ngày gửi
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Trạng thái
                  </th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Hành động
                  </th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Đang tải báo cáo sân...
                    </td>
                  </tr>
                ) : filteredReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Không có báo cáo sân nào.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr
                      key={report.id}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-4 align-top">
                        {report.field ? (
                          <div className="max-w-[190px]">
                            <Link
                              href={`/field/${report.field.id}`}
                              className="block font-medium text-primary hover:underline line-clamp-2 break-words"
                            >
                              {report.field.field_name}
                            </Link>

                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                              {report.field.address ||
                                "Chưa cập nhật địa chỉ"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            Không có dữ liệu sân
                          </span>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <div className="max-w-[170px]">
                          <p className="font-medium text-foreground truncate">
                            {report.reporter?.name || "Người dùng"}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {report.reporter?.email || "Không có email"}
                          </p>
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <Badge
                          variant="outline"
                          className="max-w-[190px] truncate"
                        >
                          {REASON_LABELS[report.reason]}
                        </Badge>
                      </td>

                      <td className="p-4 align-top">
                        <p className="max-w-[240px] line-clamp-2 text-foreground">
                          {report.description || "Không có mô tả"}
                        </p>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1 text-muted-foreground whitespace-nowrap">
                          <ImageIcon className="h-4 w-4" />
                          <span>{report.attachments?.length ?? 0}</span>
                        </div>
                      </td>

                      <td className="p-4 align-top text-muted-foreground whitespace-nowrap">
                        {formatDate(report.created_at)}
                      </td>

                      <td className="p-4 align-top">
                        <Badge
                          variant={getStatusBadgeVariant(report.status)}
                          className="whitespace-nowrap"
                        >
                          {STATUS_LABELS[report.status]}
                        </Badge>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex justify-end gap-2 whitespace-nowrap">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>

                            <AlertDialogContent className="max-w-3xl">
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Chi tiết báo cáo sân #{report.id}
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Kiểm tra thông tin báo cáo trước khi xử lý.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="rounded-lg border border-border p-4">
                                    <h4 className="font-semibold mb-2">
                                      Thông tin sân
                                    </h4>
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">
                                        Tên sân:{" "}
                                      </span>
                                      {report.field?.field_name || "—"}
                                    </p>
                                    <p className="mt-1 text-sm">
                                      <span className="text-muted-foreground">
                                        Trạng thái sân:{" "}
                                      </span>
                                      {report.field?.status || "—"}
                                    </p>
                                    <p className="mt-1 text-sm">
                                      <span className="text-muted-foreground">
                                        Địa chỉ:{" "}
                                      </span>
                                      {report.field?.address || "—"}
                                    </p>
                                  </div>

                                  <div className="rounded-lg border border-border p-4">
                                    <h4 className="font-semibold mb-2">
                                      Người báo cáo
                                    </h4>
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">
                                        Tên:{" "}
                                      </span>
                                      {report.reporter?.name || "—"}
                                    </p>
                                    <p className="mt-1 text-sm">
                                      <span className="text-muted-foreground">
                                        Email:{" "}
                                      </span>
                                      {report.reporter?.email || "—"}
                                    </p>
                                    <p className="mt-1 text-sm">
                                      <span className="text-muted-foreground">
                                        SĐT:{" "}
                                      </span>
                                      {report.reporter?.phone || "—"}
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-lg border border-border p-4">
                                  <h4 className="font-semibold mb-2">
                                    Nội dung báo cáo
                                  </h4>
                                  <p className="text-sm">
                                    <span className="text-muted-foreground">
                                      Lý do:{" "}
                                    </span>
                                    {REASON_LABELS[report.reason]}
                                  </p>
                                  <p className="mt-2 text-sm whitespace-pre-line">
                                    {report.description || "Không có mô tả"}
                                  </p>
                                </div>

                                {report.booking && (
                                  <div className="rounded-lg border border-border p-4">
                                    <h4 className="font-semibold mb-2">
                                      Booking liên quan
                                    </h4>
                                    <p className="text-sm">
                                      <span className="text-muted-foreground">
                                        Mã booking:{" "}
                                      </span>
                                      #{report.booking.id}
                                    </p>
                                    <p className="mt-1 text-sm">
                                      <span className="text-muted-foreground">
                                        Trạng thái:{" "}
                                      </span>
                                      {report.booking.status}
                                    </p>
                                    <p className="mt-1 text-sm">
                                      <span className="text-muted-foreground">
                                        Thời gian:{" "}
                                      </span>
                                      {formatDate(
                                        report.booking.start_datetime
                                      )}
                                    </p>
                                  </div>
                                )}

                                <div className="rounded-lg border border-border p-4">
                                  <h4 className="font-semibold mb-3">
                                    Ảnh minh chứng
                                  </h4>

                                  {report.attachments.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                      {report.attachments.map((attachment) => (
                                        <a
                                          key={attachment.id}
                                          href={getImageUrl(
                                            attachment.image_url
                                          )}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="overflow-hidden rounded-lg border border-border"
                                        >
                                          <img
                                            src={getImageUrl(
                                              attachment.image_url
                                            )}
                                            alt={
                                              attachment.file_name ||
                                              "Ảnh minh chứng"
                                            }
                                            className="h-32 w-full object-cover"
                                          />
                                        </a>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-muted-foreground">
                                      Báo cáo này không có ảnh minh chứng.
                                    </p>
                                  )}
                                </div>
                              </div>

                              <AlertDialogFooter>
                                <AlertDialogCancel>Đóng</AlertDialogCancel>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          {report.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleUpdateStatus(report.id, "REVIEWING", {
                                  admin_note: "Admin đang kiểm tra báo cáo.",
                                })
                              }
                            >
                              Xem xét
                            </Button>
                          )}

                          {report.status !== "REJECTED" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isActionLoading}
                                >
                                  Từ chối
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Từ chối báo cáo này?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Báo cáo sẽ được đánh dấu là không đủ cơ sở
                                    hoặc không hợp lệ.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleUpdateStatus(report.id, "REJECTED", {
                                        admin_note:
                                          "Không đủ cơ sở xác minh báo cáo.",
                                      })
                                    }
                                  >
                                    Từ chối
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {report.status !== "RESOLVED" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" disabled={isActionLoading}>
                                  Xử lý
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Đánh dấu báo cáo đã xử lý?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Báo cáo sẽ chuyển sang trạng thái đã xử lý.
                                    Trạng thái sân chưa bị thay đổi.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleUpdateStatus(report.id, "RESOLVED", {
                                        admin_note:
                                          "Admin đã kiểm tra và xử lý báo cáo.",
                                      })
                                    }
                                  >
                                    Đã xử lý
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {report.status !== "RESOLVED" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  disabled={isActionLoading}
                                >
                                  <ShieldAlert className="mr-1 h-4 w-4" />
                                  Ẩn sân
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Xử lý báo cáo và ẩn sân?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Báo cáo sẽ được đánh dấu đã xử lý và sân bị
                                    báo cáo sẽ chuyển sang trạng thái ẩn.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleUpdateStatus(report.id, "RESOLVED", {
                                        admin_note:
                                          "Đã kiểm tra và ẩn sân do báo cáo hợp lệ.",
                                        hide_field: true,
                                      })
                                    }
                                  >
                                    Xử lý và ẩn sân
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page) => {
                setCurrentPage(page)
                fetchReports(page)
              }}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalItems}
            />
          </div>
        </Card>
      </div>
    </main>
  )
}