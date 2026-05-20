"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiGet } from "@/lib/api-client"
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  Building2,
  Calendar,
  ClipboardCheck,
  Download,
  DollarSign,
  FileWarning,
  MapPin,
  Printer,
  Star,
  TrendingUp,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

type AdminReportRange = "7days" | "30days" | "3months" | "year"

type RevenuePoint = {
  label: string
  booking_value?: number
  bookingValue?: number
  revenue?: number
  bookings: number
}

type UserGrowthPoint = {
  label: string
  new_users?: number
  newUsers?: number
  total_users?: number
  totalUsers?: number
}

type TopField = {
  field_id?: number
  field_name?: string
  name?: string
  owner_name?: string
  owner?: string
  bookings: number
  booking_value?: number
  bookingValue?: number
  revenue?: number
  avg_rating?: number
  rating?: number
}

type TopOwner = {
  owner_id?: number
  owner_name?: string
  name?: string
  fields: number
  bookings: number
  booking_value?: number
  bookingValue?: number
  revenue?: number
}

type BookingStatusItem = {
  label: string
  count: number
  description?: string
}

type FieldStatusItem = {
  label: string
  count: number
}

type AdminReportsData = {
  summary: {
    total_booking_value?: number
    totalBookingValue?: number
    total_revenue?: number
    totalRevenue?: number
    total_bookings?: number
    totalBookings?: number
    total_users?: number
    totalUsers?: number
    total_owners?: number
    totalOwners?: number
    total_fields?: number
    totalFields?: number
    pending_fields?: number
    pendingFields?: number
    pending_reports?: number
    pendingReports?: number
    avg_rating?: number
    avgRating?: number
  }
  revenue_series: RevenuePoint[]
  user_growth: UserGrowthPoint[]
  top_fields: TopField[]
  top_owners: TopOwner[]
  booking_status: BookingStatusItem[]
  field_status: FieldStatusItem[]
}

type AdminReportsResponse = {
  success: boolean
  message: string
  data: AdminReportsData
}

function createEmptyReports(): AdminReportsData {
  return {
    summary: {
      total_booking_value: 0,
      total_bookings: 0,
      total_users: 0,
      total_owners: 0,
      total_fields: 0,
      pending_fields: 0,
      pending_reports: 0,
      avg_rating: 0,
    },
    revenue_series: [],
    user_growth: [],
    top_fields: [],
    top_owners: [],
    booking_status: [],
    field_status: [],
  }
}

async function getAdminReports(range: AdminReportRange) {
  const params = new URLSearchParams({ range })

  const result = await apiGet<AdminReportsResponse>(`/admin/reports?${params.toString()}`)

  if (!result?.data) {
    throw new Error("API không trả về dữ liệu thống kê admin")
  }

  return result.data
}

function toNumber(value: unknown) {
  const numberValue = Number(value ?? 0)
  return Number.isFinite(numberValue) ? numberValue : 0
}

