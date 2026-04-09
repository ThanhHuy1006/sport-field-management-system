"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Check,
  MapPin,
  Clock,
  CalendarIcon,
  AlertCircle,
  Tag,
  CheckCircle2,
  XCircle,
  Info,
  Repeat,
  CalendarDays,
  CreditCard,
  Building2,
  Smartphone,
  QrCode,
  Banknote,
  X,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function formatDate(date: Date | string, formatStr = "dd/MM/yyyy"): string {
  const d = typeof date === "string" ? new Date(date) : date

  const day = d.getDate().toString().padStart(2, "0")
  const month = (d.getMonth() + 1).toString().padStart(2, "0")
  const year = d.getFullYear()

  const weekdays = ["Chủ nhật", "Thứ hai", "Thứ ba", "Thứ tư", "Thứ năm", "Thứ sáu", "Thứ bảy"]
  const weekday = weekdays[d.getDay()]

  if (formatStr === "EEEE, dd 'tháng' MM, yyyy") {
    return `${weekday}, ${day} tháng ${month}, ${year}`
  }
  if (formatStr === "PPP") {
    return `${day} tháng ${month}, ${year}`
  }
  // Default: dd/MM/yyyy
  return `${day}/${month}/${year}`
}

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

    slots[dateStr] = daySlots
  }

  return slots
}

const mockBookedSlots: Record<string, string[]> = {
  "2025-12-08": ["07:00", "08:00", "18:00", "19:00", "20:00"],
  "2025-12-09": ["10:00", "11:00", "14:00", "15:00", "19:00"],
  "2025-12-10": ["06:00", "17:00", "18:00", "19:00"],
  "2025-12-11": ["09:00", "10:00", "16:00", "17:00", "18:00"],
}

const mockFieldDetails = {
  1: {
    name: "Green Valley Soccer Field",
    location: "District 1, HCMC",
    price: 500000,
    weekendPrice: 600000,
    operatingHours: { open: "06:00", close: "22:00" },
    availableSlots: generateAvailableSlots({ open: "06:00", close: "22:00" }),
    image: "/soccer-field.png",
    recurringDiscount: 10, // 10% discount for recurring bookings
  },
}

