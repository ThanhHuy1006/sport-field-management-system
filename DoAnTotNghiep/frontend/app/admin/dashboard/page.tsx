"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  MapPin,
  Calendar,
  DollarSign,
  AlertCircle,
  CalendarDays,
  Star,
  TrendingUp,
  BarChart3,
  Flag,
} from "lucide-react";
import {
  getAdminReports,
  type AdminReportsData,
} from "@/features/reports/services/admin-reports";

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
      pending_owners: 0,
      hidden_reviews: 0,
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

function mergeReports(data?: AdminReportsData | null): AdminReportsData {
  const empty = createEmptyReports();

  if (!data) return empty;

  return {
    ...empty,
    ...data,
    range: {
      ...empty.range,
      ...(data.range ?? {}),
    },
    filters: {
      ...empty.filters,
      ...(data.filters ?? {}),
    },
    summary: {
      ...empty.summary,
      ...(data.summary ?? {}),
    },
    revenue_series: Array.isArray(data.revenue_series)
      ? data.revenue_series
      : [],
    booking_status: Array.isArray(data.booking_status)
      ? data.booking_status
      : [],
    field_status: Array.isArray(data.field_status) ? data.field_status : [],
    top_fields: Array.isArray(data.top_fields) ? data.top_fields : [],
    top_owners: Array.isArray(data.top_owners) ? data.top_owners : [],
    sport_breakdown: Array.isArray(data.sport_breakdown)
      ? data.sport_breakdown
      : [],
    district_breakdown: Array.isArray(data.district_breakdown)
      ? data.district_breakdown
      : [],
    payment_methods: Array.isArray(data.payment_methods)
      ? data.payment_methods
      : [],
    voucher_impact: {
      ...empty.voucher_impact,
      ...(data.voucher_impact ?? {}),
    },
  };
}

