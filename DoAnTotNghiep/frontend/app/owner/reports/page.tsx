"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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

// Mock data cho owner
const revenueData = [
  { month: "T1", revenue: 12000000, bookings: 32 },
  { month: "T2", revenue: 15000000, bookings: 41 },
  { month: "T3", revenue: 13500000, bookings: 36 },
  { month: "T4", revenue: 18000000, bookings: 48 },
  { month: "T5", revenue: 16500000, bookings: 44 },
  { month: "T6", revenue: 21000000, bookings: 56 },
  { month: "T7", revenue: 24000000, bookings: 64 },
  { month: "T8", revenue: 22500000, bookings: 60 },
  { month: "T9", revenue: 27000000, bookings: 72 },
  { month: "T10", revenue: 28500000, bookings: 76 },
  { month: "T11", revenue: 31000000, bookings: 82 },
  { month: "T12", revenue: 33000000, bookings: 88 },
]

const bookingsByField = [
  { name: "Sân Bóng Đá 1", value: 35, color: "#16a34a" },
  { name: "Sân Bóng Đá 2", value: 28, color: "#22c55e" },
  { name: "Sân Cầu Lông", value: 22, color: "#2563eb" },
  { name: "Sân Tennis", value: 15, color: "#9333ea" },
]

const bookingsByTime = [
  { time: "6-8h", bookings: 12 },
  { time: "8-10h", bookings: 25 },
  { time: "10-12h", bookings: 18 },
  { time: "12-14h", bookings: 10 },
  { time: "14-16h", bookings: 15 },
  { time: "16-18h", bookings: 42 },
  { time: "18-20h", bookings: 58 },
  { time: "20-22h", bookings: 45 },
]

const bookingsByDay = [
  { day: "T2", bookings: 28, revenue: 8400000 },
  { day: "T3", bookings: 32, revenue: 9600000 },
  { day: "T4", bookings: 30, revenue: 9000000 },
  { day: "T5", bookings: 35, revenue: 10500000 },
  { day: "T6", bookings: 45, revenue: 13500000 },
  { day: "T7", bookings: 62, revenue: 18600000 },
  { day: "CN", bookings: 55, revenue: 16500000 },
]

const fieldPerformance = [
  { name: "Sân Bóng Đá 1", bookings: 156, revenue: 78000000, rating: 4.8, occupancy: 85 },
  { name: "Sân Bóng Đá 2", bookings: 128, revenue: 64000000, rating: 4.6, occupancy: 72 },
  { name: "Sân Cầu Lông", bookings: 98, revenue: 39200000, rating: 4.7, occupancy: 68 },
  { name: "Sân Tennis", bookings: 72, revenue: 43200000, rating: 4.5, occupancy: 55 },
]

const topCustomers = [
  { name: "Nguyễn Văn Minh", bookings: 24, totalSpent: 12000000, lastVisit: "2 ngày trước" },
  { name: "Trần Thị Hương", bookings: 18, totalSpent: 9000000, lastVisit: "1 tuần trước" },
  { name: "Lê Hoàng Nam", bookings: 15, totalSpent: 7500000, lastVisit: "3 ngày trước" },
  { name: "Phạm Quốc Anh", bookings: 12, totalSpent: 6000000, lastVisit: "Hôm qua" },
  { name: "Hoàng Thị Mai", bookings: 10, totalSpent: 5000000, lastVisit: "5 ngày trước" },
]

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