function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value)) return "0"
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`
  return value.toString()
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value)
}

function getRangeLabel(range: AdminReportRange) {
  switch (range) {
    case "7days":
      return "7 ngày qua"
    case "30days":
      return "30 ngày qua"
    case "3months":
      return "3 tháng qua"
    case "year":
      return "Năm nay"
    default:
      return "Năm nay"
  }
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string
  value: string
  description: string
  icon: LucideIcon
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-[260px] items-center justify-center rounded-lg border border-dashed border-border text-sm text-muted-foreground">
      {message}
    </div>
  )
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<AdminReportRange>("year")
  const [reports, setReports] = useState<AdminReportsData>(() => createEmptyReports())
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchReports() {
      try {
        setIsLoading(true)
        setError("")

        const data = await getAdminReports(dateRange)

        if (cancelled) return
        setReports(data)
      } catch (err) {
        if (cancelled) return

        setReports(createEmptyReports())
        setError(err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê admin")
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchReports()

    return () => {
      cancelled = true
    }
  }, [dateRange])

  const summary = reports.summary

  const totalBookingValue = toNumber(
    summary.total_booking_value ?? summary.totalBookingValue ?? summary.total_revenue ?? summary.totalRevenue,
  )
  const totalBookings = toNumber(summary.total_bookings ?? summary.totalBookings)
  const totalUsers = toNumber(summary.total_users ?? summary.totalUsers)
  const totalOwners = toNumber(summary.total_owners ?? summary.totalOwners)
  const totalFields = toNumber(summary.total_fields ?? summary.totalFields)
  const pendingFields = toNumber(summary.pending_fields ?? summary.pendingFields)
  const pendingReports = toNumber(summary.pending_reports ?? summary.pendingReports)
  const avgRating = toNumber(summary.avg_rating ?? summary.avgRating)

  const revenueData = useMemo(
    () =>
      reports.revenue_series.map((item) => ({
        label: item.label,
        bookingValue: toNumber(item.booking_value ?? item.bookingValue ?? item.revenue),
        bookings: toNumber(item.bookings),
      })),
    [reports.revenue_series],
  )

  const userGrowthData = useMemo(
    () =>
      reports.user_growth.map((item) => ({
        label: item.label,
        newUsers: toNumber(item.new_users ?? item.newUsers),
        totalUsers: toNumber(item.total_users ?? item.totalUsers),
      })),
    [reports.user_growth],
  )

  const topFields = useMemo(
    () =>
      reports.top_fields.map((field) => ({
        id: field.field_id ?? field.field_name ?? field.name,
        name: field.field_name ?? field.name ?? "Không rõ tên sân",
        owner: field.owner_name ?? field.owner ?? "Không rõ chủ sân",
        bookings: toNumber(field.bookings),
        bookingValue: toNumber(field.booking_value ?? field.bookingValue ?? field.revenue),
        rating: toNumber(field.avg_rating ?? field.rating),
      })),
    [reports.top_fields],
  )

  const topOwners = useMemo(
    () =>
      reports.top_owners.map((owner) => ({
        id: owner.owner_id ?? owner.owner_name ?? owner.name,
        name: owner.owner_name ?? owner.name ?? "Không rõ chủ sân",
        fields: toNumber(owner.fields),
        bookings: toNumber(owner.bookings),
        bookingValue: toNumber(owner.booking_value ?? owner.bookingValue ?? owner.revenue),
      })),
    [reports.top_owners],
  )

  const handlePrint = () => {
    window.print()
  }

  const handleExportCsv = () => {
    const rows = [
      ["Báo cáo", "Thống kê hệ thống"],
      ["Khoảng thời gian", getRangeLabel(dateRange)],
      [],
      ["Chỉ số", "Giá trị"],
      ["Tổng giá trị đặt sân", totalBookingValue],
      ["Tổng lượt đặt", totalBookings],
      ["Tổng người dùng", totalUsers],
      ["Tổng chủ sân", totalOwners],
      ["Tổng sân", totalFields],
      ["Sân chờ duyệt", pendingFields],
      ["Báo cáo chờ xử lý", pendingReports],
      ["Đánh giá trung bình", avgRating],
      [],
      ["Mốc thời gian", "Giá trị đặt sân", "Lượt đặt"],
      ...revenueData.map((item) => [item.label, item.bookingValue, item.bookings]),
      [],
      ["Top sân", "Chủ sân", "Lượt đặt", "Giá trị đặt sân", "Đánh giá"],
      ...topFields.map((field) => [field.name, field.owner, field.bookings, field.bookingValue, field.rating]),
    ]

    const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `admin-reports-${dateRange}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <Link href="/admin/dashboard" className="inline-flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-5 w-5" />
            <span>Quay lại</span>
          </Link>

          <div className="mt-3">
            <h1 className="text-xl font-bold sm:text-2xl">Thống kê hệ thống</h1>
            <p className="text-sm text-muted-foreground">
              Dữ liệu được lấy từ API admin report, không dùng số mẫu hard-code trên giao diện.
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <Select value={dateRange} onValueChange={(value) => setDateRange(value as AdminReportRange)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Chọn thời gian" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">7 ngày qua</SelectItem>
                <SelectItem value="30days">30 ngày qua</SelectItem>
                <SelectItem value="3months">3 tháng qua</SelectItem>
                <SelectItem value="year">Năm nay</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              In / PDF
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/30 bg-destructive/10">
            <CardContent className="p-4 text-sm text-destructive">
              {error}. Nếu backend chưa có endpoint này, trang sẽ không hiển thị số ảo.
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">Đang tải dữ liệu thống kê...</CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                title="Giá trị đặt sân"
                value={`${formatCompactCurrency(totalBookingValue)} VND`}
                description="Tổng giá trị booking toàn hệ thống"
                icon={DollarSign}
              />
              <KpiCard
                title="Lượt đặt sân"
                value={totalBookings.toLocaleString("vi-VN")}
                description="Tổng số đơn đặt sân"
                icon={ClipboardCheck}
              />
              <KpiCard
                title="Người dùng"
                value={totalUsers.toLocaleString("vi-VN")}
                description="Tổng tài khoản khách hàng"
                icon={Users}
              />
              <KpiCard
                title="Chủ sân"
                value={totalOwners.toLocaleString("vi-VN")}
                description="Tổng tài khoản owner"
                icon={Building2}
              />
              <KpiCard
                title="Tổng số sân"
                value={totalFields.toLocaleString("vi-VN")}
                description="Sân đã đăng ký trên hệ thống"
                icon={MapPin}
              />
              <KpiCard
                title="Sân chờ duyệt"
                value={pendingFields.toLocaleString("vi-VN")}
                description="Cần admin xem xét"
                icon={AlertTriangle}
              />
              <KpiCard
                title="Báo cáo chờ xử lý"
                value={pendingReports.toLocaleString("vi-VN")}
                description="Báo cáo sân/đánh giá cần xử lý"
                icon={FileWarning}
              />
              <KpiCard
                title="Đánh giá TB"
                value={avgRating.toFixed(1)}
                description="Điểm đánh giá trung bình toàn hệ thống"
                icon={Star}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-primary" />
                    Giá trị đặt sân theo thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueData.length === 0 ? (
                    <EmptyState message="Chưa có dữ liệu giá trị đặt sân" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="bookingValueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="currentColor" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => [`${formatCurrency(value)} VND`, "Giá trị đặt sân"]}
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Area
                          type="monotone"
                          dataKey="bookingValue"
                          stroke="currentColor"
                          fillOpacity={1}
                          fill="url(#bookingValueGradient)"
                          className="text-primary"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="h-5 w-5 text-primary" />
                    Tăng trưởng người dùng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userGrowthData.length === 0 ? (
                    <EmptyState message="Chưa có dữ liệu tăng trưởng người dùng" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={userGrowthData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis className="text-xs" />
                        <Tooltip
                          formatter={(value: number) => [value.toLocaleString("vi-VN"), "Người dùng mới"]}
                          contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                        />
                        <Bar dataKey="newUsers" fill="currentColor" radius={[4, 4, 0, 0]} className="text-primary" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 5 sân được đặt nhiều nhất</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topFields.length === 0 ? (
                    <EmptyState message="Chưa có dữ liệu top sân" />
                  ) : (
                    topFields.map((field, index) => (
                      <div key={String(field.id)} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{field.name}</p>
                          <p className="text-sm text-muted-foreground">{field.owner}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{field.bookings} đặt</p>
                          <p className="text-sm text-muted-foreground">{formatCompactCurrency(field.bookingValue)} VND</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 5 chủ sân hoạt động tốt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topOwners.length === 0 ? (
                    <EmptyState message="Chưa có dữ liệu top chủ sân" />
                  ) : (
                    topOwners.map((owner, index) => (
                      <div key={String(owner.id)} className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">{owner.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {owner.fields} sân • {owner.bookings} lượt đặt
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{formatCompactCurrency(owner.bookingValue)}</p>
                          <p className="text-sm text-muted-foreground">VND</p>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Trạng thái đơn đặt sân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.booking_status.length === 0 ? (
                    <EmptyState message="Chưa có dữ liệu trạng thái đơn" />
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {reports.booking_status.map((item) => (
                        <div key={item.label} className="rounded-lg border border-border p-4">
                          <p className="text-2xl font-bold">{toNumber(item.count).toLocaleString("vi-VN")}</p>
                          <p className="font-medium">{item.label}</p>
                          <p className="mt-1 text-xs text-muted-foreground">{item.description ?? ""}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-primary" />
                    Trạng thái sân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {reports.field_status.length === 0 ? (
                    <EmptyState message="Chưa có dữ liệu trạng thái sân" />
                  ) : (
                    <div className="space-y-4">
                      {reports.field_status.map((item) => (
                        <div key={item.label} className="flex items-center justify-between rounded-lg border border-border p-4">
                          <span className="font-medium">{item.label}</span>
                          <span className="text-2xl font-bold">{toNumber(item.count)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  )
}
