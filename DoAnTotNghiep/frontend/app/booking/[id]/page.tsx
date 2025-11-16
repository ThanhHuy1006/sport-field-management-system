"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, MapPin, Clock, Calendar, AlertCircle, Tag } from 'lucide-react'
import { useToast } from "@/hooks/use-toast"

function generateAvailableSlots(operatingHours = { open: "06:00", close: "22:00" }) {
  const slots: Record<string, string[]> = {}
  const today = new Date()

  for (let i = 0; i < 30; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    const dayOfWeek = date.getDay()

    // Generate hourly slots between operating hours
    const openHour = Number.parseInt(operatingHours.open.split(":")[0])
    const closeHour = Number.parseInt(operatingHours.close.split(":")[0])

    const daySlots: string[] = []

    // If it's today, filter out past hours
    const isToday = i === 0
    const currentHour = isToday ? new Date().getHours() : 0

    for (let hour = openHour; hour < closeHour; hour++) {
      if (isToday && hour <= currentHour) {
        continue // Skip past hours
      }
      daySlots.push(`${hour.toString().padStart(2, "0")}:00`)
    }

    // Weekend has all slots, weekday might have fewer bookings in mock data
    // But all slots are generated based on operating hours
    slots[dateStr] = daySlots
  }

  return slots
}

const mockBookedSlots: Record<string, string[]> = {
  "2025-01-20": ["18:00", "19:00"],
  "2025-01-21": ["10:00", "14:00", "15:00"],
}

const mockFieldDetails = {
  1: {
    name: "Green Valley Soccer Field",
    location: "District 1, HCMC",
    price: 500000,
    operatingHours: { open: "06:00", close: "22:00" },
    availableSlots: generateAvailableSlots({ open: "06:00", close: "22:00" }),
    image: "/soccer-field.png",
  },
}

