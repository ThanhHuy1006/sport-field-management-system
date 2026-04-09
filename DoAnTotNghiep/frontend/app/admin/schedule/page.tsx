"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { ScheduleManager, type Booking, type Field, type Owner } from "@/components/schedule-manager"

// Mock data - Owners
const allOwners: Owner[] = [
  { id: 1, name: "Nguyễn Văn X", fieldCount: 2 },
  { id: 2, name: "Trần Thị Y", fieldCount: 1 },
  { id: 3, name: "Lê Văn Z", fieldCount: 1 },
  { id: 4, name: "Phạm Văn W", fieldCount: 3 },
  { id: 5, name: "Hoàng Thị V", fieldCount: 2 },
]

// Mock data - Fields
const allFields: Field[] = [
  { id: 1, name: "Sân Bóng Đá Thảo Điền", type: "Football", pricePerHour: 300000, ownerName: "Nguyễn Văn X" },
  { id: 2, name: "Sân Bóng Rổ Quận 7", type: "Basketball", pricePerHour: 200000, ownerName: "Trần Thị Y" },
  { id: 3, name: "Sân Tennis Bình Thạnh", type: "Tennis", pricePerHour: 250000, ownerName: "Lê Văn Z" },
  { id: 4, name: "Sân Cầu Lông Quận 2", type: "Badminton", pricePerHour: 150000, ownerName: "Nguyễn Văn X" },
  { id: 5, name: "Sân Bóng Đá Quận 1", type: "Football", pricePerHour: 400000, ownerName: "Phạm Văn W" },
  { id: 6, name: "Sân Tennis Quận 1", type: "Tennis", pricePerHour: 300000, ownerName: "Phạm Văn W" },
  { id: 7, name: "Sân Bóng Rổ Quận 1", type: "Basketball", pricePerHour: 250000, ownerName: "Phạm Văn W" },
  { id: 8, name: "Sân Cầu Lông Quận 3", type: "Badminton", pricePerHour: 180000, ownerName: "Hoàng Thị V" },
  { id: 9, name: "Sân Bóng Đá Quận 3", type: "Football", pricePerHour: 350000, ownerName: "Hoàng Thị V" },
]

const today = new Date().toISOString().split("T")[0]

