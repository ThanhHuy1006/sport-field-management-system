"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowLeft,
  Star,
  Eye,
  Flag,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react"
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
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import {
  getAdminReviewReports,
  updateReviewReportStatus,
} from "@/features/review-reports/services/admin-review-reports"
import type {
  ReviewReport,
  ReviewReportReason,
  ReviewReportStatus,
} from "@/types/review-report"

type ReviewReportUi = {
  reportId: number
  reviewId: number
  fieldName: string
  fieldId: number
  author: string
  reporter: string
  rating: number
  text: string
  reportDescription: string
  reason: ReviewReportReason
  status: ReviewReportStatus
  date: string
  reviewVisible: boolean
}

const REASON_LABELS: Record<ReviewReportReason, string> = {
  SPAM: "Spam / quảng cáo",
  OFFENSIVE_LANGUAGE: "Ngôn từ xúc phạm",
  FAKE_REVIEW: "Đánh giá giả mạo",
  IRRELEVANT: "Nội dung không liên quan",
  HARASSMENT: "Quấy rối / công kích cá nhân",
  OTHER: "Lý do khác",
}

const STATUS_LABELS: Record<ReviewReportStatus, string> = {
  PENDING: "Chờ xử lý",
  REVIEWING: "Đang xem xét",
  RESOLVED: "Đã xử lý",
  REJECTED: "Đã bỏ qua",
}

function formatDate(value: string | null | undefined) {
  if (!value) return ""

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleDateString("vi-VN")
}

function getStatusBadgeVariant(
  status: ReviewReportStatus,
): "default" | "secondary" | "destructive" | "outline" {
  if (status === "PENDING") return "destructive"
  if (status === "REVIEWING") return "secondary"
  if (status === "RESOLVED") return "default"

  return "outline"
}

function mapReviewReportToUi(item: ReviewReport): ReviewReportUi {
  return {
    reportId: item.id,
    reviewId: item.review?.id ?? item.review_id,
    fieldName: item.review?.field?.field_name ?? "Không có dữ liệu sân",
    fieldId: item.review?.field?.id ?? 0,
    author: item.review?.user?.name ?? "Người dùng",
    reporter: item.reporter?.name ?? "Người báo cáo",
    rating: item.review?.rating ?? item.review_rating_snapshot ?? 0,
    text:
      item.review?.comment ??
      item.review_comment_snapshot ??
      "Không có nội dung đánh giá",
    reportDescription: item.description || "Không có mô tả báo cáo",
    reason: item.reason,
    status: item.status,
    date: formatDate(item.created_at),
    reviewVisible: item.review?.visible ?? true,
  }
}

