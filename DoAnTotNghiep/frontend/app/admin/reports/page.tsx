"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  CreditCard,
  Download,
  DollarSign,
  MapPin,
  Printer,
  Star,
  TrendingUp,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { apiGet } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type AdminReportRange = "today" | "7d" | "30d" | "month" | "year";

type RevenuePoint = {
  key?: string;
  label: string;
  revenue: number | string | null;
  bookings: number | string | null;
};

type BookingStatusItem = {
  status: string;
  count: number | string | null;
};

type FieldStatusItem = {
  status: string;
  count: number | string | null;
};

type TopField = {
  field_id: number;
  field_name: string;
  owner_id?: number | null;
  owner_name?: string | null;
  sport_type?: string | null;
  district?: string | null;
  bookings: number | string | null;
  revenue: number | string | null;
};

type TopOwner = {
  owner_id: number;
  owner_name: string;
  bookings: number | string | null;
  revenue: number | string | null;
  field_count: number | string | null;
};

type BreakdownItem = {
  sport_type?: string | null;
  district?: string | null;
  bookings: number | string | null;
  revenue: number | string | null;
};

type PaymentMethodItem = {
  method: string;
  count: number | string | null;
  amount: number | string | null;
};

type VoucherImpact = {
  original_revenue: number | string | null;
  final_revenue: number | string | null;
  discount_total: number | string | null;
  voucher_booking_count: number | string | null;
  voucher_usage_rate: number | string | null;
};

type AdminReportsData = {
  range: {
    key: AdminReportRange | string;
    from: string | Date;
    to: string | Date;
  };
  filters: {
    sport_type: string | null;
    district: string | null;
  };
  summary: {
    total_revenue: number;
    total_bookings: number;
    revenue_bookings: number;
    total_users: number;
    total_owners: number;
    locked_users: number;
    total_fields: number;
    active_fields: number;
    pending_fields: number;
    maintenance_fields: number;
    avg_rating: number;
    voucher_discount_total: number;
    revenue_growth_percent: number;
    booking_growth_percent: number;
  };
  revenue_series: RevenuePoint[];
  booking_status: BookingStatusItem[];
  field_status: FieldStatusItem[];
  top_fields: TopField[];
  top_owners: TopOwner[];
  sport_breakdown: BreakdownItem[];
  district_breakdown: BreakdownItem[];
  payment_methods: PaymentMethodItem[];
  voucher_impact: VoucherImpact;
};

type AdminReportsResponse = {
  success: boolean;
  message: string;
  data: Partial<AdminReportsData>;
};

type ReportFilters = {
  range: AdminReportRange;
  sport_type?: string | null;
  district?: string | null;
};

type OptionItem = {
  value: string;
  label: string;
};

const RANGE_LABELS: Record<AdminReportRange, string> = {
  today: "Hôm nay",
  "7d": "7 ngày qua",
  "30d": "30 ngày qua",
  month: "Tháng này",
  year: "Năm nay",
};

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#f97316",
  "#9333ea",
  "#dc2626",
  "#0891b2",
  "#ca8a04",
  "#db2777",
];

const REVENUE_CHART_COLOR = "#2563eb";
const BOOKING_STATUS_COLOR = "#16a34a";
const TOP_FIELD_COLOR = "#f97316";
const TOP_OWNER_COLOR = "#9333ea";

