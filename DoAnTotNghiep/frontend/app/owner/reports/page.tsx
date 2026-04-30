"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Users,
  Calendar,
  Star,
  ArrowUpRight,
  FileText,
  BarChart3,
  Activity,
  Clock,
  MapPin,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts"
import {
  getOwnerReports,
  type OwnerReportsData,
  type OwnerReportRange,
} from "@/features/reports/services/owner-reports"

const PIE_COLORS = [
  "#16a34a",
  "#22c55e",
  "#2563eb",
  "#9333ea",
  "#f97316",
  "#0ea5e9",
  "#e11d48",
]

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "0"
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

const formatFullCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "0 VND"
  return `${value.toLocaleString("vi-VN")} VND`
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{
    name?: string
    value?: number | string
    color?: string
  }>
  label?: string
}) {
  if (!active || !payload || payload.length === 0) return null

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-lg text-sm">
      {label && <p className="font-semibold mb-1">{label}</p>}

      {payload.map((item, index) => {
        const name =
          item.name === "bookings"
            ? "Lượt đặt"
            : item.name === "revenue"
              ? "Doanh thu"
              : item.name === "value"
                ? "Lượt đặt"
                : item.name || "Giá trị"

        const value =
          item.name === "revenue"
            ? formatFullCurrency(Number(item.value || 0))
            : item.value

        return (
          <div
            key={index}
            className="flex items-center justify-between gap-4"
          >
            <span className="text-muted-foreground">{name}</span>
            <span className="font-medium">{value}</span>
          </div>
        )
      })}
    </div>
  )
}

const chartTooltipProps = {
  content: <ChartTooltip />,
  cursor: { fill: "hsl(var(--muted))", opacity: 0.25 },
  wrapperStyle: { zIndex: 50, pointerEvents: "none" as const },
}

const formatDateTime = (value: string | null) => {
  if (!value) return "Chưa có"
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) return "Chưa có"

  return date.toLocaleDateString("vi-VN")
}

const getRangeLabel = (range: string) => {
  switch (range) {
    case "today":
      return "Hôm nay"
    case "7d":
      return "7 ngày qua"
    case "30d":
      return "30 ngày qua"
    case "month":
      return "Tháng này"
    case "year":
      return "Năm nay"
    default:
      return "Tháng này"
  }
}

const createEmptyReports = (): OwnerReportsData => ({
  range: {
    key: "month",
    from: "",
    to: "",
  },
  filters: {
    field_id: null,
  },
  summary: {
    total_revenue: 0,
    total_bookings: 0,
    revenue_bookings: 0,
    total_customers: 0,
    avg_rating: 0,
    voucher_discount_total: 0,
    revenue_growth_percent: 0,
    booking_growth_percent: 0,
  },
  revenue_series: [],
  booking_status: [],
  bookings_by_field: [],
  bookings_by_time: [],
  bookings_by_day: [],
  field_performance: [],
  top_customers: [],
  payment_methods: [],
  voucher_impact: {
    original_revenue: 0,
    final_revenue: 0,
    discount_total: 0,
    voucher_booking_count: 0,
    voucher_usage_rate: 0,
  },
})

