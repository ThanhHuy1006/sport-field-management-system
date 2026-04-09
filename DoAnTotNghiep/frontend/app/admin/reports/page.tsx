"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Users,
  MapPin,
  Calendar,
  Star,
  ArrowUpRight,
  FileText,
  BarChart3,
  PieChart,
  Activity,
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

// Mock data for charts
const revenueData = [
  { month: "T1", revenue: 45000000, bookings: 120 },
  { month: "T2", revenue: 52000000, bookings: 145 },
  { month: "T3", revenue: 48000000, bookings: 132 },
  { month: "T4", revenue: 61000000, bookings: 168 },
  { month: "T5", revenue: 55000000, bookings: 155 },
  { month: "T6", revenue: 67000000, bookings: 189 },
  { month: "T7", revenue: 72000000, bookings: 205 },
  { month: "T8", revenue: 69000000, bookings: 198 },
  { month: "T9", revenue: 78000000, bookings: 220 },
  { month: "T10", revenue: 82000000, bookings: 235 },
  { month: "T11", revenue: 88000000, bookings: 248 },
  { month: "T12", revenue: 95000000, bookings: 268 },
]

const userGrowthData = [
  { month: "T1", newUsers: 45, totalUsers: 450 },
  { month: "T2", newUsers: 62, totalUsers: 512 },
  { month: "T3", newUsers: 58, totalUsers: 570 },
  { month: "T4", newUsers: 71, totalUsers: 641 },
  { month: "T5", newUsers: 68, totalUsers: 709 },
  { month: "T6", newUsers: 85, totalUsers: 794 },
  { month: "T7", newUsers: 92, totalUsers: 886 },
  { month: "T8", newUsers: 78, totalUsers: 964 },
  { month: "T9", newUsers: 95, totalUsers: 1059 },
  { month: "T10", newUsers: 88, totalUsers: 1147 },
  { month: "T11", newUsers: 102, totalUsers: 1249 },
  { month: "T12", newUsers: 115, totalUsers: 1364 },
]

const bookingsByFieldType = [
  { name: "Bóng đá", value: 45, color: "#16a34a" },
  { name: "Bóng rổ", value: 20, color: "#ea580c" },
  { name: "Tennis", value: 15, color: "#2563eb" },
  { name: "Cầu lông", value: 12, color: "#9333ea" },
  { name: "Khác", value: 8, color: "#6b7280" },
]

const bookingsByTime = [
  { time: "6-8h", bookings: 45 },
  { time: "8-10h", bookings: 78 },
  { time: "10-12h", bookings: 65 },
  { time: "12-14h", bookings: 42 },
  { time: "14-16h", bookings: 58 },
  { time: "16-18h", bookings: 125 },
  { time: "18-20h", bookings: 168 },
  { time: "20-22h", bookings: 142 },
]

const topFields = [
  { name: "Sân Bóng Đá Thảo Điền", owner: "Nguyễn Văn A", bookings: 156, revenue: 78000000, rating: 4.8 },
  { name: "Sân Tennis Phú Nhuận", owner: "Trần Thị B", bookings: 142, revenue: 71000000, rating: 4.7 },
  { name: "Sân Bóng Rổ Quận 7", owner: "Lê Văn C", bookings: 128, revenue: 51200000, rating: 4.6 },
  { name: "Sân Cầu Lông Bình Thạnh", owner: "Phạm Thị D", bookings: 115, revenue: 46000000, rating: 4.5 },
  { name: "Sân Bóng Đá Mini Quận 1", owner: "Hoàng Văn E", bookings: 108, revenue: 54000000, rating: 4.4 },
]

const topOwners = [
  { name: "Nguyễn Văn A", fields: 5, bookings: 320, revenue: 160000000 },
  { name: "Trần Thị B", fields: 3, bookings: 245, revenue: 122500000 },
  { name: "Lê Văn C", fields: 4, bookings: 198, revenue: 99000000 },
  { name: "Phạm Thị D", fields: 2, bookings: 156, revenue: 78000000 },
  { name: "Hoàng Văn E", fields: 3, bookings: 142, revenue: 71000000 },
]

const weeklyBookings = [
  { day: "T2", bookings: 45, completed: 42, cancelled: 3 },
  { day: "T3", bookings: 52, completed: 48, cancelled: 4 },
  { day: "T4", bookings: 48, completed: 45, cancelled: 3 },
  { day: "T5", bookings: 55, completed: 52, cancelled: 3 },
  { day: "T6", bookings: 68, completed: 64, cancelled: 4 },
  { day: "T7", bookings: 95, completed: 89, cancelled: 6 },
  { day: "CN", bookings: 88, completed: 82, cancelled: 6 },
]

const formatCurrency = (value: number) => {
  if (value >= 1000000000) return `${(value / 1000000000).toFixed(1)}B`
  if (value >= 1000000) return `${(value / 1000000).toFixed(0)}M`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
  return value.toString()
}

