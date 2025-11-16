"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { CalendarIcon, ChevronLeft, ChevronRight, ArrowLeft, MapPin, Search, User, Clock } from "lucide-react"
import Link from "next/link"

// Mock data
const allOwners = [
  { id: 1, name: "Nguyễn Văn X", location: "Quận 2" },
  { id: 2, name: "Trần Thị Y", location: "Quận 7" },
  { id: 3, name: "Lê Văn Z", location: "Bình Thạnh" },
]

const allFields = [
  { id: 1, name: "Sân Bóng Đá Thảo Điền", type: "Football", owner: "Nguyễn Văn X", ownerId: 1, location: "Quận 2" },
  { id: 2, name: "Sân Bóng Rổ Quận 7", type: "Basketball", owner: "Trần Thị Y", ownerId: 2, location: "Quận 7" },
  { id: 3, name: "Sân Tennis Bình Thạnh", type: "Tennis", owner: "Lê Văn Z", ownerId: 3, location: "Bình Thạnh" },
]

const mockBookings = [
  {
    id: 1,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-01-20",
    startTime: "08:00",
    customerName: "Nguyễn Văn A",
    customerPhone: "0901234567",
    ownerName: "Nguyễn Văn X",
    ownerId: 1,
    status: "confirmed",
    duration: 2,
    price: 400000,
  },
  {
    id: 2,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-01-20",
    startTime: "14:00",
    customerName: "Trần Thị B",
    customerPhone: "0912345678",
    ownerName: "Nguyễn Văn X",
    ownerId: 1,
    status: "pending",
    duration: 2,
    price: 400000,
  },
]

const timeSlots = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
]

export default function AdminSchedulePage() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedLocation, setSelectedLocation] = useState<string>("all")
  const [selectedOwner, setSelectedOwner] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFieldId, setSelectedFieldId] = useState<number | null>(null)

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
  }

  const formatDateISO = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const previousDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() - 1)
    setSelectedDate(newDate)
  }

  const nextDay = () => {
    const newDate = new Date(selectedDate)
    newDate.setDate(selectedDate.getDate() + 1)
    setSelectedDate(newDate)
  }

  const goToToday = () => {
    setSelectedDate(new Date())
  }

  const filteredBookings = mockBookings.filter((booking) => {
    const matchesDate = booking.date === formatDateISO(selectedDate)
    const matchesOwner = selectedOwner === "all" || booking.ownerId === Number.parseInt(selectedOwner)
    const matchesField = selectedFieldId === null || booking.fieldId === selectedFieldId
    return matchesDate && matchesOwner && matchesField
  })

  const filteredFields = allFields.filter((field) => {
    const matchesLocation = selectedLocation === "all" || field.location === selectedLocation
    const matchesOwner = selectedOwner === "all" || field.ownerId === Number.parseInt(selectedOwner)
    const matchesSearch = searchQuery === "" || field.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesLocation && matchesOwner && matchesSearch
  })

  const totalRevenue = filteredBookings.reduce((sum, b) => sum + b.price, 0)
  const totalBookings = filteredBookings.length
  const pendingBookings = filteredBookings.filter((b) => b.status === "pending").length

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-600 border-green-500/20"
      case "pending":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận"
      case "pending":
        return "Chờ duyệt"
      case "completed":
        return "Hoàn thành"
      default:
        return status
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/admin/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Lịch Hệ Thống</h1>
              <p className="text-sm text-muted-foreground">Xem và quản lý lịch đặt sân</p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/admin/bookings">Quản Lý Đặt Sân</Link>
            </Button>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center gap-2 mb-4">
            <Button variant="outline" size="icon" onClick={previousDay}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="min-w-[280px] text-center">
              <div className="font-semibold">{formatDate(selectedDate)}</div>
            </div>
            <Button variant="outline" size="icon" onClick={nextDay}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" onClick={goToToday}>
              Hôm nay
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Khu vực" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khu vực</SelectItem>
                <SelectItem value="Quận 1">Quận 1</SelectItem>
                <SelectItem value="Quận 2">Quận 2</SelectItem>
                <SelectItem value="Quận 7">Quận 7</SelectItem>
                <SelectItem value="Bình Thạnh">Bình Thạnh</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedOwner} onValueChange={setSelectedOwner}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Chủ sân" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả chủ sân</SelectItem>
                {allOwners.map((owner) => (
                  <SelectItem key={owner.id} value={owner.id.toString()}>
                    {owner.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedFieldId?.toString() || "all"}
              onValueChange={(v) => setSelectedFieldId(v === "all" ? null : Number.parseInt(v))}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Chọn sân" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả sân</SelectItem>
                {filteredFields.map((field) => (
                  <SelectItem key={field.id} value={field.id.toString()}>
                    {field.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tổng Đặt Sân</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBookings}</div>
              {pendingBookings > 0 && (
                <Link href="/admin/bookings" className="text-xs text-orange-600 mt-1 hover:underline inline-block">
                  {pendingBookings} chờ duyệt - Click để xem
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Doanh Thu</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">{totalRevenue.toLocaleString("vi-VN")}</div>
              <p className="text-xs text-muted-foreground mt-1">VNĐ</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sân Đang Xem</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{filteredFields.length}</div>
              <p className="text-xs text-muted-foreground mt-1">{selectedFieldId ? "1 sân được chọn" : "Tất cả sân"}</p>
            </CardContent>
          </Card>
        </div>

        {/* Bookings List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Danh Sách Đặt Sân
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredBookings.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>Không có đặt sân nào trong ngày này</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className={`p-4 rounded-lg border ${getStatusColor(booking.status)}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="font-semibold">{booking.startTime}</span>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{booking.duration}h</span>
                        </div>

                        <div className="font-semibold">{booking.fieldName}</div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="w-4 h-4" />
                          <span>{booking.customerName}</span>
                          <span>•</span>
                          <span>{booking.customerPhone}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          <span>Chủ sân: {booking.ownerName}</span>
                        </div>
                      </div>

                      <div className="text-right space-y-2">
                        <Badge variant="outline">{getStatusText(booking.status)}</Badge>
                        <div className="text-lg font-bold text-primary">{booking.price.toLocaleString("vi-VN")} ₫</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