// Changed params type to Promise<{ id: string }>
export default function BookingPage({ params }: { params: { id: string } }) {
  const { id } = params
  const { toast } = useToast()
  const field = mockFieldDetails[id as keyof typeof mockFieldDetails]
  const [step, setStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string>()
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

  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringSettings, setRecurringSettings] = useState({
    frequency: "weekly" as "weekly" | "biweekly" | "monthly",
    duration: "4" as "4" | "8" | "12", // weeks
    endDate: "",
  })

  const [expandedPayment, setExpandedPayment] = useState<string | null>(null)

  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "processing" | "redirected" | "returning" | "success" | "failed"
  >("pending")
  const [countdown, setCountdown] = useState(30 * 60) // 30 minutes in seconds

  useEffect(() => {
    if (step === 4 && (bookingData.paymentMethod === "zalopay" || bookingData.paymentMethod === "vnpay")) {
      // Start processing
      setPaymentStatus("processing")

      // Step 1: Show "Redirecting..." for 2 seconds
      const redirectTimer = setTimeout(() => {
        setPaymentStatus("redirected")
      }, 2000)

      // Step 2: Simulate user completing payment on gateway (3 more seconds)
      const paymentTimer = setTimeout(() => {
        setPaymentStatus("returning")
      }, 5000)

      // Step 3: Confirm payment and show success (1.5 more seconds)
      const confirmTimer = setTimeout(() => {
        setPaymentStatus("success")
        toast({
          title: "Thanh toán thành công!",
          description: "Đơn đặt sân của bạn đã được xác nhận",
        })
      }, 6500)

      return () => {
        clearTimeout(redirectTimer)
        clearTimeout(paymentTimer)
        clearTimeout(confirmTimer)
      }
    }
  }, [step, bookingData.paymentMethod])

  useEffect(() => {
    if (step === 4 && bookingData.paymentMethod === "bank" && paymentStatus === "pending") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 0) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [step, bookingData.paymentMethod, paymentStatus])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {}

    if (!bookingData.date) {
      newErrors.date = "Vui lòng chọn ngày"
    }

    if (!bookingData.time) {
      newErrors.time = "Vui lòng chọn giờ"
    }

    if (bookingData.date && bookingData.time) {
      const slotsWithStatus = getAllSlotsWithStatus()
      const selectedSlot = slotsWithStatus.find((s) => s.time === bookingData.time)

      if (selectedSlot && !selectedSlot.isAvailable) {
        if (selectedSlot.isBooked) {
          newErrors.time = "Khung giờ này đã có người đặt"
        } else if (selectedSlot.hasOverlap) {
          newErrors.time = `Không thể đặt ${bookingData.duration} giờ từ khung giờ này vì xung đột với lịch đã đặt`
        }
      }
    }

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

  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr)
    const day = date.getDay()
    return day === 0 || day === 6 // Sunday or Saturday
  }

  const getPrice = (dateStr?: string) => {
    if (!dateStr || !field) return field?.price || 0
    return isWeekend(dateStr) ? field.weekendPrice : field.price
  }

  const getAvailableSlots = () => {
    if (!bookingData.date) return []

    const allSlots = field?.availableSlots[bookingData.date] || []
    const bookedSlots = mockBookedSlots[bookingData.date] || []
    const duration = Number.parseInt(bookingData.duration || "1")

    return allSlots.filter((slot) => {
      if (bookedSlots.includes(slot)) return false

      const slotHour = Number.parseInt(slot.split(":")[0])
      for (let i = 1; i < duration; i++) {
        const nextHour = slotHour + i
        const nextSlot = `${nextHour.toString().padStart(2, "0")}:00`
        if (bookedSlots.includes(nextSlot)) return false
      }

      return true
    })
  }

  const getAllSlotsWithStatus = () => {
    if (!bookingData.date || !field) return []

    const allSlots = field.availableSlots[bookingData.date] || []
    const bookedSlots = mockBookedSlots[bookingData.date] || []
    const duration = Number.parseInt(bookingData.duration || "1")

    return allSlots.map((slot) => {
      const isBooked = bookedSlots.includes(slot)

      let hasOverlap = false
      if (!isBooked) {
        const slotHour = Number.parseInt(slot.split(":")[0])
        for (let i = 1; i < duration; i++) {
          const nextHour = slotHour + i
          const nextSlot = `${nextHour.toString().padStart(2, "0")}:00`
          if (bookedSlots.includes(nextSlot)) {
            hasOverlap = true
            break
          }
        }
      }

      return {
        time: slot,
        isBooked,
        hasOverlap,
        isAvailable: !isBooked && !hasOverlap,
      }
    })
  }

  const availableSlots = getAvailableSlots()
  const slotsWithStatus = getAllSlotsWithStatus()

  const currentPrice = getPrice(bookingData.date)

  const getRecurringDates = () => {
    if (!isRecurring || !bookingData.date) return []

    const dates: string[] = []
    const startDate = new Date(bookingData.date)
    const weeks = Number.parseInt(recurringSettings.duration)

    let intervalDays = 7 // weekly
    if (recurringSettings.frequency === "biweekly") intervalDays = 14
    if (recurringSettings.frequency === "monthly") intervalDays = 28

    for (let i = 0; i < weeks; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i * intervalDays)
      dates.push(date.toISOString().split("T")[0])
    }

    return dates
  }

  const recurringDates = getRecurringDates()
  const numberOfSessions = isRecurring ? recurringDates.length : 1

  const singleSessionPrice = Number.parseInt(bookingData.duration || "1") * currentPrice
  const recurringDiscountPercent = isRecurring ? field?.recurringDiscount || 10 : 0
  const recurringDiscountAmount = isRecurring
    ? (singleSessionPrice * numberOfSessions * recurringDiscountPercent) / 100
    : 0
  const totalPrice = singleSessionPrice * numberOfSessions - recurringDiscountAmount

  const getToday = () => {
    const today = new Date()
    setSelectedDate(today.toISOString().split("T")[0])
    setBookingData((prev) => ({ ...prev, date: today.toISOString().split("T")[0], time: "" }))
  }

  const applyVoucher = () => {
    setVoucherError("")

    const mockVouchers = [
      { code: "SUMMER2024", type: "percentage", value: 20, minAmount: 500000, maxDiscount: 200000 },
      { code: "NEWUSER50", type: "fixed", value: 50000, minAmount: 200000 },
      { code: "FREEHOUR", type: "free_hours", value: 1, minAmount: 1000000 },
    ]

    const voucher = mockVouchers.find((v) => v.code === voucherCode.toUpperCase())

    if (!voucher) {
      setVoucherError("Mã voucher không hợp lệ")
      return
    }

    if (voucher.minAmount && totalPrice < voucher.minAmount) {
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

    if (appliedVoucher.type === "percentage") {
      const discount = totalPrice * (appliedVoucher.value / 100)
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

    if (typeof window !== "undefined") {
      localStorage.setItem(
        `booking-${newBookingId}`,
        JSON.stringify({
          bookingId: newBookingId,
          fieldId: id, // Use destructured id
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
          isRecurring,
          recurringSettings: isRecurring ? recurringSettings : null,
          recurringDates: isRecurring ? recurringDates : null,
          recurringDiscount: recurringDiscountAmount,
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/field/${id}`} className="text-primary hover:text-primary/80">
            {" "}
            {/* Use destructured id */}
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Hoàn tất đặt sân</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
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
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Chọn ngày & giờ</h2>
                <div className="space-y-6">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={getToday}
                      className="flex items-center gap-1.5 bg-transparent hover:bg-muted"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Hôm nay
                    </Button>
                    <span className="text-sm text-muted-foreground">hoặc chọn ngày trên lịch</span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" />
                      Chọn ngày
                    </label>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !selectedDate && "text-muted-foreground"
                          } ${errors.date ? "border-red-500" : ""}`}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate
                            ? formatDate(new Date(selectedDate), "EEEE, dd 'tháng' MM, yyyy")
                            : "Chọn ngày đặt sân"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate ? new Date(selectedDate) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              setSelectedDate(date.toISOString().split("T")[0])
                              setBookingData((prev) => ({
                                ...prev,
                                date: date.toISOString().split("T")[0],
                                time: "",
                              }))
                              if (errors.date) setErrors((prev) => ({ ...prev, date: "" }))
                            }
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    {errors.date && (
                      <Alert variant="destructive" className="mt-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.date}</AlertDescription>
                      </Alert>
                    )}
                    {bookingData.date && (
                      <div className="mt-3 flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant={isWeekend(bookingData.date) ? "default" : "secondary"} className="text-xs">
                          {isWeekend(bookingData.date) ? "Cuối tuần" : "Ngày thường"}
                        </Badge>
                        <span className="text-sm font-semibold text-primary">{currentPrice.toLocaleString()}đ/giờ</span>
                        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="w-3.5 h-3.5" />
                          {field.operatingHours.open} - {field.operatingHours.close}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Thời lượng</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["1", "2", "3", "4"].map((dur) => (
                        <button
                          key={dur}
                          type="button"
                          onClick={() => setBookingData((prev) => ({ ...prev, duration: dur, time: "" }))}
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

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-foreground flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Giờ bắt đầu
                      </label>
                      {bookingData.date && (
                        <div className="flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-green-500/20 border border-green-500" />
                            <span className="text-muted-foreground">Còn trống</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-3 h-3 rounded bg-muted border border-border" />
                            <span className="text-muted-foreground">Đã đặt</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {bookingData.date ? (
                      slotsWithStatus.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm">
                            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-blue-600 dark:text-blue-400">
                                Bạn đang đặt {bookingData.duration} giờ
                              </p>
                              <p className="text-blue-600/80 dark:text-blue-400/80">
                                Chọn giờ bắt đầu - hệ thống sẽ tự động đặt các giờ tiếp theo
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                            {slotsWithStatus.map((slot) => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.isAvailable}
                                onClick={() => {
                                  setBookingData((prev) => ({ ...prev, time: slot.time }))
                                  if (errors.time) setErrors((prev) => ({ ...prev, time: "" }))
                                }}
                                className={`px-3 py-2.5 rounded-lg border text-sm font-medium relative ${
                                  !slot.isAvailable
                                    ? "bg-muted text-muted-foreground border-border cursor-not-allowed opacity-50"
                                    : bookingData.time === slot.time
                                      ? "bg-primary text-white border-primary"
                                      : "bg-green-500/10 text-foreground border-green-500/30 hover:border-green-500 hover:bg-green-500/20"
                                }`}
                              >
                                {slot.time}
                                {slot.isBooked && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                    <XCircle className="w-3 h-3 text-white" />
                                  </span>
                                )}
                                {slot.hasOverlap && !slot.isBooked && (
                                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                    <AlertCircle className="w-3 h-3 text-white" />
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          Không có khung giờ trống trong ngày này
                        </div>
                      )
                    ) : (
                      <div className="text-center py-8 text-muted-foreground border border-dashed border-border rounded-lg">
                        Vui lòng chọn ngày để xem các khung giờ trống
                      </div>
                    )}
                    {errors.time && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errors.time}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Recurring Booking Section */}
                  <div className="border-t border-border pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Repeat className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <Label htmlFor="recurring-toggle" className="text-base font-medium cursor-pointer">
                            Đặt sân định kỳ
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Đặt lịch cố định hàng tuần và nhận giảm giá {field.recurringDiscount}%
                          </p>
                        </div>
                      </div>
                      <Switch id="recurring-toggle" checked={isRecurring} onCheckedChange={setIsRecurring} />
                    </div>

                    {isRecurring && (
                      <div className="space-y-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <div>
                          <Label className="text-sm font-medium mb-2 block">Tần suất lặp lại</Label>
                          <RadioGroup
                            value={recurringSettings.frequency}
                            onValueChange={(value) =>
                              setRecurringSettings({
                                ...recurringSettings,
                                frequency: value as typeof recurringSettings.frequency,
                              })
                            }
                            className="grid grid-cols-3 gap-2"
                          >
                            <div
                              className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition ${
                                recurringSettings.frequency === "weekly"
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              }`}
                            >
                              <RadioGroupItem value="weekly" id="weekly" className="sr-only" />
                              <Label htmlFor="weekly" className="cursor-pointer text-center">
                                <div className="font-medium">Hàng tuần</div>
                                <div className="text-xs text-muted-foreground">7 ngày/lần</div>
                              </Label>
                            </div>
                            <div
                              className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition ${
                                recurringSettings.frequency === "biweekly"
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              }`}
                            >
                              <RadioGroupItem value="biweekly" id="biweekly" className="sr-only" />
                              <Label htmlFor="biweekly" className="cursor-pointer text-center">
                                <div className="font-medium">2 tuần/lần</div>
                                <div className="text-xs text-muted-foreground">14 ngày/lần</div>
                              </Label>
                            </div>
                            <div
                              className={`flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition ${
                                recurringSettings.frequency === "monthly"
                                  ? "border-primary bg-primary/10"
                                  : "border-border"
                              }`}
                            >
                              <RadioGroupItem value="monthly" id="monthly" className="sr-only" />
                              <Label htmlFor="monthly" className="cursor-pointer text-center">
                                <div className="font-medium">Hàng tháng</div>
                                <div className="text-xs text-muted-foreground">28 ngày/lần</div>
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <Label className="text-sm font-medium mb-2 block">Thời gian đặt</Label>
                          <Select
                            value={recurringSettings.duration}
                            onValueChange={(value) =>
                              setRecurringSettings({
                                ...recurringSettings,
                                duration: value as typeof recurringSettings.duration,
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn thời gian" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="4">4 tuần (1 tháng)</SelectItem>
                              <SelectItem value="8">8 tuần (2 tháng)</SelectItem>
                              <SelectItem value="12">12 tuần (3 tháng)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {bookingData.date && recurringDates.length > 0 && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              <CalendarDays className="w-4 h-4" />
                              Lịch đặt ({recurringDates.length} buổi)
                            </Label>
                            <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-background rounded-lg border border-border">
                              {recurringDates.map((date, idx) => (
                                <div key={date} className="flex items-center justify-between text-sm py-1">
                                  <span className="text-muted-foreground">Buổi {idx + 1}:</span>
                                  <span className="font-medium">
                                    {formatDate(date)} - {bookingData.time}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <div className="text-sm text-green-700 dark:text-green-400">
                            <p className="font-medium">Ưu đãi đặt định kỳ</p>
                            <p>Giảm ngay {field.recurringDiscount}% tổng hóa đơn khi đặt định kỳ</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* End of Recurring Booking Section */}

                  <Button onClick={() => handleNextStep(2)} className="w-full" size="lg">
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Contact Info */}
            {step === 2 && (
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Thông tin liên hệ</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Họ và tên *</label>
                    <Input
                      name="fullName"
                      value={bookingData.fullName}
                      onChange={handleChange}
                      placeholder="Nguyễn Văn A"
                      className={errors.fullName ? "border-red-500" : ""}
                    />
                    {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
                    <Input
                      name="email"
                      type="email"
                      value={bookingData.email}
                      onChange={handleChange}
                      placeholder="email@example.com"
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Số điện thoại *</label>
                    <Input
                      name="phone"
                      type="tel"
                      value={bookingData.phone}
                      onChange={handleChange}
                      placeholder="0123 456 789"
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1">Ghi chú</label>
                    <Input
                      name="notes"
                      value={bookingData.notes}
                      onChange={handleChange}
                      placeholder="Yêu cầu đặc biệt (nếu có)"
                    />
                  </div>
                  <div className="flex gap-4 pt-4">
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
              <Card className="p-6">
                <h2 className="text-2xl font-bold mb-6">Thanh toán</h2>
                <div className="space-y-6">
                  {/* Voucher */}
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <Tag className="w-5 h-5 text-primary" />
                      <span className="font-medium">Mã giảm giá</span>
                    </div>
                    {appliedVoucher ? (
                      <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-700 dark:text-green-400">{appliedVoucher.code}</p>
                            <p className="text-sm text-green-600 dark:text-green-500">
                              {appliedVoucher.type === "percentage"
                                ? `Giảm ${appliedVoucher.value}%`
                                : `Giảm ${appliedVoucher.value.toLocaleString()}đ`}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={removeVoucher}>
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          value={voucherCode}
                          onChange={(e) => setVoucherCode(e.target.value)}
                          placeholder="Nhập mã voucher"
                          className={voucherError ? "border-red-500" : ""}
                        />
                        <Button variant="outline" onClick={applyVoucher}>
                          Áp dụng
                        </Button>
                      </div>
                    )}
                    {voucherError && <p className="text-red-500 text-sm mt-2">{voucherError}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-3">Phương thức thanh toán</label>
                    <div className="space-y-3">
                      {[
                        {
                          id: "bank",
                          name: "Chuyển khoản ngân hàng",
                          desc: "Miễn phí",
                          icon: Building2,
                        },
                        {
                          id: "zalopay",
                          name: "ZaloPay",
                          desc: "Miễn phí",
                          icon: Smartphone,
                        },
                        {
                          id: "vnpay",
                          name: "VNPay",
                          desc: "Miễn phí",
                          icon: CreditCard,
                        },
                        {
                          id: "pay_at_venue",
                          name: "Thanh toán tại sân",
                          desc: "Thanh toán khi đến",
                          icon: Banknote,
                        },
                      ].map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setBookingData((prev) => ({ ...prev, paymentMethod: method.id }))
                          }}
                          className={`w-full flex items-center justify-between p-4 rounded-lg border transition ${
                            bookingData.paymentMethod === method.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/50"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                                bookingData.paymentMethod === method.id ? "border-primary" : "border-muted-foreground"
                              }`}
                            >
                              {bookingData.paymentMethod === method.id && (
                                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                              )}
                            </div>
                            <method.icon
                              className={`w-5 h-5 ${
                                bookingData.paymentMethod === method.id ? "text-primary" : "text-muted-foreground"
                              }`}
                            />
                            <span className="font-medium">{method.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">{method.desc}</span>
                        </button>
                      ))}
                    </div>

                    {/* Pay at venue notice */}
                    {bookingData.paymentMethod === "pay_at_venue" && (
                      <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <p className="text-sm text-amber-700 dark:text-amber-400">
                          <strong>Lưu ý:</strong> Đơn đặt sân sẽ chờ xác nhận từ chủ sân. Vui lòng đến sân đúng giờ và
                          thanh toán trực tiếp.
                        </p>
                      </div>
                    )}
                  </div>
                  {/* End of Payment Methods */}

                  <div className="flex gap-4 pt-4">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Quay lại
                    </Button>
                    <Button
                      onClick={() => {
                        createBooking()
                        setStep(4)
                      }}
                      className="flex-1"
                    >
                      {bookingData.paymentMethod === "pay_at_venue" ? "Xác nhận đặt sân" : "Tiếp tục thanh toán"}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {step === 4 && (
              <Card className="p-6">
                {bookingData.paymentMethod === "pay_at_venue" ? (
                  /* Pay at venue - Success confirmation */
                  <div className="text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">Đặt sân thành công!</h2>
                    <p className="text-muted-foreground mb-6">
                      Mã đơn: <span className="font-mono font-bold text-primary">{bookingId}</span>
                    </p>

                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6 text-left">
                      <div className="flex items-center gap-2 mb-2">
                        <Banknote className="w-5 h-5 text-amber-600" />
                        <span className="font-medium text-amber-700 dark:text-amber-400">Thanh toán tại sân</span>
                      </div>
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        Vui lòng đến sân đúng giờ và thanh toán trực tiếp cho chủ sân. Đơn đặt sẽ được xác nhận khi bạn
                        check-in.
                      </p>
                    </div>

                    {isRecurring && (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6 text-left">
                        <div className="flex items-center gap-2 mb-3">
                          <Repeat className="w-5 h-5 text-primary" />
                          <span className="font-medium text-primary">Đặt sân định kỳ</span>
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>
                            Tần suất:{" "}
                            {recurringSettings.frequency === "weekly"
                              ? "Hàng tuần"
                              : recurringSettings.frequency === "biweekly"
                                ? "2 tuần/lần"
                                : "Hàng tháng"}
                          </p>
                          <p>Số buổi: {numberOfSessions} buổi</p>
                          <p>
                            Giảm giá: {field.recurringDiscount}% (-{recurringDiscountAmount.toLocaleString()}đ)
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground mb-8">
                      <p>Email xác nhận đã được gửi đến {bookingData.email}</p>
                    </div>

                    <div className="flex gap-4">
                      <Link href="/bookings" className="flex-1">
                        <Button className="w-full">Xem đơn đặt</Button>
                      </Link>
                      <Link href="/" className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Về trang chủ
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : bookingData.paymentMethod === "zalopay" || bookingData.paymentMethod === "vnpay" ? (
                  /* ZaloPay/VNPay - Realistic redirect flow with multiple states */
                  <div className="text-center">
                    {paymentStatus === "processing" ? (
                      /* Step 1: Redirecting to payment gateway */
                      <>
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                          <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            {bookingData.paymentMethod === "zalopay" ? (
                              <div className="w-10 h-10 bg-[#00C853] rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">Z</span>
                              </div>
                            ) : (
                              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xs">VN</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đang kết nối...</h2>
                        <p className="text-muted-foreground mb-6">
                          Đang kết nối đến cổng thanh toán{" "}
                          <span className="font-semibold text-foreground">
                            {bookingData.paymentMethod === "zalopay" ? "ZaloPay" : "VNPay"}
                          </span>
                        </p>
                        <div className="flex justify-center gap-1 mb-6">
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </>
                    ) : paymentStatus === "redirected" ? (
                      /* Step 2: User is on payment gateway */
                      <>
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                          {bookingData.paymentMethod === "zalopay" ? (
                            <div className="w-full h-full bg-gradient-to-br from-[#00C853] to-[#00A843] rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-2xl">Z</span>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                              <span className="text-white font-bold text-xl">VNPay</span>
                            </div>
                          )}
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đang thanh toán...</h2>
                        <p className="text-muted-foreground mb-6">
                          Vui lòng hoàn tất thanh toán trên{" "}
                          <span className="font-semibold text-foreground">
                            {bookingData.paymentMethod === "zalopay" ? "ứng dụng ZaloPay" : "cổng VNPay"}
                          </span>
                        </p>

                        {/* Order info */}
                        <div className="p-4 bg-muted/50 rounded-lg mb-6 text-left">
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mã đơn</span>
                              <span className="font-mono font-bold text-foreground">{bookingId}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sân</span>
                              <span className="font-medium text-foreground">{field.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Số tiền</span>
                              <span className="font-bold text-primary">{finalAmount.toLocaleString()}đ</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-4">
                          <p className="text-sm text-amber-700 dark:text-amber-400">
                            <AlertCircle className="w-4 h-4 inline mr-1" />
                            Vui lòng không đóng trang này
                          </p>
                        </div>

                        <div className="flex justify-center gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-pulse"
                            style={{ animationDelay: "200ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-primary rounded-full animate-pulse"
                            style={{ animationDelay: "400ms" }}
                          ></div>
                        </div>
                      </>
                    ) : paymentStatus === "returning" ? (
                      /* Step 3: Returning from payment gateway, verifying */
                      <>
                        <div className="w-20 h-20 mx-auto mb-6 relative">
                          <div className="absolute inset-0 border-4 border-green-500/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-green-500" />
                          </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Đang xác nhận...</h2>
                        <p className="text-muted-foreground mb-6">
                          Hệ thống đang xác nhận thanh toán từ{" "}
                          <span className="font-semibold text-foreground">
                            {bookingData.paymentMethod === "zalopay" ? "ZaloPay" : "VNPay"}
                          </span>
                        </p>
                        <div className="flex justify-center gap-1">
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: "0ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: "150ms" }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
                            style={{ animationDelay: "300ms" }}
                          ></div>
                        </div>
                      </>
                    ) : paymentStatus === "success" ? (
                      /* Step 4: Payment confirmed successfully */
                      <>
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-in zoom-in duration-300">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Thanh toán thành công!</h2>
                        <p className="text-muted-foreground mb-2">
                          Mã đơn: <span className="font-mono font-bold text-primary">{bookingId}</span>
                        </p>
                        <p className="text-muted-foreground mb-6">
                          Thanh toán qua {bookingData.paymentMethod === "zalopay" ? "ZaloPay" : "VNPay"}
                        </p>

                        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg mb-6 text-left">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                            <span className="font-medium text-green-700 dark:text-green-400">Đã thanh toán</span>
                          </div>
                          <p className="text-sm text-green-700 dark:text-green-400">
                            Số tiền: {finalAmount.toLocaleString()}đ
                          </p>
                        </div>

                        {isRecurring && (
                          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6 text-left">
                            <div className="flex items-center gap-2 mb-3">
                              <Repeat className="w-5 h-5 text-primary" />
                              <span className="font-medium text-primary">Đặt sân định kỳ</span>
                            </div>
                            <div className="text-sm space-y-1 text-muted-foreground">
                              <p>
                                Tần suất:{" "}
                                {recurringSettings.frequency === "weekly"
                                  ? "Hàng tuần"
                                  : recurringSettings.frequency === "biweekly"
                                    ? "2 tuần/lần"
                                    : "Hàng tháng"}
                              </p>
                              <p>Số buổi: {numberOfSessions} buổi</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2 text-sm text-muted-foreground mb-8">
                          <p>Email xác nhận đã được gửi đến {bookingData.email}</p>
                        </div>

                        <div className="flex gap-4">
                          <Link href="/bookings" className="flex-1">
                            <Button className="w-full">Xem đơn đặt</Button>
                          </Link>
                          <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              Về trang chủ
                            </Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      /* Payment failed */
                      <>
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                          <X className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Thanh toán thất bại</h2>
                        <p className="text-muted-foreground mb-6">Đã có lỗi xảy ra. Vui lòng thử lại.</p>
                        <div className="flex gap-4">
                          <Button
                            onClick={() => {
                              setPaymentStatus("pending")
                              setStep(3)
                            }}
                            className="flex-1"
                          >
                            Thử lại
                          </Button>
                          <Link href="/" className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              Về trang chủ
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  /* Bank transfer / ZaloPay - Manual confirmation with countdown */
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode className="w-6 h-6 text-primary" />
                      </div>
                      <h2 className="text-2xl font-bold mb-2">
                        {bookingData.paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : "Thanh toán với ZaloPay"}
                      </h2>
                      <p className="text-muted-foreground">
                        Mã đơn: <span className="font-mono font-bold text-primary">{bookingId}</span>
                      </p>
                    </div>

                    {/* Payment countdown */}
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg mb-6 text-center">
                      <p className="text-sm text-amber-700 dark:text-amber-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Vui lòng thanh toán trong vòng <strong>{formatCountdown(countdown)}</strong> để giữ chỗ
                      </p>
                    </div>

                    {/* QR Code Section */}
                    <div className="flex flex-col items-center mb-6">
                      <div className="w-56 h-56 bg-white rounded-xl p-3 shadow-lg mb-4">
                        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-muted-foreground/30 rounded-lg">
                          <div className="text-center">
                            <QrCode className="w-20 h-20 text-gray-800 mx-auto mb-2" />
                            <p className="text-xs text-gray-500">Quét mã QR</p>
                            <p className="text-sm font-bold text-gray-800">{finalAmount.toLocaleString()}đ</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="mb-4">
                        {bookingData.paymentMethod === "bank" ? "Chuyển khoản ngân hàng" : "ZaloPay"}
                      </Badge>
                    </div>

                    {/* Bank Transfer Info */}
                    {(bookingData.paymentMethod === "bank" || bookingData.paymentMethod === "zalopay") && (
                      <div className="p-4 bg-muted/50 rounded-lg mb-6">
                        <div className="space-y-3 text-sm">
                          {bookingData.paymentMethod === "bank" && (
                            <>
                              <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">Ngân hàng</span>
                                <span className="font-medium text-foreground">Vietcombank</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">Số tài khoản</span>
                                <span className="font-mono font-medium text-foreground">1234567890</span>
                              </div>
                              <div className="flex justify-between py-2 border-b border-border">
                                <span className="text-muted-foreground">Chủ tài khoản</span>
                                <span className="font-medium text-foreground text-right">
                                  CONG TY TNHH GREEN VALLEY SPORTS
                                </span>
                              </div>
                            </>
                          )}
                          <div className="flex justify-between py-2 border-b border-border">
                            <span className="text-muted-foreground">Số tiền</span>
                            <span className="font-bold text-primary">{finalAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-muted-foreground">Nội dung CK</span>
                            <span className="font-mono font-medium text-primary">{bookingId}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Important note */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        <strong>Lưu ý:</strong> Vui lòng nhập đúng nội dung chuyển khoản <strong>{bookingId}</strong> để
                        hệ thống tự động xác nhận. Sau khi chuyển khoản, nhấn nút bên dưới để thông báo cho chủ sân.
                      </p>
                    </div>

                    {isRecurring && (
                      <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Repeat className="w-5 h-5 text-primary" />
                          <span className="font-medium text-primary">Đặt sân định kỳ</span>
                        </div>
                        <div className="text-sm space-y-1 text-muted-foreground">
                          <p>Số buổi: {numberOfSessions} buổi</p>
                          <p>
                            Giảm giá: {field.recurringDiscount}% (-{recurringDiscountAmount.toLocaleString()}đ)
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-4">
                      <Button
                        className="flex-1"
                        onClick={() => {
                          toast({
                            title: "Đã gửi thông báo",
                            description: "Chủ sân sẽ xác nhận khi nhận được chuyển khoản",
                          })
                          // Navigate to bookings after notification
                          setTimeout(() => {
                            window.location.href = "/bookings"
                          }, 1500)
                        }}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Tôi đã chuyển khoản
                      </Button>
                      <Link href="/bookings" className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Thanh toán sau
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar - Order Summary */}
          <div className="lg:col-span-1">
            <Card className="p-8 sticky top-24">
              <h3 className="text-lg font-bold mb-6">Thông tin đặt sân</h3>

              <div className="mb-6">
                <img
                  src={field.image || "/placeholder.svg"}
                  alt={field.name}
                  className="w-full h-40 rounded-xl object-cover mb-4"
                />
                <h4 className="text-lg font-semibold mb-1">{field.name}</h4>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{field.location}</span>
                </div>
              </div>

              <div className="space-y-4 py-5 border-t border-border">
                {bookingData.date && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ngày</span>
                    <span className="font-semibold">{formatDate(bookingData.date)}</span>
                  </div>
                )}
                {bookingData.time && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Giờ</span>
                    <span className="font-semibold">{bookingData.time}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-semibold">{bookingData.duration} giờ</span>
                </div>

                {isRecurring && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        <Repeat className="w-4 h-4" /> Định kỳ
                      </span>
                      <span className="font-semibold text-primary">
                        {recurringSettings.frequency === "weekly"
                          ? "Hàng tuần"
                          : recurringSettings.frequency === "biweekly"
                            ? "2 tuần/lần"
                            : "Hàng tháng"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Số buổi</span>
                      <span className="font-semibold">{numberOfSessions} buổi</span>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3 py-5 border-t border-border">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Giá{" "}
                    {isRecurring ? `(${numberOfSessions} buổi x ${singleSessionPrice.toLocaleString()}đ)` : "thuê sân"}
                  </span>
                  <span className="font-medium">{(singleSessionPrice * numberOfSessions).toLocaleString()}đ</span>
                </div>

                {isRecurring && recurringDiscountAmount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá định kỳ ({field.recurringDiscount}%)</span>
                    <span className="font-medium">-{recurringDiscountAmount.toLocaleString()}đ</span>
                  </div>
                )}

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Voucher</span>
                    <span className="font-medium">-{discount.toLocaleString()}đ</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-medium">50,000đ</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-5 border-t border-border">
                <span className="text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{finalAmount.toLocaleString()}đ</span>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