export default function AdminReviewsPage() {
  const [reports, setReports] = useState<ReviewReportUi[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<ReviewReportStatus | "all">(
    "all",
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)

  const { toast } = useToast()

  const itemsPerPage = 15

  async function fetchReviewReports() {
    try {
      setIsLoading(true)

      const response = await getAdminReviewReports({
        page: 1,
        limit: 100,
      })

      setReports(response.data.items.map(mapReviewReportToUi))
    } catch (error) {
      toast({
        title: "Không thể tải báo cáo đánh giá",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReviewReports()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const keyword = searchTerm.trim().toLowerCase()

      if (
        keyword &&
        !report.fieldName.toLowerCase().includes(keyword) &&
        !report.author.toLowerCase().includes(keyword) &&
        !report.reporter.toLowerCase().includes(keyword) &&
        !report.text.toLowerCase().includes(keyword)
      ) {
        return false
      }

      if (filterStatus !== "all" && report.status !== filterStatus) {
        return false
      }

      return true
    })
  }, [reports, searchTerm, filterStatus])

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  )

  const pendingCount = reports.filter((r) => r.status === "PENDING").length
  const reviewingCount = reports.filter((r) => r.status === "REVIEWING").length
  const resolvedCount = reports.filter((r) => r.status === "RESOLVED").length
  const rejectedCount = reports.filter((r) => r.status === "REJECTED").length

  const averageRating =
    reports.length > 0
      ? (
          reports.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          reports.length
        ).toFixed(1)
      : "0.0"

  async function handleUpdateReportStatus(
    reportId: number,
    status: ReviewReportStatus,
    adminNote: string,
    hideReview = false,
  ) {
    try {
      setIsActionLoading(true)

      await updateReviewReportStatus(reportId, {
        status,
        admin_note: adminNote,
        hide_review: hideReview,
      })

      toast({
        title: "Cập nhật thành công",
        description: "Trạng thái báo cáo đánh giá đã được cập nhật.",
      })

      await fetchReviewReports()
    } catch (error) {
      toast({
        title: "Cập nhật thất bại",
        description:
          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
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

          <h1 className="text-xl font-bold">Báo cáo đánh giá</h1>

          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {pendingCount > 0 && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-800 dark:text-red-200">
                Có {pendingCount} báo cáo đánh giá đang chờ Admin xem xét
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
            <p className="text-3xl font-bold text-foreground">
              {reports.length}
            </p>
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
              Đã bỏ qua
            </h3>
            <p className="text-3xl font-bold text-muted-foreground">
              {rejectedCount}
            </p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 md:col-span-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">
              Đánh giá TB
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">
                {averageRating}
              </p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm theo sân, người đánh giá, người báo cáo hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96"
          />

          <Select
            value={filterStatus}
            onValueChange={(value) => {
              setFilterStatus(value as ReviewReportStatus | "all")
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ xử lý</SelectItem>
              <SelectItem value="REVIEWING">Đang xem xét</SelectItem>
              <SelectItem value="RESOLVED">Đã xử lý</SelectItem>
              <SelectItem value="REJECTED">Đã bỏ qua</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1600px] table-fixed">
              <colgroup>
                <col className="w-[220px]" />
                <col className="w-[200px]" />
                <col className="w-[140px]" />
                <col className="w-[360px]" />
                <col className="w-[210px]" />
                <col className="w-[130px]" />
                <col className="w-[150px]" />
                <col className="w-[390px]" />
              </colgroup>

              <thead className="border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Sân
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Người đánh giá
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Đánh giá
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Nội dung
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Lý do báo cáo
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                    Ngày báo cáo
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
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải báo cáo đánh giá...
                      </div>
                    </td>
                  </tr>
                ) : paginatedReports.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="p-8 text-center text-muted-foreground"
                    >
                      Không tìm thấy báo cáo đánh giá nào
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map((report) => (
                    <tr
                      key={report.reportId}
                      className="border-b border-border hover:bg-muted/50"
                    >
                      <td className="p-4 align-top">
                        {report.fieldId ? (
                          <div className="max-w-[190px]">
                            <Link
                              href={`/field/${report.fieldId}`}
                              className="block text-primary hover:underline line-clamp-2 break-words"
                            >
                              {report.fieldName}
                            </Link>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">
                            {report.fieldName}
                          </span>
                        )}
                      </td>

                      <td className="p-4 align-top">
                        <p className="max-w-[180px] truncate font-medium text-foreground">
                          {report.author}
                        </p>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex items-center gap-1 whitespace-nowrap">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < report.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </td>

                      <td className="p-4 align-top">
                        <p className="max-w-[330px] line-clamp-2 text-foreground">
                          {report.text}
                        </p>
                        <p className="mt-1 max-w-[330px] truncate text-xs text-muted-foreground">
                          Người báo cáo: {report.reporter}
                        </p>
                      </td>

                      <td className="p-4 align-top">
                        <Badge
                          variant="outline"
                          className="max-w-[190px] truncate"
                        >
                          {REASON_LABELS[report.reason]}
                        </Badge>
                      </td>

                      <td className="p-4 align-top text-muted-foreground whitespace-nowrap">
                        {report.date}
                      </td>

                      <td className="p-4 align-top">
                        <Badge
                          variant={getStatusBadgeVariant(report.status)}
                          className="flex w-fit items-center gap-1 whitespace-nowrap"
                        >
                          <Flag className="w-3 h-3" />
                          {STATUS_LABELS[report.status]}
                        </Badge>
                      </td>

                      <td className="p-4 align-top">
                        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/field/${report.fieldId}/reviews`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>

                          {report.status === "PENDING" && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={isActionLoading}
                              onClick={() =>
                                handleUpdateReportStatus(
                                  report.reportId,
                                  "REVIEWING",
                                  "Admin đang xem xét báo cáo đánh giá.",
                                  false,
                                )
                              }
                            >
                              Xem xét
                            </Button>
                          )}

                          {report.status !== "REJECTED" &&
                            report.status !== "RESOLVED" && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isActionLoading}
                                  >
                                    <XCircle className="w-4 h-4 mr-1" />
                                    Bỏ qua
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Bỏ qua báo cáo này?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Báo cáo sẽ được đánh dấu là không đủ cơ sở
                                      hoặc không vi phạm. Review vẫn tiếp tục
                                      hiển thị công khai.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleUpdateReportStatus(
                                          report.reportId,
                                          "REJECTED",
                                          "Review không vi phạm chính sách, báo cáo không đủ cơ sở.",
                                          false,
                                        )
                                      }
                                    >
                                      Bỏ qua báo cáo
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                          {report.status !== "RESOLVED" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={isActionLoading}
                                >
                                  <CheckCircle2 className="w-4 h-4 mr-1" />
                                  Đã xử lý
                                </Button>
                              </AlertDialogTrigger>

                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Đánh dấu báo cáo đã xử lý?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Báo cáo sẽ được đánh dấu đã xử lý. Review
                                    vẫn tiếp tục hiển thị công khai.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>

                                <AlertDialogFooter>
                                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() =>
                                      handleUpdateReportStatus(
                                        report.reportId,
                                        "RESOLVED",
                                        "Admin đã kiểm tra và xử lý báo cáo. Review chưa cần ẩn.",
                                        false,
                                      )
                                    }
                                  >
                                    Đã xử lý
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          {report.status !== "RESOLVED" &&
                            report.reviewVisible && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    disabled={isActionLoading}
                                  >
                                    <ShieldAlert className="w-4 h-4 mr-1" />
                                    Ẩn review
                                  </Button>
                                </AlertDialogTrigger>

                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>
                                      Ẩn review này?
                                    </AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Báo cáo sẽ được đánh dấu đã xử lý và
                                      review sẽ bị ẩn khỏi trang public.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>

                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Hủy</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() =>
                                        handleUpdateReportStatus(
                                          report.reportId,
                                          "RESOLVED",
                                          "Review có nội dung vi phạm, đã ẩn khỏi hệ thống.",
                                          true,
                                        )
                                      }
                                    >
                                      Ẩn review
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
        </Card>

        {filteredReports.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredReports.length}
            />
          </div>
        )}
      </div>
    </main>
  )
}