function formatCurrencyShort(value: number) {
  if (!Number.isFinite(value)) return "0";

  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)} tỷ`;
  }

  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)} triệu`;
  }

  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}K`;
  }

  return value.toString();
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "0";
  return value.toLocaleString("vi-VN");
}

function toNumber(value: number | null | undefined) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function getGrowthClassName(value: number) {
  return value >= 0 ? "text-green-600" : "text-red-600";
}

function formatGrowth(value: number) {
  const numberValue = toNumber(value);
  return `${numberValue >= 0 ? "+" : ""}${numberValue}% so với kỳ trước`;
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<AdminReportsData>(() =>
    createEmptyReports(),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const result = await getAdminReports({
        range: "month",
      });

      setReports(mergeReports(result.data));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Không thể tải dữ liệu dashboard admin",
      );
      setReports(createEmptyReports());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      try {
        setIsLoading(true);
        setError("");

        const result = await getAdminReports({
          range: "month",
        });

        if (cancelled) return;

        setReports(mergeReports(result.data));
      } catch (err) {
        if (cancelled) return;

        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải dữ liệu dashboard admin",
        );
        setReports(createEmptyReports());
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, []);

  const summary = reports.summary;

  const hiddenReviewsCount = toNumber(summary.hidden_reviews);
  const pendingOwnersCount = toNumber(summary.pending_owners);
  const pendingFieldsCount = toNumber(summary.pending_fields);
  const bookingGrowthPercent = toNumber(summary.booking_growth_percent);
  const revenueGrowthPercent = toNumber(summary.revenue_growth_percent);

  return (
    <div className="p-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Bảng Điều Khiển</h1>
        <p className="text-muted-foreground">
          Tổng quan hệ thống quản lý sân thể thao
        </p>
      </div>

      {error && (
        <Card className="p-4 mb-6 border-red-200 bg-red-50 dark:bg-red-950/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchDashboard}
              disabled={isLoading}
              className="w-fit border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950/30"
            >
              Thử lại
            </Button>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Card className="p-6 mb-8">
          <p className="text-center text-muted-foreground">
            Đang tải dữ liệu dashboard...
          </p>
        </Card>
      ) : (
        <>
          {/* Alerts */}
          <div className="flex flex-col gap-4 mb-8">
            {pendingOwnersCount > 0 && (
              <Link href="/admin/users">
                <Card className="p-4 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition cursor-pointer dark:bg-yellow-950/20 dark:border-yellow-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-500" />
                    <div className="flex-1">
                      <p className="font-medium text-yellow-900 dark:text-yellow-300">
                        Chủ sân chờ phê duyệt
                      </p>
                      <p className="text-sm text-yellow-800 dark:text-yellow-400">
                        {pendingOwnersCount} chủ sân đang chờ phê duyệt
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-yellow-900 dark:text-yellow-300"
                    >
                      Xem Ngay
                    </Button>
                  </div>
                </Card>
              </Link>
            )}

            {pendingFieldsCount > 0 && (
              <Link href="/admin/fields">
                <Card className="p-4 bg-blue-50 border-blue-200 hover:bg-blue-100 transition cursor-pointer dark:bg-blue-950/20 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                    <div className="flex-1">
                      <p className="font-medium text-blue-900 dark:text-blue-300">
                        Sân chờ phê duyệt
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-400">
                        {pendingFieldsCount} sân đang chờ phê duyệt
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-900 dark:text-blue-300"
                    >
                      Xem Ngay
                    </Button>
                  </div>
                </Card>
              </Link>
            )}

            {hiddenReviewsCount > 0 && (
              <Link href="/admin/moderation-reports">
                <Card className="p-4 bg-red-50 border-red-200 hover:bg-red-100 transition cursor-pointer dark:bg-red-950/20 dark:border-red-800">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-500" />
                    <div className="flex-1">
                      <p className="font-medium text-red-900 dark:text-red-300">
                        Đánh giá đang bị ẩn
                      </p>
                      <p className="text-sm text-red-800 dark:text-red-400">
                        {hiddenReviewsCount} đánh giá hiện không hiển thị công
                        khai
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-900 dark:text-red-300"
                    >
                      Kiểm Tra
                    </Button>
                  </div>
                </Card>
              </Link>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <Link href="/admin/users">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Tổng Người Dùng
                  </h3>
                  <Users className="w-5 h-5 text-blue-600" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(summary.total_users)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Owner: {formatNumber(summary.total_owners)} • Bị khóa:{" "}
                  {formatNumber(summary.locked_users)}
                </p>
              </Card>
            </Link>

            <Link href="/admin/fields">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Sân Hoạt Động
                  </h3>
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(summary.active_fields)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Tổng sân: {formatNumber(summary.total_fields)} • Chờ duyệt:{" "}
                  {formatNumber(summary.pending_fields)}
                </p>
              </Card>
            </Link>

            <Link href="/admin/schedule">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Tổng Đặt Sân
                  </h3>
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatNumber(summary.total_bookings)}
                </p>
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${getGrowthClassName(
                    bookingGrowthPercent,
                  )}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {formatGrowth(bookingGrowthPercent)}
                </p>
              </Card>
            </Link>

            <Link href="/admin/reports">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Doanh Thu
                  </h3>
                  <DollarSign className="w-5 h-5 text-orange-600" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrencyShort(summary.total_revenue)}
                </p>
                <p
                  className={`text-xs mt-1 flex items-center gap-1 ${getGrowthClassName(
                    revenueGrowthPercent,
                  )}`}
                >
                  <TrendingUp className="w-3 h-3" />
                  {formatGrowth(revenueGrowthPercent)}
                </p>
              </Card>
            </Link>

            <Link href="/admin/reports">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Đánh Giá TB
                  </h3>
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-foreground">
                  {Number(summary.avg_rating || 0).toFixed(1)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Đánh giá đang hiển thị
                </p>
              </Card>
            </Link>
          </div>

          {/* Quick Actions */}
          <h2 className="text-lg font-bold mb-4">Truy Cập Nhanh</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Link href="/admin/schedule" className="block h-full">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer border-2 border-primary/20 h-full flex flex-col">
                <CalendarDays className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Quản Lý Đặt Sân</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Xem lịch và danh sách đặt sân
                </p>
              </Card>
            </Link>

            <Link href="/admin/users" className="block h-full">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                <Users className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Quản Lý User</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Xem, phê duyệt và quản lý user
                </p>
              </Card>
            </Link>

            <Link href="/admin/fields" className="block h-full">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                <MapPin className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Quản Lý Sân</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Phê duyệt và quản lý sân
                </p>
              </Card>
            </Link>

            <Link href="/admin/moderation-reports" className="block h-full">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                <Flag className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Báo Cáo Vi Phạm</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Xử lý báo cáo sân và báo cáo đánh giá
                </p>
              </Card>
            </Link>

            <Link href="/admin/reports" className="block h-full">
              <Card className="p-6 hover:shadow-lg transition cursor-pointer h-full flex flex-col">
                <BarChart3 className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold mb-2">Báo Cáo & Thống Kê</h3>
                <p className="text-sm text-muted-foreground flex-1">
                  Xem báo cáo chi tiết
                </p>
              </Card>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