export default function OwnerReportsPage() {
  const [dateRange, setDateRange] = useState("year")
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedField, setSelectedField] = useState("all")

  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0)
  const totalCustomers = 156
  const avgRating = 4.65

  // Tính tăng trưởng
  const lastMonthRevenue = revenueData[revenueData.length - 2].revenue
  const currentMonthRevenue = revenueData[revenueData.length - 1].revenue
  const revenueGrowth = (((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100).toFixed(1)

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
          <h1 className="text-xl font-bold">Báo Cáo & Thống Kê</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Thời gian" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">7 ngày qua</SelectItem>
                  <SelectItem value="30days">30 ngày qua</SelectItem>
                  <SelectItem value="3months">3 tháng qua</SelectItem>
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
                  <SelectItem value="field1">Sân Bóng Đá 1</SelectItem>
                  <SelectItem value="field2">Sân Bóng Đá 2</SelectItem>
                  <SelectItem value="field3">Sân Cầu Lông</SelectItem>
                  <SelectItem value="field4">Sân Tennis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <FileText className="w-4 h-4 mr-2" />
              PDF
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="w-4 h-4 mr-2" />
              Excel
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50 dark:bg-green-900/20">
                  <ArrowUpRight className="w-3 h-3 mr-1" />+{revenueGrowth}%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{formatCurrency(totalRevenue)}</p>
              <p className="text-sm text-muted-foreground">Tổng doanh thu</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +15%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{totalBookings}</p>
              <p className="text-sm text-muted-foreground">Tổng đặt sân</p>
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
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +22%
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
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +0.1
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{avgRating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Đánh giá TB</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
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

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Doanh thu theo tháng
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} className="text-xs" />
                      <Tooltip
                        formatter={(value: number) => [`${value.toLocaleString()} VND`, "Doanh thu"]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
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

              {/* Bookings by Field */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-600" />
                    Đặt sân theo từng sân
                  </CardTitle>
                </CardHeader>
                <CardContent>
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
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingsByField.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Field Performance Table */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiệu suất từng sân</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-2 font-medium text-muted-foreground">Tên sân</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Lượt đặt</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Doanh thu</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Đánh giá</th>
                        <th className="text-right py-3 px-2 font-medium text-muted-foreground">Tỷ lệ lấp đầy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fieldPerformance.map((field, idx) => (
                        <tr key={idx} className="border-b border-border/50 hover:bg-muted/50">
                          <td className="py-3 px-2 font-medium">{field.name}</td>
                          <td className="py-3 px-2 text-right">{field.bookings}</td>
                          <td className="py-3 px-2 text-right text-green-600 font-medium">
                            {formatCurrency(field.revenue)}
                          </td>
                          <td className="py-3 px-2 text-right">
                            <span className="flex items-center justify-end gap-1">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              {field.rating}
                            </span>
                          </td>
                          <td className="py-3 px-2 text-right">
                            <Badge variant={field.occupancy >= 70 ? "default" : "secondary"}>{field.occupancy}%</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doanh thu & số lượng đặt sân theo tháng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        name === "revenue" ? `${value.toLocaleString()} VND` : value,
                        name === "revenue" ? "Doanh thu" : "Số đặt sân",
                      ]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend formatter={(value) => (value === "revenue" ? "Doanh thu" : "Số đặt sân")} />
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

            {/* Revenue by Day */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Doanh thu theo ngày trong tuần</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingsByDay}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="day" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip
                      formatter={(value: number) => [`${value.toLocaleString()} VND`, "Doanh thu"]}
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Bar dataKey="revenue" fill="#16a34a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Revenue Stats */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Doanh thu cao nhất</p>
                  <p className="text-2xl font-bold text-green-600">33M VND</p>
                  <p className="text-sm text-muted-foreground">Tháng 12</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Doanh thu thấp nhất</p>
                  <p className="text-2xl font-bold text-red-600">12M VND</p>
                  <p className="text-sm text-muted-foreground">Tháng 1</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Doanh thu trung bình</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRevenue / 12)}</p>
                  <p className="text-sm text-muted-foreground">Mỗi tháng</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Bookings by Time */}
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
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [value, "Lượt đặt"]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bookings by Day */}
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
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number) => [value, "Lượt đặt"]}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="bookings" fill="#9333ea" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Peak Hours Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân tích giờ cao điểm</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-sm text-green-600 font-medium">Giờ cao điểm nhất</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-400">18:00 - 20:00</p>
                    <p className="text-sm text-muted-foreground">58 lượt đặt/tuần</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-600 font-medium">Ngày đông nhất</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400">Thứ 7</p>
                    <p className="text-sm text-muted-foreground">62 lượt đặt/tuần</p>
                  </div>
                  <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                    <p className="text-sm text-yellow-600 font-medium">Tỷ lệ hủy</p>
                    <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">4.2%</p>
                    <p className="text-sm text-muted-foreground">Thấp hơn TB ngành</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Top Customers */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 5 khách hàng thân thiết</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topCustomers.map((customer, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.lastVisit}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{customer.bookings} lượt</p>
                        <p className="text-sm text-green-600">{formatCurrency(customer.totalSpent)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Customer Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Thống kê khách hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Khách hàng mới (tháng này)</span>
                    <span className="font-bold text-green-600">+28</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Khách quay lại</span>
                    <span className="font-bold text-blue-600">68%</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Giá trị đặt TB/khách</span>
                    <span className="font-bold">{formatCurrency(totalRevenue / totalCustomers)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <span className="text-muted-foreground">Số lần đặt TB/khách</span>
                    <span className="font-bold">{(totalBookings / totalCustomers).toFixed(1)} lần</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Customer Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400">Tăng trưởng tốt</p>
                      <p className="text-sm text-muted-foreground">Số khách hàng mới tăng 22% so với tháng trước</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-700 dark:text-blue-400">Khách hàng trung thành</p>
                      <p className="text-sm text-muted-foreground">
                        68% khách hàng đặt sân lần 2 trở lên - cao hơn TB ngành (55%)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <Star className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-700 dark:text-yellow-400">Đánh giá tích cực</p>
                      <p className="text-sm text-muted-foreground">
                        92% khách hàng đánh giá 4-5 sao sau khi sử dụng dịch vụ
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