function toNumber(value: unknown) {
  if (value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toString();
}

function formatFullCurrency(value: number) {
  if (!Number.isFinite(value)) return "0 VND";
  return `${value.toLocaleString("vi-VN")} VND`;
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "0%";
  return `${value > 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function getSportLabel(value?: string | null) {
  const sport = String(value || "").trim();

  const labels: Record<string, string> = {
    football: "Bóng đá",
    soccer: "Bóng đá",
    basketball: "Bóng rổ",
    badminton: "Cầu lông",
    tennis: "Tennis",
    volleyball: "Bóng chuyền",
    pickleball: "Pickleball",
  };

  return labels[sport.toLowerCase()] || sport || "Khác";
}

function getPaymentMethodLabel(value?: string | null) {
  const method = String(value || "").trim();

  const labels: Record<string, string> = {
    VNPAY: "VNPay",
    MOMO: "MoMo",
    ZALOPAY: "ZaloPay",
    ONSITE: "Tại sân",
    BANK_TRANSFER: "Chuyển khoản",
    UNKNOWN: "Không rõ",
  };

  return labels[method.toUpperCase()] || method || "Không rõ";
}

function getBookingStatusLabel(status?: string | null) {
  const normalizedStatus = String(status || "").toUpperCase();

  const labels: Record<string, string> = {
    PENDING_CONFIRM: "Chờ xác nhận",
    APPROVED: "Đã duyệt",
    AWAITING_PAYMENT: "Chờ thanh toán",
    PAID: "Đã thanh toán",
    CHECKED_IN: "Đã check-in",
    COMPLETED: "Hoàn thành",
    CANCELLED: "Đã hủy",
    REJECTED: "Bị từ chối",
    PAY_FAILED: "Thanh toán lỗi",
    PAYMENT_EXPIRED: "Quá hạn thanh toán",
    NO_SHOW: "Không đến sân",
  };

  return labels[normalizedStatus] || String(status || "Không rõ");
}

function getFieldStatusLabel(status?: string | null) {
  const normalizedStatus = String(status || "").toLowerCase();

  const labels: Record<string, string> = {
    active: "Đang hoạt động",
    pending: "Chờ duyệt",
    inactive: "Tạm ngưng",
    maintenance: "Bảo trì",
    rejected: "Bị từ chối",
    hidden: "Đã ẩn",
  };

  return labels[normalizedStatus] || String(status || "Không rõ");
}

function createEmptyReports(): AdminReportsData {
  return {
    range: {
      key: "month",
      from: "",
      to: "",
    },
    filters: {
      sport_type: null,
      district: null,
    },
    summary: {
      total_revenue: 0,
      total_bookings: 0,
      revenue_bookings: 0,
      total_users: 0,
      total_owners: 0,
      locked_users: 0,
      total_fields: 0,
      active_fields: 0,
      pending_fields: 0,
      maintenance_fields: 0,
      avg_rating: 0,
      voucher_discount_total: 0,
      revenue_growth_percent: 0,
      booking_growth_percent: 0,
    },
    revenue_series: [],
    booking_status: [],
    field_status: [],
    top_fields: [],
    top_owners: [],
    sport_breakdown: [],
    district_breakdown: [],
    payment_methods: [],
    voucher_impact: {
      original_revenue: 0,
      final_revenue: 0,
      discount_total: 0,
      voucher_booking_count: 0,
      voucher_usage_rate: 0,
    },
  };
}

function pickArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function normalizeSummary(
  summary?: Partial<Record<keyof AdminReportsData["summary"], unknown>> | null,
): AdminReportsData["summary"] {
  const empty = createEmptyReports().summary;

  return {
    total_revenue: toNumber(summary?.total_revenue ?? empty.total_revenue),
    total_bookings: toNumber(summary?.total_bookings ?? empty.total_bookings),
    revenue_bookings: toNumber(summary?.revenue_bookings ?? empty.revenue_bookings),
    total_users: toNumber(summary?.total_users ?? empty.total_users),
    total_owners: toNumber(summary?.total_owners ?? empty.total_owners),
    locked_users: toNumber(summary?.locked_users ?? empty.locked_users),
    total_fields: toNumber(summary?.total_fields ?? empty.total_fields),
    active_fields: toNumber(summary?.active_fields ?? empty.active_fields),
    pending_fields: toNumber(summary?.pending_fields ?? empty.pending_fields),
    maintenance_fields: toNumber(summary?.maintenance_fields ?? empty.maintenance_fields),
    avg_rating: toNumber(summary?.avg_rating ?? empty.avg_rating),
    voucher_discount_total: toNumber(
      summary?.voucher_discount_total ?? empty.voucher_discount_total,
    ),
    revenue_growth_percent: toNumber(
      summary?.revenue_growth_percent ?? empty.revenue_growth_percent,
    ),
    booking_growth_percent: toNumber(
      summary?.booking_growth_percent ?? empty.booking_growth_percent,
    ),
  };
}

function normalizeVoucherImpact(
  voucherImpact?: Partial<Record<keyof VoucherImpact, unknown>> | null,
): VoucherImpact {
  const empty = createEmptyReports().voucher_impact;

  return {
    original_revenue: toNumber(voucherImpact?.original_revenue ?? empty.original_revenue),
    final_revenue: toNumber(voucherImpact?.final_revenue ?? empty.final_revenue),
    discount_total: toNumber(voucherImpact?.discount_total ?? empty.discount_total),
    voucher_booking_count: toNumber(
      voucherImpact?.voucher_booking_count ?? empty.voucher_booking_count,
    ),
    voucher_usage_rate: toNumber(
      voucherImpact?.voucher_usage_rate ?? empty.voucher_usage_rate,
    ),
  };
}

function normalizeReports(payload?: Partial<AdminReportsData> | null): AdminReportsData {
  const empty = createEmptyReports();
  const source = payload ?? {};

  return {
    ...empty,
    ...source,
    range: {
      ...empty.range,
      ...(source.range ?? {}),
    },
    filters: {
      ...empty.filters,
      ...(source.filters ?? {}),
    },
    summary: normalizeSummary(source.summary as Partial<Record<keyof AdminReportsData["summary"], unknown>>),
    revenue_series: pickArray<RevenuePoint>(source.revenue_series),
    booking_status: pickArray<BookingStatusItem>(source.booking_status),
    field_status: pickArray<FieldStatusItem>(source.field_status),
    top_fields: pickArray<TopField>(source.top_fields),
    top_owners: pickArray<TopOwner>(source.top_owners),
    sport_breakdown: pickArray<BreakdownItem>(source.sport_breakdown),
    district_breakdown: pickArray<BreakdownItem>(source.district_breakdown),
    payment_methods: pickArray<PaymentMethodItem>(source.payment_methods),
    voucher_impact: normalizeVoucherImpact(source.voucher_impact as Partial<Record<keyof VoucherImpact, unknown>>),
  };
}

async function getAdminReports(filters: ReportFilters) {
  const params = new URLSearchParams({
    range: filters.range,
  });

  if (filters.sport_type && filters.sport_type !== "all") {
    params.set("sport_type", filters.sport_type);
  }

  if (filters.district && filters.district !== "all") {
    params.set("district", filters.district);
  }

  const result = await apiGet<AdminReportsResponse | AdminReportsData>(
    `/admin/reports?${params.toString()}`,
  );

  const payload =
    (result as AdminReportsResponse)?.data ?? (result as AdminReportsData);

  return normalizeReports(payload as Partial<AdminReportsData>);
}

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
            ? "Giá trị đặt sân"
            : item.name === "bookings"
              ? "Lượt đặt"
              : item.name === "count"
                ? "Số lượng"
                : item.name || "Giá trị";

        const value =
          item.name === "revenue"
            ? formatFullCurrency(toNumber(item.value))
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

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  growth,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  growth?: number;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>

          {growth !== undefined && (
            <div
              className={[
                "rounded-full border px-2 py-1 text-xs font-medium",
                growth >= 0
                  ? "border-green-600/30 text-green-600"
                  : "border-red-600/30 text-red-600",
              ].join(" ")}
            >
              {formatPercent(growth)}
            </div>
          )}
        </div>

        <p className="text-2xl font-bold">{value}</p>
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function EmptyBlock({ message }: { message: string }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center rounded-lg border border-dashed border-border px-4 text-center text-sm text-muted-foreground">
      {message}
    </div>
  );
}

function InfoRow({
  label,
  subLabel,
  value,
}: {
  label: string;
  subLabel?: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border p-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{label}</p>
        {subLabel && <p className="text-xs text-muted-foreground">{subLabel}</p>}
      </div>
      <p className="shrink-0 text-sm font-bold">{value}</p>
    </div>
  );
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState<AdminReportRange>("month");
  const [selectedSportType, setSelectedSportType] = useState("all");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [sportOptions, setSportOptions] = useState<OptionItem[]>([]);
  const [districtOptions, setDistrictOptions] = useState<OptionItem[]>([]);
  const [reports, setReports] = useState<AdminReportsData>(() => createEmptyReports());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function fetchReports() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAdminReports({
          range: dateRange,
          sport_type: selectedSportType,
          district: selectedDistrict,
        });

        if (cancelled) return;

        setReports(data);

        setSportOptions((previousOptions) => {
          const optionMap = new Map<string, OptionItem>();

          previousOptions.forEach((option) => optionMap.set(option.value, option));

          data.sport_breakdown.forEach((item) => {
            const value = String(item.sport_type || "").trim();
            if (!value) return;

            optionMap.set(value, {
              value,
              label: getSportLabel(value),
            });
          });

          data.top_fields.forEach((field) => {
            const value = String(field.sport_type || "").trim();
            if (!value) return;

            optionMap.set(value, {
              value,
              label: getSportLabel(value),
            });
          });

          return Array.from(optionMap.values()).sort((a, b) =>
            a.label.localeCompare(b.label, "vi"),
          );
        });

        setDistrictOptions((previousOptions) => {
          const optionMap = new Map<string, OptionItem>();

          previousOptions.forEach((option) => optionMap.set(option.value, option));

          data.district_breakdown.forEach((item) => {
            const value = String(item.district || "").trim();
            if (!value) return;

            optionMap.set(value, {
              value,
              label: value,
            });
          });

          data.top_fields.forEach((field) => {
            const value = String(field.district || "").trim();
            if (!value) return;

            optionMap.set(value, {
              value,
              label: value,
            });
          });

          return Array.from(optionMap.values()).sort((a, b) =>
            a.label.localeCompare(b.label, "vi"),
          );
        });
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Không thể tải dữ liệu thống kê admin";

        setReports(createEmptyReports());
        setError(message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchReports();

    return () => {
      cancelled = true;
    };
  }, [dateRange, selectedSportType, selectedDistrict, reloadKey]);

  const summary = reports.summary;

  const revenueData = useMemo(
    () =>
      reports.revenue_series.map((item) => ({
        label: item.label,
        revenue: toNumber(item.revenue),
        bookings: toNumber(item.bookings),
      })),
    [reports.revenue_series],
  );

  const bookingStatusData = useMemo(
    () =>
      reports.booking_status.map((item) => ({
        label: getBookingStatusLabel(item.status),
        count: toNumber(item.count),
      })),
    [reports.booking_status],
  );

  const fieldStatusData = useMemo(
    () =>
      reports.field_status.map((item) => ({
        label: getFieldStatusLabel(item.status),
        count: toNumber(item.count),
      })),
    [reports.field_status],
  );

  const topFieldsData = useMemo(
    () =>
      reports.top_fields.slice(0, 5).map((field) => ({
        label: field.field_name || `Sân #${field.field_id}`,
        revenue: toNumber(field.revenue),
        bookings: toNumber(field.bookings),
      })),
    [reports.top_fields],
  );

  const topOwnersData = useMemo(
    () =>
      reports.top_owners.slice(0, 5).map((owner) => ({
        label: owner.owner_name || `Owner #${owner.owner_id}`,
        revenue: toNumber(owner.revenue),
        bookings: toNumber(owner.bookings),
      })),
    [reports.top_owners],
  );

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    const rows: string[][] = [
      ["Báo cáo thống kê admin"],
      ["Khoảng thời gian", RANGE_LABELS[dateRange]],
      ["Loại sân", selectedSportType === "all" ? "Tất cả" : getSportLabel(selectedSportType)],
      ["Khu vực", selectedDistrict === "all" ? "Tất cả" : selectedDistrict],
      [],
      ["Chỉ số", "Giá trị"],
      ["Tổng giá trị đặt sân", String(summary.total_revenue)],
      ["Tổng lượt đặt", String(summary.total_bookings)],
      ["Booking tính doanh thu", String(summary.revenue_bookings)],
      ["Đánh giá trung bình", String(summary.avg_rating)],
      ["Tổng giảm voucher", String(summary.voucher_discount_total)],
      [],
      ["Thông tin tham chiếu"],
      ["Tổng người dùng", String(summary.total_users)],
      ["Tổng chủ sân", String(summary.total_owners)],
      ["Tổng sân", String(summary.total_fields)],
      ["Người dùng bị khóa", String(summary.locked_users)],
      [],
      ["Doanh thu theo thời gian"],
      ["Mốc thời gian", "Giá trị đặt sân", "Lượt đặt"],
      ...revenueData.map((item) => [
        item.label,
        String(item.revenue),
        String(item.bookings),
      ]),
      [],
      ["Top sân"],
      ["Sân", "Lượt đặt", "Giá trị đặt sân"],
      ...reports.top_fields.map((field) => [
        field.field_name || `Sân #${field.field_id}`,
        String(toNumber(field.bookings)),
        String(toNumber(field.revenue)),
      ]),
      [],
      ["Top chủ sân"],
      ["Chủ sân", "Số sân", "Lượt đặt", "Giá trị đặt sân"],
      ...reports.top_owners.map((owner) => [
        owner.owner_name || `Owner #${owner.owner_id}`,
        String(toNumber(owner.field_count)),
        String(toNumber(owner.bookings)),
        String(toNumber(owner.revenue)),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([`\uFEFF${csv}`], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `admin-reports-${dateRange}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background">
        <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-3 px-4 py-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 whitespace-nowrap text-primary hover:text-primary/80"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>

          <div className="min-w-0 text-center">
            <h1 className="truncate text-lg font-bold sm:text-xl">
              Thống kê toàn hệ thống
            </h1>
            <p className="hidden text-xs text-muted-foreground sm:block">
              Theo dõi giá trị đặt sân, lượt đặt, người dùng, sân và hiệu quả hoạt động
            </p>
          </div>

          <div className="w-5 sm:w-[88px]" />
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />

              <Select
                value={dateRange}
                onValueChange={(value) => setDateRange(value as AdminReportRange)}
              >
                <SelectTrigger className="w-full sm:w-[170px]">
                  <SelectValue placeholder="Chọn thời gian" />
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
              <BarChart3 className="h-5 w-5 text-muted-foreground" />

              <Select value={selectedSportType} onValueChange={setSelectedSportType}>
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Chọn loại sân" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại sân</SelectItem>
                  {sportOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-muted-foreground" />

              <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                <SelectTrigger className="w-full sm:w-[190px]">
                  <SelectValue placeholder="Chọn khu vực" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả khu vực</SelectItem>
                  {districtOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCsv} disabled={isLoading}>
              <Download className="mr-2 h-4 w-4" />
              Xuất CSV
            </Button>

            <Button variant="outline" size="sm" onClick={handlePrint} disabled={isLoading}>
              <Printer className="mr-2 h-4 w-4" />
              In / PDF
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-destructive/40">
            <CardContent className="flex flex-col gap-3 p-4 text-sm text-destructive sm:flex-row sm:items-center sm:justify-between">
              <span>{error}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReloadKey((current) => current + 1)}
                disabled={isLoading}
                className="w-fit"
              >
                Thử lại
              </Button>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              Đang tải dữ liệu thống kê...
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Giá trị đặt sân"
                value={`${formatCompactCurrency(summary.total_revenue)} VND`}
                subtitle="Tổng giá trị booking trong kỳ"
                icon={DollarSign}
                growth={summary.revenue_growth_percent}
              />

              <StatCard
                title="Lượt đặt sân"
                value={summary.total_bookings.toLocaleString("vi-VN")}
                subtitle="Tổng số đơn đặt sân trong kỳ"
                icon={Calendar}
                growth={summary.booking_growth_percent}
              />

              <StatCard
                title="Booking có doanh thu"
                value={summary.revenue_bookings.toLocaleString("vi-VN")}
                subtitle="Đơn đã thanh toán / check-in / hoàn thành"
                icon={CreditCard}
              />

              <StatCard
                title="Đánh giá TB"
                value={summary.avg_rating.toFixed(1)}
                subtitle="Điểm đánh giá trung bình toàn hệ thống"
                icon={Star}
              />
            </div>

            <Card className="border-dashed">
              <CardContent className="p-4 text-sm text-muted-foreground">
                Trang này tập trung vào hiệu quả hoạt động: giá trị đặt sân, lượt đặt, trạng thái booking,
                top sân, top chủ sân và phân tích theo loại sân/khu vực. Các số liệu danh mục như tổng sân
                hoặc tổng người dùng được quản lý chi tiết ở trang quản lý sân và quản lý người dùng.
              </CardContent>
            </Card>

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
                    <EmptyBlock message="Chưa có dữ liệu doanh thu" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="adminRevenue" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={REVENUE_CHART_COLOR} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={REVENUE_CHART_COLOR} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis tickFormatter={(value) => formatCompactCurrency(Number(value))} className="text-xs" />
                        <Tooltip {...chartTooltipProps} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          name="revenue"
                          stroke={REVENUE_CHART_COLOR}
                          fill="url(#adminRevenue)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="h-5 w-5 text-primary" />
                    Trạng thái đơn đặt sân
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingStatusData.length === 0 ? (
                    <EmptyBlock message="Chưa có dữ liệu trạng thái booking" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={bookingStatusData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="label" className="text-xs" />
                        <YAxis allowDecimals={false} className="text-xs" />
                        <Tooltip {...chartTooltipProps} />
                        <Bar dataKey="count" name="count" fill={BOOKING_STATUS_COLOR} radius={[6, 6, 0, 0]}>
                          {bookingStatusData.map((entry, index) => (
                            <Cell
                              key={`booking-status-${entry.label}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top sân theo giá trị đặt sân</CardTitle>
                </CardHeader>
                <CardContent>
                  {topFieldsData.length === 0 ? (
                    <EmptyBlock message="Chưa có dữ liệu top sân" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topFieldsData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(value) => formatCompactCurrency(Number(value))} className="text-xs" />
                        <YAxis type="category" dataKey="label" width={120} className="text-xs" />
                        <Tooltip {...chartTooltipProps} />
                        <Bar dataKey="revenue" name="revenue" fill={TOP_FIELD_COLOR} radius={[0, 6, 6, 0]}>
                          {topFieldsData.map((entry, index) => (
                            <Cell
                              key={`top-field-${entry.label}`}
                              fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top chủ sân theo giá trị đặt sân</CardTitle>
                </CardHeader>
                <CardContent>
                  {topOwnersData.length === 0 ? (
                    <EmptyBlock message="Chưa có dữ liệu top chủ sân" />
                  ) : (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={topOwnersData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis type="number" tickFormatter={(value) => formatCompactCurrency(Number(value))} className="text-xs" />
                        <YAxis type="category" dataKey="label" width={120} className="text-xs" />
                        <Tooltip {...chartTooltipProps} />
                        <Bar dataKey="revenue" name="revenue" fill={TOP_OWNER_COLOR} radius={[0, 6, 6, 0]}>
                          {topOwnersData.map((entry, index) => (
                            <Cell
                              key={`top-owner-${entry.label}`}
                              fill={CHART_COLORS[(index + 3) % CHART_COLORS.length]}
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bảng top sân hoạt động tốt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.top_fields.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu top sân.</p>
                  ) : (
                    reports.top_fields.slice(0, 8).map((field) => (
                      <InfoRow
                        key={field.field_id}
                        label={field.field_name || `Sân #${field.field_id}`}
                        subLabel={`${field.owner_name || "Chủ sân"} • ${getSportLabel(field.sport_type)} • ${field.district || "Không rõ khu vực"} • ${toNumber(field.bookings)} lượt đặt`}
                        value={formatFullCurrency(toNumber(field.revenue))}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Bảng top chủ sân hoạt động tốt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.top_owners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu top chủ sân.</p>
                  ) : (
                    reports.top_owners.slice(0, 8).map((owner) => (
                      <InfoRow
                        key={owner.owner_id}
                        label={owner.owner_name || `Owner #${owner.owner_id}`}
                        subLabel={`${toNumber(owner.field_count)} sân • ${toNumber(owner.bookings)} lượt đặt`}
                        value={formatFullCurrency(toNumber(owner.revenue))}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Trạng thái sân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {fieldStatusData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu trạng thái sân.</p>
                  ) : (
                    fieldStatusData.map((item) => (
                      <InfoRow key={item.label} label={item.label} value={String(item.count)} />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Theo loại sân</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.sport_breakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu theo loại sân.</p>
                  ) : (
                    reports.sport_breakdown.slice(0, 6).map((item) => (
                      <InfoRow
                        key={String(item.sport_type || "Khác")}
                        label={getSportLabel(item.sport_type)}
                        subLabel={`${toNumber(item.bookings)} lượt đặt`}
                        value={formatFullCurrency(toNumber(item.revenue))}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Theo khu vực</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.district_breakdown.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu theo khu vực.</p>
                  ) : (
                    reports.district_breakdown.slice(0, 6).map((item) => (
                      <InfoRow
                        key={String(item.district || "Khác")}
                        label={item.district || "Khác"}
                        subLabel={`${toNumber(item.bookings)} lượt đặt`}
                        value={formatFullCurrency(toNumber(item.revenue))}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Phương thức thanh toán</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {reports.payment_methods.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Chưa có dữ liệu phương thức thanh toán.</p>
                  ) : (
                    reports.payment_methods.map((item) => (
                      <InfoRow
                        key={String(item.method)}
                        label={getPaymentMethodLabel(item.method)}
                        subLabel={`${toNumber(item.count)} giao dịch`}
                        value={formatFullCurrency(toNumber(item.amount))}
                      />
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tác động voucher</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <InfoRow
                    label="Doanh thu gốc"
                    subLabel="Tổng tiền trước giảm"
                    value={formatFullCurrency(toNumber(reports.voucher_impact.original_revenue))}
                  />
                  <InfoRow
                    label="Doanh thu sau giảm"
                    subLabel="Tổng tiền sau khi áp voucher"
                    value={formatFullCurrency(toNumber(reports.voucher_impact.final_revenue))}
                  />
                  <InfoRow
                    label="Tổng giảm giá"
                    subLabel={`${toNumber(reports.voucher_impact.voucher_booking_count)} đơn dùng voucher`}
                    value={formatFullCurrency(toNumber(reports.voucher_impact.discount_total))}
                  />
                  <InfoRow
                    label="Tỷ lệ dùng voucher"
                    subLabel="Trên các booking có doanh thu"
                    value={`${toNumber(reports.voucher_impact.voucher_usage_rate).toFixed(1)}%`}
                  />
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