const mockBookings: Booking[] = [
  // Sân 1 - Sân Bóng Đá Thảo Điền (Owner 1)
  {
    id: 1,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-12-08",
    startTime: "06:00",
    endTime: "08:00",
    customerName: "Đội Bóng Sáng Sớm",
    customerPhone: "0901234567",
    ownerName: "Nguyễn Văn X",
    status: "confirmed",
    duration: 2,
    price: 600000,
  },
  {
    id: 2,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-12-08",
    startTime: "08:00",
    endTime: "10:00",
    customerName: "Nguyễn Văn A",
    customerPhone: "0912345678",
    ownerName: "Nguyễn Văn X",
    status: "confirmed",
    duration: 2,
    price: 600000,
  },
  {
    id: 3,
    fieldId: 1,
    fieldName: "Sân Bóng Đá Thảo Điền",
    date: "2025-12-08",
    startTime: "10:00",
    endTime: "12:00",
    customerName: "Lê Minh Khôi",
    customerPhone: "0923456789",
    ownerName: "Nguyễn Văn X",
    status: "pending",
    duration: 2,
    price: 600000,
  },
  // Sân 2 - Sân Bóng Rổ Quận 7 (Owner 2)
  {
    id: 4,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    date: "2025-12-08",
    startTime: "07:00",
    endTime: "09:00",
    customerName: "CLB Bóng Rổ Sunrise",
    customerPhone: "0978901234",
    ownerName: "Trần Thị Y",
    status: "confirmed",
    duration: 2,
    price: 400000,
  },
  {
    id: 5,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    date: "2025-12-08",
    startTime: "09:00",
    endTime: "11:00",
    customerName: "Phạm Văn D",
    customerPhone: "0989012345",
    ownerName: "Trần Thị Y",
    status: "confirmed",
    duration: 2,
    price: 400000,
  },
  {
    id: 6,
    fieldId: 2,
    fieldName: "Sân Bóng Rổ Quận 7",
    date: "2025-12-08",
    startTime: "13:00",
    endTime: "15:00",
    customerName: "Trường THPT ABC",
    customerPhone: "0990123456",
    ownerName: "Trần Thị Y",
    status: "pending",
    duration: 2,
    price: 400000,
  },
  // Sân 3 - Sân Tennis Bình Thạnh (Owner 3)
  {
    id: 7,
    fieldId: 3,
    fieldName: "Sân Tennis Bình Thạnh",
    date: "2025-12-08",
    startTime: "06:00",
    endTime: "08:00",
    customerName: "Huỳnh Thanh Tùng",
    customerPhone: "0934567803",
    ownerName: "Lê Văn Z",
    status: "confirmed",
    duration: 2,
    price: 500000,
  },
  {
    id: 8,
    fieldId: 3,
    fieldName: "Sân Tennis Bình Thạnh",
    date: "2025-12-08",
    startTime: "08:00",
    endTime: "10:00",
    customerName: "CLB Tennis Ladies",
    customerPhone: "0945678904",
    ownerName: "Lê Văn Z",
    status: "confirmed",
    duration: 2,
    price: 500000,
  },
  // Sân 4 - Sân Cầu Lông Quận 2 (Owner 1)
  {
    id: 9,
    fieldId: 4,
    fieldName: "Sân Cầu Lông Quận 2",
    date: "2025-12-08",
    startTime: "07:00",
    endTime: "09:00",
    customerName: "Ngô Thị E",
    customerPhone: "0956789012",
    ownerName: "Nguyễn Văn X",
    status: "completed",
    duration: 2,
    price: 300000,
  },
  {
    id: 10,
    fieldId: 4,
    fieldName: "Sân Cầu Lông Quận 2",
    date: "2025-12-08",
    startTime: "14:00",
    endTime: "16:00",
    customerName: "Đặng Văn F",
    customerPhone: "0967890123",
    ownerName: "Nguyễn Văn X",
    status: "pending",
    duration: 2,
    price: 300000,
  },
  // Sân 5 - Sân Bóng Đá Quận 1 (Owner 4)
  {
    id: 11,
    fieldId: 5,
    fieldName: "Sân Bóng Đá Quận 1",
    date: "2025-12-08",
    startTime: "16:00",
    endTime: "18:00",
    customerName: "FC Youth Stars",
    customerPhone: "0978901234",
    ownerName: "Phạm Văn W",
    status: "confirmed",
    duration: 2,
    price: 800000,
  },
  {
    id: 12,
    fieldId: 5,
    fieldName: "Sân Bóng Đá Quận 1",
    date: "2025-12-08",
    startTime: "18:00",
    endTime: "20:00",
    customerName: "Công ty ABC",
    customerPhone: "0989012345",
    ownerName: "Phạm Văn W",
    status: "pending_reschedule",
    duration: 2,
    price: 800000,
    rescheduleRequest: {
      oldDate: "2025-12-07",
      oldTime: "18:00",
      newDate: "2025-12-08",
      newTime: "18:00",
      requestedAt: "2025-12-06T14:30:00Z",
    },
  },
  // Sân 6 - Sân Tennis Quận 1 (Owner 4)
  {
    id: 13,
    fieldId: 6,
    fieldName: "Sân Tennis Quận 1",
    date: "2025-12-08",
    startTime: "09:00",
    endTime: "11:00",
    customerName: "Trần Minh G",
    customerPhone: "0990123456",
    ownerName: "Phạm Văn W",
    status: "confirmed",
    duration: 2,
    price: 600000,
  },
  // Sân 7 - Sân Bóng Rổ Quận 1 (Owner 4)
  {
    id: 14,
    fieldId: 7,
    fieldName: "Sân Bóng Rổ Quận 1",
    date: "2025-12-08",
    startTime: "15:00",
    endTime: "17:00",
    customerName: "CLB Bóng Rổ Q1",
    customerPhone: "0901234567",
    ownerName: "Phạm Văn W",
    status: "completed",
    duration: 2,
    price: 500000,
  },
  // Sân 8 - Sân Cầu Lông Quận 3 (Owner 5)
  {
    id: 15,
    fieldId: 8,
    fieldName: "Sân Cầu Lông Quận 3",
    date: "2025-12-08",
    startTime: "08:00",
    endTime: "10:00",
    customerName: "Lê Thị H",
    customerPhone: "0912345678",
    ownerName: "Hoàng Thị V",
    status: "confirmed",
    duration: 2,
    price: 360000,
  },
  {
    id: 16,
    fieldId: 8,
    fieldName: "Sân Cầu Lông Quận 3",
    date: "2025-12-08",
    startTime: "17:00",
    endTime: "19:00",
    customerName: "Nguyễn Văn I",
    customerPhone: "0923456789",
    ownerName: "Hoàng Thị V",
    status: "pending",
    duration: 2,
    price: 360000,
  },
  // Sân 9 - Sân Bóng Đá Quận 3 (Owner 5)
  {
    id: 17,
    fieldId: 9,
    fieldName: "Sân Bóng Đá Quận 3",
    date: "2025-12-08",
    startTime: "06:00",
    endTime: "08:00",
    customerName: "Đội Bóng Q3",
    customerPhone: "0934567890",
    ownerName: "Hoàng Thị V",
    status: "confirmed",
    duration: 2,
    price: 700000,
  },
  {
    id: 18,
    fieldId: 9,
    fieldName: "Sân Bóng Đá Quận 3",
    date: "2025-12-08",
    startTime: "19:00",
    endTime: "21:00",
    customerName: "FC Sunday Night",
    customerPhone: "0945678901",
    ownerName: "Hoàng Thị V",
    status: "confirmed",
    duration: 2,
    price: 700000,
  },
]

export default function AdminSchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 hover:bg-muted rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Quản Lý Đặt Sân</h1>
            <p className="text-muted-foreground">Xem tổng quan tất cả đơn đặt sân trong hệ thống</p>
          </div>
        </div>
      </div>

      {/* Schedule Manager Component */}
      <ScheduleManager bookings={mockBookings} fields={allFields} owners={allOwners} isAdmin={true} />
    </div>
  )
}