export default function OwnerReportsPage() {
  const [dateRange, setDateRange] = useState<OwnerReportRange>("month")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedField, setSelectedField] = useState("all")
  const [reports, setReports] = useState<OwnerReportsData>(() =>
    createEmptyReports(),
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchReports() {
      try {
        setIsLoading(true)
        setError("")

        const result = await getOwnerReports({
          range: dateRange,
          field_id: selectedField === "all" ? "all" : Number(selectedField),
        })

        if (cancelled) return

        setReports(result.data)
      } catch (err) {
        if (cancelled) return
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu báo cáo",
        )
        setReports(createEmptyReports())
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchReports()

    return () => {
      cancelled = true
    }
  }, [dateRange, selectedField])

  const revenueData = reports.revenue_series.map((item) => ({
    month: item.label,
    revenue: Number(item.revenue || 0),
    bookings: Number(item.bookings || 0),
  }))

  const bookingsByField = reports.bookings_by_field.map((item, index) => ({
    ...item,
    color: PIE_COLORS[index % PIE_COLORS.length],
  }))

  const bookingsByTime = reports.bookings_by_time
  const bookingsByDay = reports.bookings_by_day

  const fieldPerformance = reports.field_performance.map((item) => ({
    id: item.field_id,
    name: item.field_name,
    bookings: item.bookings,
    revenue: item.revenue,
    rating: item.avg_rating,
    occupancy:
      item.bookings > 0
        ? Math.min(
            100,
            Math.round(
              (item.bookings / Math.max(reports.summary.total_bookings, 1)) *
                100,
            ),
          )
        : 0,
  }))

  const topCustomers = reports.top_customers.map((item) => ({
    name: item.name,
    bookings: item.bookings,
    totalSpent: item.total_spent,
    lastVisit: formatDateTime(item.last_booking_at),
  }))

  const totalRevenue = reports.summary.total_revenue
  const totalBookings = reports.summary.total_bookings
  const totalCustomers = reports.summary.total_customers
  const avgRating = reports.summary.avg_rating
  const revenueGrowth = reports.summary.revenue_growth_percent
  const bookingGrowth = reports.summary.booking_growth_percent

  const highestRevenueItem = useMemo(() => {
    if (revenueData.length === 0) return null
    return revenueData.reduce((max, item) =>
      item.revenue > max.revenue ? item : max,
    )
  }, [revenueData])

  const lowestRevenueItem = useMemo(() => {
    if (revenueData.length === 0) return null
    return revenueData.reduce((min, item) =>
      item.revenue < min.revenue ? item : min,
    )
  }, [revenueData])

  const averageRevenue = revenueData.length > 0 ? totalRevenue / revenueData.length : 0

  const peakHour = useMemo(() => {
    if (bookingsByTime.length === 0) return null
    return bookingsByTime.reduce((max, item) =>
      item.bookings > max.bookings ? item : max,
    )
  }, [bookingsByTime])

  const peakDay = useMemo(() => {
    if (bookingsByDay.length === 0) return null
    return bookingsByDay.reduce((max, item) =>
      item.bookings > max.bookings ? item : max,
    )
  }, [bookingsByDay])

  const averageSpentPerCustomer =
    totalCustomers > 0 ? totalRevenue / totalCustomers : 0
  const averageBookingsPerCustomer =
    totalCustomers > 0 ? totalBookings / totalCustomers : 0

  const handlePrint = () => {
    window.print()
  }

  const handleExportCsv = () => {
    const rows = [
      ["Tên sân", "Lượt đặt", "Doanh thu", "Đánh giá", "Số review"],
      ...reports.field_performance.map((field) => [
        field.field_name,
        String(field.bookings),
        String(field.revenue),
        String(field.avg_rating),
        String(field.review_count),
      ]),
    ]

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n")

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.href = url
    link.download = `owner-reports-${dateRange}.csv`
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/owner/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
          <h1 className="text-xl font-bold">Báo Cáo & Thống Kê</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <Select
                value={dateRange}
                onValueChange={(value) =>
                  setDateRange(value as OwnerReportRange)
                }
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hôm nay</SelectItem>
                  <SelectItem value="7d">7 ngày qua</SelectItem>
                  <SelectItem value="30d">30 ngày qua</SelectItem>
                  <SelectItem value="month">Tháng này</SelectItem>
                  <SelectItem value="year">Năm nay</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-muted-foreground" />
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả sân</SelectItem>
                  {reports.field_performance.map((field) => (
                    <SelectItem
                      key={field.field_id}
                      value={String(field.field_id)}
                    >
                      {field.field_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Badge variant="outline" className="h-9">
              {getRangeLabel(dateRange)}
            </Badge>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <BarChart3 className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20">
            <CardContent className="p-4 text-sm text-red-600">
              {error}
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              Đang tải dữ liệu báo cáo...
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20"
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {revenueGrowth >= 0 ? "+" : ""}
                      {revenueGrowth}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-3">
                    {formatCurrency(totalRevenue)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tổng doanh thu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-blue-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20"
                    >
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                      {bookingGrowth >= 0 ? "+" : ""}
                      {bookingGrowth}%
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-3">{totalBookings}</p>
                  <p className="text-sm text-muted-foreground">
                    Tổng đặt sân
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-purple-600 border-purple-200 bg-purple-50 dark:bg-purple-900/20"
                    >
                      {reports.voucher_impact.voucher_usage_rate}% dùng voucher
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-3">{totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                      <Star className="w-5 h-5 text-yellow-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="text-yellow-600 border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20"
                    >
                      {reports.field_performance.reduce(
                        (sum, field) => sum + field.review_count,
                        0,
                      )}{" "}
                      review
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold mt-3">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Đánh giá TB</p>
                </CardContent>
              </Card>
            </div>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-6"
            >
              <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
                <TabsTrigger value="overview" className="text-xs sm:text-sm">
                  <Activity className="w-4 h-4 mr-1 hidden sm:inline" />
                  Tổng quan
                </TabsTrigger>
                <TabsTrigger value="revenue" className="text-xs sm:text-sm">
                  <DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />
                  Doanh thu
                </TabsTrigger>
                <TabsTrigger value="bookings" className="text-xs sm:text-sm">
                  <Calendar className="w-4 h-4 mr-1 hidden sm:inline" />
                  Đặt sân
                </TabsTrigger>
                <TabsTrigger value="customers" className="text-xs sm:text-sm">
                  <Users className="w-4 h-4 mr-1 hidden sm:inline" />
                  Khách hàng
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        Doanh thu theo thời gian
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={revenueData}>
                          <defs>
                            <linearGradient
                              id="colorRevenue"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor="#16a34a"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="#16a34a"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis
                            tickFormatter={(value) =>
                              formatCurrency(Number(value))
                            }
                            className="text-xs"
                          />
                          <Tooltip {...chartTooltipProps} />
                          <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#16a34a"
                            fillOpacity={1}
                            fill="url(#colorRevenue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        Đặt sân theo từng sân
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {bookingsByField.length === 0 ? (
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                          Chưa có dữ liệu đặt sân
                        </div>
                      ) : (
                        <ResponsiveContainer width="100%" height={300}>
                          <RechartsPieChart>
                            <Pie
                              data={bookingsByField}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                              label={({ name, percent }) =>
                                `${name} ${((percent || 0) * 100).toFixed(0)}%`
                              }
                            >
                              {bookingsByField.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color}
                                />
                              ))}
                            </Pie>
                            <Tooltip {...chartTooltipProps} />
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Hiệu suất từng sân
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="text-left py-3 px-2 font-medium text-muted-foreground">
                              Tên sân
                            </th>
                            <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                              Lượt đặt
                            </th>
                            <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                              Doanh thu
                            </th>
                            <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                              Đánh giá
                            </th>
                            <th className="text-right py-3 px-2 font-medium text-muted-foreground">
                              Tỷ trọng
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {fieldPerformance.length === 0 ? (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-6 text-center text-muted-foreground"
                              >
                                Chưa có dữ liệu sân
                              </td>
                            </tr>
                          ) : (
                            fieldPerformance.map((field) => (
                              <tr
                                key={field.id}
                                className="border-b border-border/50 hover:bg-muted/50"
                              >
                                <td className="py-3 px-2 font-medium">
                                  {field.name}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  {field.bookings}
                                </td>
                                <td className="py-3 px-2 text-right text-green-600 font-medium">
                                  {formatCurrency(field.revenue)}
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <span className="flex items-center justify-end gap-1">
                                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                    {field.rating.toFixed(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-2 text-right">
                                  <Badge
                                    variant={
                                      field.occupancy >= 70
                                        ? "default"
                                        : "secondary"
                                    }
                                  >
                                    {field.occupancy}%
                                  </Badge>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="revenue" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Doanh thu & số lượng đặt sân theo thời gian
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={400}>
                      <LineChart data={revenueData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="month" />
                        <YAxis
                          yAxisId="left"
                          tickFormatter={(value) =>
                            formatCurrency(Number(value))
                          }
                        />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip {...chartTooltipProps} />
                        <Legend
                          formatter={(value) =>
                            value === "revenue"
                              ? "Doanh thu"
                              : "Số đặt sân"
                          }
                        />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="revenue"
                          stroke="#16a34a"
                          strokeWidth={2}
                          dot={{ fill: "#16a34a" }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="bookings"
                          stroke="#2563eb"
                          strokeWidth={2}
                          dot={{ fill: "#2563eb" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Doanh thu theo ngày trong tuần
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingsByDay}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="day" />
                        <YAxis
                          tickFormatter={(value) =>
                            formatCurrency(Number(value))
                          }
                        />
                        <Tooltip {...chartTooltipProps} />
                        <Bar
                          dataKey="revenue"
                          fill="#16a34a"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Doanh thu cao nhất
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(highestRevenueItem?.revenue || 0)} VND
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {highestRevenueItem?.month || "Chưa có dữ liệu"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Doanh thu thấp nhất
                      </p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(lowestRevenueItem?.revenue || 0)} VND
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {lowestRevenueItem?.month || "Chưa có dữ liệu"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">
                        Doanh thu trung bình
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(averageRevenue)} VND
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Theo kỳ đang chọn
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-600" />
                        Đặt sân theo khung giờ
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bookingsByTime}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis dataKey="time" />
                          <YAxis allowDecimals={false} />
                          <Tooltip {...chartTooltipProps} />
                          <Bar
                            dataKey="bookings"
                            fill="#2563eb"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        Đặt sân theo ngày trong tuần
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={bookingsByDay}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            className="stroke-muted"
                          />
                          <XAxis dataKey="day" />
                          <YAxis allowDecimals={false} />
                          <Tooltip {...chartTooltipProps} />
                          <Bar
                            dataKey="bookings"
                            fill="#9333ea"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Phân tích giờ cao điểm
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                        <p className="text-sm text-green-600 font-medium">
                          Giờ cao điểm nhất
                        </p>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-400">
                          {peakHour?.time || "--"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {peakHour?.bookings || 0} lượt đặt
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-600 font-medium">
                          Ngày đông nhất
                        </p>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                          {peakDay?.day || "--"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {peakDay?.bookings || 0} lượt đặt
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <p className="text-sm text-yellow-600 font-medium">
                          Booking có doanh thu
                        </p>
                        <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                          {reports.summary.revenue_bookings}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PAID / CHECKED_IN / COMPLETED
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="customers" className="space-y-6">
                <div className="grid lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Top khách hàng thân thiết
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {topCustomers.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          Chưa có dữ liệu khách hàng.
                        </p>
                      ) : (
                        topCustomers.map((customer, idx) => (
                          <div
                            key={`${customer.name}-${idx}`}
                            className="flex items-center gap-4"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">
                                {customer.name}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {customer.lastVisit}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">
                                {customer.bookings} lượt
                              </p>
                              <p className="text-sm text-green-600">
                                {formatCurrency(customer.totalSpent)}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">
                        Thống kê khách hàng
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">
                          Tổng khách hàng
                        </span>
                        <span className="font-bold text-green-600">
                          {totalCustomers}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">
                          Booking dùng voucher
                        </span>
                        <span className="font-bold text-blue-600">
                          {reports.voucher_impact.voucher_booking_count}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">
                          Giá trị đặt TB/khách
                        </span>
                        <span className="font-bold">
                          {formatCurrency(averageSpentPerCustomer)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                        <span className="text-muted-foreground">
                          Số lần đặt TB/khách
                        </span>
                        <span className="font-bold">
                          {averageBookingsPerCustomer.toFixed(1)} lần
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                        <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-green-700 dark:text-green-400">
                            Tăng trưởng doanh thu
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Doanh thu kỳ này{" "}
                            {revenueGrowth >= 0 ? "tăng" : "giảm"}{" "}
                            {Math.abs(revenueGrowth)}% so với kỳ trước.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                        <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-blue-700 dark:text-blue-400">
                            Khách hàng
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Có {totalCustomers} khách hàng phát sinh booking
                            trong kỳ đang chọn.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                        <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                        <div>
                          <p className="font-medium text-yellow-700 dark:text-yellow-400">
                            Đánh giá
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Điểm đánh giá trung bình hiện tại là{" "}
                            {avgRating.toFixed(1)} sao.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </main>
  )
}