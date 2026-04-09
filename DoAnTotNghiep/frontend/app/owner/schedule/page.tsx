"use client"

import Link from "next/link"
import { ScheduleManager, type Booking, type Field } from "@/components/schedule-manager"

// Mock data for owner's fields
const ownerFields: Field[] = [
  { id: 1, name: "Sân Bóng Đá Thảo Điền", type: "Football", pricePerHour: 300000 },
  { id: 2, name: "Sân Bóng Rổ Quận 7", type: "Basketball", pricePerHour: 200000 },
  { id: 3, name: "Sân Tennis Bình Thạnh", type: "Tennis", pricePerHour: 250000 },
]

// Mock bookings data
const mockBookings: Booking[] = [
  {
    id: 1,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    customerName: "Đội Bóng Sáng Sớm",
    customerPhone: "0901234567",
    date: "2025-12-08",
    startTime: "06:00",
    endTime: "08:00",
    duration: 2,
    price: 600000,
    status: "confirmed",
  },
  {
    id: 2,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    customerName: "Nguyễn Văn A",
    customerPhone: "0912345678",
    date: "2025-12-08",
    startTime: "08:00",
    endTime: "10:00",
    duration: 2,
    price: 600000,
    status: "confirmed",
  },
  {
    id: 3,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    customerName: "Lê Minh Khôi",
    customerPhone: "0923456789",
    date: "2025-12-08",
    startTime: "10:00",
    endTime: "12:00",
    duration: 2,
    price: 600000,
    status: "pending",
  },
  {
    id: 4,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    customerName: "CLB Bóng Rổ Sunrise",
    customerPhone: "0978901234",
    date: "2025-12-08",
    startTime: "07:00",
    endTime: "09:00",
    duration: 2,
    price: 400000,
    status: "confirmed",
  },
  {
    id: 5,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    customerName: "Phạm Văn D",
    customerPhone: "0989012345",
    date: "2025-12-08",
    startTime: "09:00",
    endTime: "11:00",
    duration: 2,
    price: 400000,
    status: "confirmed",
  },
  {
    id: 6,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    customerName: "Trường THPT ABC",
    customerPhone: "0990123456",
    date: "2025-12-08",
    startTime: "13:00",
    endTime: "15:00",
    duration: 2,
    price: 400000,
    status: "pending",
  },
  {
    id: 7,
    fieldId: 3,
    fieldName: "Sân Tennis Bình Thạnh",
    customerName: "Huỳnh Thanh Tùng",
    customerPhone: "0934567803",
    date: "2025-12-08",
    startTime: "06:00",
    endTime: "08:00",
    duration: 2,
    price: 500000,
    status: "confirmed",
  },
  {
    id: 8,
    fieldId: 3,
    fieldName: "Sân Tennis Bình Thạnh",
    customerName: "CLB Tennis Ladies",
    customerPhone: "0945678904",
    date: "2025-12-08",
    startTime: "08:00",
    endTime: "10:00",
    duration: 2,
    price: 500000,
    status: "confirmed",
  },
  {
    id: 9,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    customerName: "Trần Văn B",
    customerPhone: "0956789012",
    date: "2025-12-09",
    startTime: "14:00",
    endTime: "16:00",
    duration: 2,
    price: 600000,
    status: "pending",
  },
  {
    id: 10,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    customerName: "Võ Thị C",
    customerPhone: "0967890123",
    date: "2025-12-09",
    startTime: "17:00",
    endTime: "19:00",
    duration: 2,
    price: 400000,
    status: "pending_reschedule",
    rescheduleRequest: {
      oldDate: "2025-12-08",
      oldTime: "17:00",
      newDate: "2025-12-09",
      newTime: "17:00",
      requestedAt: "2025-12-07T10:30:00Z",
    },
  },
  {
    id: 11,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    customerName: "Nguyễn Hoàng Nam",
    customerPhone: "0912345000",
    date: "2025-12-08",
    startTime: "18:00",
    endTime: "20:00",
    duration: 2,
    price: 600000,
    status: "completed",
  },
  {
    id: 12,
    fieldId: 3,
    fieldName: "Sân Tennis Bình Thạnh",
    customerName: "Trần Minh Tuấn",
    customerPhone: "0923456000",
    date: "2025-12-08",
    startTime: "14:00",
    endTime: "16:00",
    duration: 2,
    price: 500000,
    status: "rejected",
    rejectionReason: "Sân đang bảo trì trong khung giờ này",
  },
]

export default function OwnerSchedulePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/owner/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Quản lý đặt sân</span>
          </div>
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Quản Lý Đặt Sân</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ScheduleManager bookings={mockBookings} fields={ownerFields} isAdmin={false} />
      </div>
    </main>
  )
}
