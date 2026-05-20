"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowUpRight,
  BarChart3,
  Calendar,
  DollarSign,
  FileText,
  MapPin,
  Star,
  TrendingUp,
  Users,
} from "lucide-react";
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
} from "recharts";
import {
  getOwnerReports,
  type OwnerReportRange,
  type OwnerReportsData,
} from "@/features/reports/services/owner-reports";

const formatCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
};

const formatFullCurrency = (value: number) => {
  if (!Number.isFinite(value)) return "0 VND";
  return `${value.toLocaleString("vi-VN")} VND`;
};

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number | string;
  }>;
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
      {label && <p className="mb-1 font-semibold">{label}</p>}

      {payload.map((item, index) => {
        const name =
          item.name === "revenue"
            ? "Doanh thu"
            : item.name === "bookings"
              ? "Lượt đặt"
              : item.name || "Giá trị";

        const value =
          item.name === "revenue"
            ? formatFullCurrency(Number(item.value || 0))
            : item.value;

        return (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground">{name}</span>
            <span className="font-medium">{value}</span>
          </div>
        );
      })}
    </div>
  );
}

const chartTooltipProps = {
  content: <ChartTooltip />,
  cursor: { fill: "hsl(var(--muted))", opacity: 0.25 },
  wrapperStyle: { zIndex: 50, pointerEvents: "none" as const },
};

const getRangeLabel = (range: OwnerReportRange) => {
  switch (range) {
    case "today":
      return "Hôm nay";
    case "7d":
      return "7 ngày qua";
    case "30d":
      return "30 ngày qua";
    case "month":
      return "Tháng này";
    case "year":
      return "Năm nay";
    default:
      return "Tháng này";
  }
};

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
});

type FieldOption = {
  id: number;
  name: string;
};

