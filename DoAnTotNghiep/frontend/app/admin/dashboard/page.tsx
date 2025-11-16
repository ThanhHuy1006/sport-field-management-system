"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Users, MapPin, Calendar, DollarSign, AlertCircle, Settings, ArrowLeft, CalendarDays, Star } from 'lucide-react'

const platformStats = [
  { label: "Total Users", value: "2,450", icon: Users, color: "text-blue-600" },
  { label: "Active Fields", value: "156", icon: MapPin, color: "text-green-600" },
  { label: "Total Bookings", value: "8,234", icon: Calendar, color: "text-purple-600" },
  { label: "Platform Revenue", value: "2.5B VND", icon: DollarSign, color: "text-orange-600" },
]

const revenueData = [
  { month: "Jan", revenue: 180000000, bookings: 450 },
  { month: "Feb", revenue: 220000000, bookings: 550 },
  { month: "Mar", revenue: 280000000, bookings: 700 },
  { month: "Apr", revenue: 320000000, bookings: 800 },
  { month: "May", revenue: 380000000, bookings: 950 },
  { month: "Jun", revenue: 420000000, bookings: 1050 },
]

const userDistribution = [
  { name: "Customers", value: 2000, fill: "#3b82f6" },
  { name: "Field Owners", value: 450, fill: "#10b981" },
]

export default function AdminDashboard() {
  const flaggedReviewsCount = 3

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alert */}
        <Link href="/admin/approvals">
          <Card className="p-4 mb-8 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition cursor-pointer">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600" />
              <div className="flex-1">
                <p className="font-medium text-yellow-900">System Alert</p>
                <p className="text-sm text-yellow-800">3 pending field approvals require your attention</p>
              </div>
              <Button variant="ghost" size="sm" className="text-yellow-900">
                Review Now
              </Button>
            </div>
          </Card>
        </Link>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Link href="/admin/users">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">2,450</p>
            </Card>
          </Link>

          <Link href="/admin/fields">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Active Fields</h3>
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">156</p>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Total Bookings</h3>
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-foreground">8,234</p>
            </Card>
          </Link>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">Platform Revenue</h3>
              <DollarSign className="w-5 h-5 text-orange-600" />
            </div>
            <p className="text-2xl font-bold text-foreground">2.5B VND</p>
          </Card>

          {/* Reviews stat card with flagged indicator */}
          <Link href="/admin/reviews">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-muted-foreground">Reviews</h3>
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  {flaggedReviewsCount > 0 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full dark:bg-red-900/30 dark:text-red-400">
                      {flaggedReviewsCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-foreground">4.3</p>
                <span className="text-sm text-muted-foreground">average</span>
              </div>
            </Card>
          </Link>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="p-6 lg:col-span-2">
            <h2 className="text-lg font-bold mb-4">Platform Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(0)}M VND`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* User Distribution */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">User Distribution</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Bookings Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-lg font-bold mb-4">Monthly Bookings</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link href="/admin/schedule">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer border-2 border-primary/20">
              <CalendarDays className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">View Schedule</h3>
              <p className="text-sm text-muted-foreground">Daily booking schedule</p>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <Users className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Manage Users</h3>
              <p className="text-sm text-muted-foreground">View and manage all users</p>
            </Card>
          </Link>

          <Link href="/admin/fields">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <MapPin className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Manage Fields</h3>
              <p className="text-sm text-muted-foreground">Approve and manage fields</p>
            </Card>
          </Link>

          <Link href="/admin/bookings">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <Calendar className="w-8 h-8 text-primary mb-3" />
              <h3 className="font-bold mb-2">Manage Bookings</h3>
              <p className="text-sm text-muted-foreground">View all bookings</p>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
