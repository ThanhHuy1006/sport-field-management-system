"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { TrendingUp, Users, Calendar, DollarSign, Settings, Plus, ArrowLeft } from "lucide-react"

const revenueData = [
  { month: "Jan", revenue: 12000000, bookings: 24 },
  { month: "Feb", revenue: 15000000, bookings: 30 },
  { month: "Mar", revenue: 18000000, bookings: 36 },
  { month: "Apr", revenue: 16000000, bookings: 32 },
  { month: "May", revenue: 20000000, bookings: 40 },
  { month: "Jun", revenue: 22000000, bookings: 44 },
]

const bookingTrend = [
  { day: "Mon", bookings: 8 },
  { day: "Tue", bookings: 12 },
  { day: "Wed", bookings: 10 },
  { day: "Thu", bookings: 14 },
  { day: "Fri", bookings: 18 },
  { day: "Sat", bookings: 22 },
  { day: "Sun", bookings: 16 },
]

export default function OwnerDashboard() {
  const stats = [
    { label: "Total Revenue", value: "132,000,000 VND", icon: DollarSign, color: "text-green-600" },
    { label: "Total Bookings", value: "206", icon: Calendar, color: "text-blue-600" },
    { label: "Active Fields", value: "3", icon: TrendingUp, color: "text-purple-600" },
    { label: "Total Customers", value: "145", icon: Users, color: "text-orange-600" },
  ]

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Owner Dashboard</h1>
          <Link href="/owner/settings">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <Card key={idx} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-muted-foreground">{stat.label}</h3>
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              </Card>
            )
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M VND`} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" name="Revenue" />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* Bookings Chart */}
          <Card className="p-6">
            <h2 className="text-lg font-bold mb-4">Weekly Bookings</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="bookings" fill="#3b82f6" name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/owner/fields">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Manage Fields</h3>
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">Add, edit, or remove your sports fields</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Fields
              </Button>
            </Card>
          </Link>

          <Link href="/owner/bookings">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Manage Bookings</h3>
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">View and manage customer bookings</p>
              <Button variant="outline" className="w-full bg-transparent">
                View Bookings
              </Button>
            </Card>
          </Link>

          <Link href="/owner/pricing">
            <Card className="p-6 hover:shadow-lg transition cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Pricing & Hours</h3>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <p className="text-muted-foreground mb-4">Set prices and operating hours</p>
              <Button variant="outline" className="w-full bg-transparent">
                Manage
              </Button>
            </Card>
          </Link>
        </div>
      </div>
    </main>
  )
}