export default function AdminReportsPage() {
  const [dateRange, setDateRange] = useState("year")
  const [activeTab, setActiveTab] = useState("overview")

  // Calculate totals
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0)
  const totalBookings = revenueData.reduce((sum, item) => sum + item.bookings, 0)
  const totalUsers = userGrowthData[userGrowthData.length - 1].totalUsers
  const avgRating = 4.6

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Quay lại</span>
          </Link>
          <h1 className="text-xl font-bold">Báo Cáo & Phân Tích</h1>
          <div className="w-10" /> {/* Placeholder để giữ layout cân đối */}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Date Range & Quick Stats */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[180px]">
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
                  <ArrowUpRight className="w-3 h-3 mr-1" />
                  +18%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{formatCurrency(totalRevenue)} VND</p>
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
                  +12%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{totalBookings.toLocaleString()}</p>
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
                  +25%
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{totalUsers.toLocaleString()}</p>
              <p className="text-sm text-muted-foreground">Người dùng</p>
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
                  +0.2
                </Badge>
              </div>
              <p className="text-2xl font-bold mt-3">{avgRating}</p>
              <p className="text-sm text-muted-foreground">Đánh giá TB</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="overview" className="text-xs sm:text-sm">
              <Activity className="w-4 h-4 mr-1 hidden sm:inline" />
              Tổng quan
            </TabsTrigger>
            <TabsTrigger value="revenue" className="text-xs sm:text-sm">
              <DollarSign className="w-4 h-4 mr-1 hidden sm:inline" />
              Doanh thu
            </TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">
              <Users className="w-4 h-4 mr-1 hidden sm:inline" />
              Người dùng
            </TabsTrigger>
            <TabsTrigger value="fields" className="text-xs sm:text-sm">
              <MapPin className="w-4 h-4 mr-1 hidden sm:inline" />
              Sân bãi
            </TabsTrigger>
            <TabsTrigger value="bookings" className="text-xs sm:text-sm">
              <Calendar className="w-4 h-4 mr-1 hidden sm:inline" />
              Đặt sân
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

              {/* Bookings by Field Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-blue-600" />
                    Đặt sân theo loại
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={bookingsByFieldType}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {bookingsByFieldType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Fields & Owners */}
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 5 sân được đặt nhiều nhất</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topFields.map((field, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{field.name}</p>
                        <p className="text-sm text-muted-foreground">{field.owner}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{field.bookings} đặt</p>
                        <p className="text-sm text-muted-foreground flex items-center justify-end gap-1">
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                          {field.rating}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Top 5 chủ sân doanh thu cao</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topOwners.map((owner, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-sm font-bold text-green-600">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{owner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {owner.fields} sân • {owner.bookings} đặt
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">{formatCurrency(owner.revenue)}</p>
                        <p className="text-sm text-muted-foreground">VND</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Biểu đồ doanh thu & số lượng đặt sân</CardTitle>
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

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Doanh thu cao nhất</p>
                  <p className="text-2xl font-bold text-green-600">95M VND</p>
                  <p className="text-sm text-muted-foreground">Tháng 12</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Doanh thu thấp nhất</p>
                  <p className="text-2xl font-bold text-red-600">45M VND</p>
                  <p className="text-sm text-muted-foreground">Tháng 1</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Doanh thu trung bình</p>
                  <p className="text-2xl font-bold text-blue-600">68M VND</p>
                  <p className="text-sm text-muted-foreground">Mỗi tháng</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tăng trưởng người dùng</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9333ea" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                    />
                    <Legend formatter={(value) => (value === "totalUsers" ? "Tổng người dùng" : "Người dùng mới")} />
                    <Area
                      type="monotone"
                      dataKey="totalUsers"
                      stroke="#9333ea"
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                    <Bar dataKey="newUsers" fill="#16a34a" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Tổng người dùng</p>
                  <p className="text-2xl font-bold">1,364</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Khách hàng</p>
                  <p className="text-2xl font-bold">1,289</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Chủ sân</p>
                  <p className="text-2xl font-bold">75</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Đăng ký mới tháng này</p>
                  <p className="text-2xl font-bold text-green-600">+115</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Fields Tab */}
          <TabsContent value="fields" className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Tổng số sân</p>
                  <p className="text-2xl font-bold">48</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Đang hoạt động</p>
                  <p className="text-2xl font-bold text-green-600">42</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                  <p className="text-2xl font-bold text-yellow-600">4</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Bị từ chối</p>
                  <p className="text-2xl font-bold text-red-600">2</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Phân bố sân theo loại</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={bookingsByFieldType} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]}>
                      {bookingsByFieldType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Hiệu suất sân bãi</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {topFields.map((field, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{field.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {Math.round((field.bookings / 200) * 100)}% công suất
                      </span>
                    </div>
                    <Progress value={(field.bookings / 200) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Đặt sân theo ngày trong tuần</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklyBookings}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Legend
                        formatter={(value) => {
                          if (value === "completed") return "Hoàn thành"
                          if (value === "cancelled") return "Đã hủy"
                          return "Tổng"
                        }}
                      />
                      <Bar dataKey="completed" stackId="a" fill="#16a34a" />
                      <Bar dataKey="cancelled" stackId="a" fill="#dc2626" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Đặt sân theo khung giờ</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={bookingsByTime}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip
                        contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
                      />
                      <Bar dataKey="bookings" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Thống kê đặt sân</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-4">
                  <div className="text-center p-4 bg-muted/50 rounded-lg">
                    <p className="text-2xl font-bold">2,083</p>
                    <p className="text-sm text-muted-foreground">Tổng đặt sân</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">1,892</p>
                    <p className="text-sm text-muted-foreground">Hoàn thành</p>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">45</p>
                    <p className="text-sm text-muted-foreground">Chờ duyệt</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">68</p>
                    <p className="text-sm text-muted-foreground">Đã xác nhận</p>
                  </div>
                  <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <p className="text-2xl font-bold text-red-600">78</p>
                    <p className="text-sm text-muted-foreground">Đã hủy</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tỷ lệ hoàn thành</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Tỷ lệ hoàn thành</span>
                  <span className="font-bold text-green-600">90.8%</span>
                </div>
                <Progress value={90.8} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Hoàn thành: 1,892</span>
                  <span>Đã hủy: 78</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