export default function BookingPage({ params }: { params: { id: string } }) {
  const { toast } = useToast()
  const field = mockFieldDetails[params.id as keyof typeof mockFieldDetails]
  const [step, setStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    date: "",
    time: "",
    duration: "1",
    fullName: "",
    email: "",
    phone: "",
    notes: "",
    paymentMethod: "bank",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [bookingId, setBookingId] = useState<string>("")
  const [voucherCode, setVoucherCode] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null)
  const [voucherError, setVoucherError] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}
    if (!bookingData.date) newErrors.date = "Vui lòng chọn ngày"
    if (!bookingData.time) newErrors.time = "Vui lòng chọn giờ"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {}
    if (!bookingData.fullName) newErrors.fullName = "Vui lòng nhập họ tên"
    if (!bookingData.email) {
      newErrors.email = "Vui lòng nhập email"
    } else if (!/\S+@\S+\.\S+/.test(bookingData.email)) {
      newErrors.email = "Email không hợp lệ"
    }
    if (!bookingData.phone) {
      newErrors.phone = "Vui lòng nhập số điện thoại"
    } else if (!/^\+?[\d\s-]{10,}$/.test(bookingData.phone)) {
      newErrors.phone = "Số điện thoại không hợp lệ"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNextStep = (nextStep: number) => {
    if (step === 1 && !validateStep1()) return
    if (step === 2 && !validateStep2()) return
    setStep(nextStep)
  }

  const getAvailableSlots = () => {
    if (!bookingData.date) return []

    const allSlots = field?.availableSlots[bookingData.date] || []
    const bookedSlots = mockBookedSlots[bookingData.date] || []
    const duration = Number.parseInt(bookingData.duration || "1")

    // Filter slots that are either booked or would overlap with booking duration
    return allSlots.filter((slot) => {
      // Check if slot itself is booked
      if (bookedSlots.includes(slot)) return false

      // Check if duration would overlap with booked slots
      const slotHour = Number.parseInt(slot.split(":")[0])
      for (let i = 1; i < duration; i++) {
        const nextHour = slotHour + i
        const nextSlot = `${nextHour.toString().padStart(2, "0")}:00`
        if (bookedSlots.includes(nextSlot)) return false
      }

      return true
    })
  }

  const availableSlots = getAvailableSlots()

  const totalPrice = Number.parseInt(bookingData.duration || "1") * (field?.price || 0)

  const applyVoucher = () => {
    setVoucherError("")
    
    // Mock voucher validation
    const mockVouchers = [
      { code: "SUMMER2024", type: "percentage", value: 20, minAmount: 500000, maxDiscount: 200000 },
      { code: "NEWUSER50", type: "fixed", value: 50000, minAmount: 200000 },
      { code: "FREEHOUR", type: "free_hours", value: 1, minAmount: 1000000 },
    ]

    const voucher = mockVouchers.find(v => v.code === voucherCode.toUpperCase())
    
    if (!voucher) {
      setVoucherError("Mã voucher không hợp lệ")
      return
    }

    const totalAmount = Number.parseInt(bookingData.duration || "1") * (field?.price || 0)
    
    if (voucher.minAmount && totalAmount < voucher.minAmount) {
      setVoucherError(`Đơn hàng tối thiểu ${voucher.minAmount.toLocaleString()}đ`)
      return
    }

    setAppliedVoucher(voucher)
    toast({
      title: "Áp dụng voucher thành công",
      description: `Mã ${voucher.code} đã được áp dụng`,
    })
  }

  const removeVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode("")
    toast({
      title: "Đã xóa voucher",
    })
  }

  const calculateDiscount = () => {
    if (!appliedVoucher) return 0
    
    const totalAmount = Number.parseInt(bookingData.duration || "1") * (field?.price || 0)
    
    if (appliedVoucher.type === "percentage") {
      const discount = totalAmount * (appliedVoucher.value / 100)
      return appliedVoucher.maxDiscount ? Math.min(discount, appliedVoucher.maxDiscount) : discount
    }
    
    if (appliedVoucher.type === "fixed") {
      return appliedVoucher.value
    }
    
    return 0
  }

  const discount = calculateDiscount()
  const finalAmount = totalPrice - discount + 50000

  const createBooking = () => {
    const newBookingId = `BK-${Date.now()}`
    setBookingId(newBookingId)

    // Store booking data in localStorage for payment page
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `booking-${newBookingId}`,
        JSON.stringify({
          bookingId: newBookingId,
          fieldId: params.id,
          fieldName: field?.name,
          fieldImage: field?.image,
          fieldLocation: field?.location,
          date: bookingData.date,
          time: bookingData.time,
          duration: bookingData.duration,
          fullName: bookingData.fullName,
          email: bookingData.email,
          phone: bookingData.phone,
          notes: bookingData.notes,
          paymentMethod: bookingData.paymentMethod,
          totalAmount: finalAmount,
          status: "pending_payment",
          createdAt: new Date().toISOString(),
        }),
      )
    }

    return newBookingId
  }

  if (!field) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sân</h1>
          <Link href="/">
            <Button className="mt-4">Về trang chủ</Button>
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/field/${params.id}`} className="text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Hoàn tất đặt sân</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="max-w-2xl mx-auto mb-12">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Ngày & Giờ" },
              { num: 2, label: "Thông tin" },
              { num: 3, label: "Thanh toán" },
              { num: 4, label: "Xác nhận" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center flex-1">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                      s.num <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s.num < step ? <Check className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="text-xs mt-2 text-muted-foreground hidden md:block">{s.label}</span>
                </div>
                {idx < 3 && (
                  <div className={`flex-1 h-1 mx-2 transition ${s.num < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Chọn ngày & giờ</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Ngày
                    </label>
                    <Input
                      type="date"
                      name="date"
                      value={bookingData.date}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className={errors.date ? "border-red-500" : ""}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Giờ bắt đầu
                    </label>
                    {bookingData.date ? (
                      availableSlots.length > 0 ? (
                        <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                          {availableSlots.map((slot) => {
                            const isBooked = mockBookedSlots[bookingData.date]?.includes(slot)

                            return (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => {
                                  if (!isBooked) {
                                    setBookingData((prev) => ({ ...prev, time: slot }))
                                    if (errors.time) setErrors((prev) => ({ ...prev, time: "" }))
                                  }
                                }}
                                disabled={isBooked}
                                className={`px-4 py-3 rounded-lg border transition font-medium ${
                                  isBooked
                                    ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
                                    : bookingData.time === slot
                                      ? "bg-primary text-white border-primary"
                                      : "bg-background border-border hover:border-primary hover:bg-muted"
                                }`}
                              >
                                {slot}
                                {isBooked && <span className="block text-xs">Đã đặt</span>}
                              </button>
                            )
                          })}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm bg-muted p-4 rounded-lg">
                          Không có khung giờ nào khả dụng cho ngày này
                        </p>
                      )
                    ) : (
                      <p className="text-muted-foreground text-sm bg-muted p-4 rounded-lg">Vui lòng chọn ngày trước</p>
                    )}
                    {errors.time && (
                      <p className="text-sm text-red-500 mt-2 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.time}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Thời lượng</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["1", "2", "3", "4"].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setBookingData((prev) => ({ ...prev, duration: dur }))}
                          className={`px-4 py-3 rounded-lg border transition font-medium ${
                            bookingData.duration === dur
                              ? "bg-primary text-white border-primary"
                              : "bg-background border-border hover:border-primary hover:bg-muted"
                          }`}
                        >
                          {dur} giờ
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={() => handleNextStep(2)} className="w-full">
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <Card className="p-6 md:p-8">
                <h2 className="text-2xl font-bold mb-6">Thông tin của bạn</h2>
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Họ và tên *</label>
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Nguyễn Văn A"
                      value={bookingData.fullName}
                      onChange={handleChange}
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email *</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="nguyenvana@example.com"
                      value={bookingData.email}
                      onChange={handleChange}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại *</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="0123456789"
                      value={bookingData.phone}
                      onChange={handleChange}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Yêu cầu đặc biệt (Tùy chọn)
                    </label>
                    <textarea
                      name="notes"
                      placeholder="Ghi chú hoặc yêu cầu đặc biệt..."
                      value={bookingData.notes}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground min-h-[100px]"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Quay lại
                    </Button>
                    <Button onClick={() => handleNextStep(3)} className="flex-1">
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Voucher Input Section */}
                <Card className="p-6 md:p-8">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-primary" />
                    Mã Giảm Giá
                  </h3>
                  {!appliedVoucher ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập mã voucher (VD: SUMMER2024)"
                          value={voucherCode}
                          onChange={(e) => {
                            setVoucherCode(e.target.value.toUpperCase())
                            setVoucherError("")
                          }}
                          className="flex-1"
                        />
                        <Button onClick={applyVoucher} disabled={!voucherCode}>
                          Áp dụng
                        </Button>
                      </div>
                      {voucherError && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {voucherError}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Nhập mã voucher để nhận ưu đãi giảm giá
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                      <div>
                        <p className="font-semibold text-green-700 dark:text-green-400">
                          {appliedVoucher.code}
                        </p>
                        <p className="text-sm text-green-600 dark:text-green-500">
                          Giảm {discount.toLocaleString()}đ
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={removeVoucher}>
                        Xóa
                      </Button>
                    </div>
                  )}
                </Card>

                <Card className="p-6 md:p-8">
                  <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>
                  <div className="space-y-3 mb-8">
                    {[
                      {
                        id: "bank",
                        label: "Chuyển khoản ngân hàng",
                        icon: "🏦",
                        desc: "Chuyển khoản qua ngân hàng (Sẽ gửi thông tin tài khoản)",
                      },
                      { id: "field", label: "Thanh toán tại sân", icon: "💵", desc: "Thanh toán trực tiếp khi đến sân" },
                    ].map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${
                          bookingData.paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={bookingData.paymentMethod === method.id}
                          onChange={handleChange}
                          className="w-4 h-4 text-primary"
                        />
                        <span className="ml-3 text-2xl">{method.icon}</span>
                        <div className="ml-3 flex-1">
                          <div className="font-medium text-foreground">{method.label}</div>
                          <div className="text-sm text-muted-foreground">{method.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>

                  {bookingData.paymentMethod === "bank" && (
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 p-4 rounded-lg mb-6">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Thông tin chuyển khoản:</h4>
                      <div className="space-y-2 text-sm text-blue-800 dark:text-blue-200">
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">Ngân hàng:</span>
                          <span className="font-medium">Vietcombank</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">Số tài khoản:</span>
                          <span className="font-medium">1234567890</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-700 dark:text-blue-300">Chủ tài khoản:</span>
                          <span className="font-medium">CÔNG TY TNHH ĐẶT SÂN</span>
                        </div>
                        <div className="flex flex-col gap-1 pt-2 border-t border-blue-200 dark:border-blue-800">
                          <span className="text-blue-700 dark:text-blue-300">Nội dung chuyển khoản:</span>
                          <span className="font-mono font-bold bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded">
                            DATSANBK001234
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {bookingData.paymentMethod === "field" && (
                    <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 p-4 rounded-lg mb-6">
                      <p className="text-sm text-green-800 dark:text-green-200">
                        <strong>Lưu ý:</strong> Vui lòng chuẩn bị tiền mặt và thanh toán khi đến sân. Giữ lại mã đặt sân
                        để xuất trình cho nhân viên.
                      </p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Quay lại
                    </Button>
                    <Button
                      onClick={() => {
                        const newBookingId = createBooking()

                        if (bookingData.paymentMethod === "bank") {
                          window.location.href = `/payment/${newBookingId}`
                        } else {
                          setBookingId(newBookingId)
                          setStep(4)
                        }
                      }}
                      className="flex-1"
                    >
                      {bookingData.paymentMethod === "bank" ? "Tiếp tục thanh toán" : "Xác nhận đặt sân"}
                    </Button>
                  </div>
                </Card>
              </div>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <Card className="p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <h2 className="text-3xl font-bold text-foreground mb-2">Đơn đặt sân đang chờ xác nhận</h2>
                  <p className="text-muted-foreground">Chủ sân sẽ xác nhận đơn của bạn trong vòng 24 giờ</p>
                </div>

                <div className="bg-muted p-6 rounded-lg mb-6 space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <span className="text-muted-foreground">Mã đặt sân</span>
                    <span className="font-bold text-lg">#{bookingId || "BK-2025-001234"}</span>
                  </div>
                  <div className="flex items-center justify-center gap-3 py-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                    <span className="font-medium text-yellow-700 dark:text-yellow-400">Đang chờ chủ sân xác nhận</span>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Sân</span>
                      <span className="font-medium text-right">{field.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Ngày & Giờ</span>
                      <span className="font-medium">
                        {bookingData.date} lúc {bookingData.time}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Thời lượng</span>
                      <span className="font-medium">{bookingData.duration} giờ</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Email xác nhận</span>
                      <span className="font-medium text-right">{bookingData.email}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Quy trình tiếp theo:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Đơn đặt sân đã được gửi</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Bạn sẽ nhận email xác nhận</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Chờ chủ sân xác nhận</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Thời gian dự kiến: 2-24 giờ</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-200 border-2 border-blue-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-xs text-blue-700">3</span>
                      </div>
                      <div>
                        <p className="font-medium text-blue-900 dark:text-blue-100">Nhận xác nhận cuối cùng</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Email thông báo khi được duyệt</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 p-4 rounded-lg mb-6">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Lưu ý:</strong> Đơn đặt sân của bạn chưa được xác nhận. Vui lòng chờ email xác nhận từ chủ
                    sân trước khi đến sân. Nếu không nhận được phản hồi sau 24 giờ, vui lòng liên hệ hỗ trợ.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Link href="/" className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Về trang chủ
                    </Button>
                  </Link>
                  <Link href="/bookings" className="flex-1">
                    <Button className="w-full">Xem đơn đặt sân</Button>
                  </Link>
                </div>
              </Card>
            )}
          </div>

          {/* Booking Summary - Sticky Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-4">Tóm tắt đặt sân</h3>

              <img
                src={field.image || "/placeholder.svg"}
                alt={field.name}
                className="w-full h-32 object-cover rounded-lg mb-4"
              />

              <div className="space-y-3 pb-4 border-b border-border mb-4">
                <div>
                  <h4 className="font-bold text-foreground mb-1">{field.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {field.location}
                  </div>
                </div>

                {bookingData.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {bookingData.date}
                      {bookingData.time && ` - ${bookingData.time}`}
                    </span>
                  </div>
                )}

                {bookingData.duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="font-medium">{bookingData.duration} giờ</span>
                  </div>
                )}
              </div>

              <div className="space-y-2 pb-4 border-b border-border mb-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giá mỗi giờ</span>
                  <span className="font-medium">{field.price.toLocaleString()} ₫</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Số giờ</span>
                  <span className="font-medium">{bookingData.duration} giờ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-medium">{totalPrice.toLocaleString()} ₫</span>
                </div>
                {appliedVoucher && discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Giảm giá ({appliedVoucher.code})
                    </span>
                    <span className="font-medium">-{discount.toLocaleString()} ₫</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-medium">50,000 ₫</span>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-bold text-foreground">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{finalAmount.toLocaleString()} ₫</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