export default function OwnerReportsPage() {
  const [dateRange, setDateRange] = useState<OwnerReportRange>("month");
  const [selectedField, setSelectedField] = useState("all");
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [reports, setReports] = useState<OwnerReportsData>(() =>
    createEmptyReports(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getOwnerReports({
          range: dateRange,
          field_id: selectedField === "all" ? "all" : Number(selectedField),
        });

        if (cancelled) return;

        setReports(result.data);
        setFieldOptions((previousOptions) => {
          const optionMap = new Map<number, FieldOption>();

          previousOptions.forEach((field) => {
            optionMap.set(field.id, field);
          });

          result.data.field_performance.forEach((field) => {
            optionMap.set(field.field_id, {
              id: field.field_id,
              name: field.field_name,
            });
          });

          return Array.from(optionMap.values());
        });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Không thể tải dữ liệu báo cáo",
        );
        setReports(createEmptyReports());
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [dateRange, selectedField]);

  const revenueData = useMemo(
    () =>
      reports.revenue_series.map((item) => ({
        label: item.label,
        revenue: Number(item.revenue || 0),
        bookings: Number(item.bookings || 0),
      })),
    [reports.revenue_series],
  );

  const bookingsByField = useMemo(
    () =>
      reports.bookings_by_field.map((item) => ({
        name: item.name,
        bookings: Number(item.value || 0),
      })),
    [reports.bookings_by_field],
  );

  const fieldPerformance = useMemo(
    () =>
      reports.field_performance.map((field) => ({
        id: field.field_id,
        name: field.field_name,
        bookings: Number(field.bookings || 0),
        revenue: Number(field.revenue || 0),
        rating: Number(field.avg_rating || 0),
        reviewCount: Number(field.review_count || 0),
      })),
    [reports.field_performance],
  );

  const totalReviewCount = fieldPerformance.reduce(
    (sum, field) => sum + field.reviewCount,
    0,
  );

  const totalRevenue = reports.summary.total_revenue;
  const totalBookings = reports.summary.total_bookings;
  const totalCustomers = reports.summary.total_customers;
  const avgRating = reports.summary.avg_rating;
  const revenueGrowth = reports.summary.revenue_growth_percent;
  const bookingGrowth = reports.summary.booking_growth_percent;

  const handlePrint = () => {
    window.print();
  };

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
    ];

    const csv = rows
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `owner-reports-${dateRange}-${selectedField}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link
            href="/owner/dashboard"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>

          <h1 className="text-xl font-bold">Thống kê hoạt động sân</h1>

          <div className="w-10" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
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
              <MapPin className="h-5 w-5 text-muted-foreground" />
              <Select value={selectedField} onValueChange={setSelectedField}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Chọn sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả sân</SelectItem>
                  {fieldOptions.map((field) => (
                    <SelectItem key={field.id} value={String(field.id)}>
                      {field.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* <Badge variant="outline" className="h-9">
              {getRangeLabel(dateRange)}
            </Badge> */}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <FileText className="mr-2 h-4 w-4" />
              In / PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCsv}>
              <BarChart3 className="mr-2 h-4 w-4" />
              CSV
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
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="border-green-200 bg-green-50 text-green-600 dark:bg-green-900/20"
                    >
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {revenueGrowth >= 0 ? "+" : ""}
                      {revenueGrowth}%
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold">
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
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="border-blue-200 bg-blue-50 text-blue-600 dark:bg-blue-900/20"
                    >
                      <ArrowUpRight className="mr-1 h-3 w-3" />
                      {bookingGrowth >= 0 ? "+" : ""}
                      {bookingGrowth}%
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold">{totalBookings}</p>
                  <p className="text-sm text-muted-foreground">Tổng đặt sân</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/30">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                  <p className="mt-3 text-2xl font-bold">{totalCustomers}</p>
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/30">
                      <Star className="h-5 w-5 text-yellow-600" />
                    </div>
                    <Badge
                      variant="outline"
                      className="border-yellow-200 bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20"
                    >
                      {totalReviewCount} review
                    </Badge>
                  </div>
                  <p className="mt-3 text-2xl font-bold">
                    {avgRating.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Đánh giá TB</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Doanh thu theo thời gian
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {revenueData.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      Chưa có dữ liệu doanh thu
                    </div>
                  ) : (
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
                        <XAxis dataKey="label" className="text-xs" />
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
                          fill="url(#colorRevenue)"
                          fillOpacity={1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Lượt đặt theo từng sân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsByField.length === 0 ? (
                    <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                      Chưa có dữ liệu đặt sân
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingsByField}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="stroke-muted"
                        />
                        <XAxis dataKey="name" className="text-xs" />
                        <YAxis allowDecimals={false} className="text-xs" />
                        <Tooltip {...chartTooltipProps} />
                        <Bar
                          dataKey="bookings"
                          fill="#2563eb"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiệu suất từng sân</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-2 py-3 text-left font-medium text-muted-foreground">
                          Tên sân
                        </th>
                        <th className="px-2 py-3 text-right font-medium text-muted-foreground">
                          Lượt đặt
                        </th>
                        <th className="px-2 py-3 text-right font-medium text-muted-foreground">
                          Doanh thu
                        </th>
                        <th className="px-2 py-3 text-right font-medium text-muted-foreground">
                          Đánh giá
                        </th>
                        <th className="px-2 py-3 text-right font-medium text-muted-foreground">
                          Review
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
                            <td className="px-2 py-3 font-medium">
                              {field.name}
                            </td>
                            <td className="px-2 py-3 text-right">
                              {field.bookings}
                            </td>
                            <td className="px-2 py-3 text-right font-medium text-green-600">
                              {formatFullCurrency(field.revenue)}
                            </td>
                            <td className="px-2 py-3 text-right">
                              <span className="flex items-center justify-end gap-1">
                                <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                                {field.rating.toFixed(1)}
                              </span>
                            </td>
                            <td className="px-2 py-3 text-right">
                              {field.reviewCount}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
