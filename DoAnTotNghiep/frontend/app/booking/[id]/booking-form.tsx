"use client"

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
  Loader2,
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
  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${month}-${day}`
  }
  return `${day}/${month}/${year}`
}

// Mock field data
const mockFields: Record<
  string,
  {
    id: string
    name: string
    type: string
    location: string
    address: string
    price: number
    weekendPrice: number
    openTime: string
    closeTime: string
    image: string
    rating: number
    reviews: number
  }
> = {
  "1": {
    id: "1",
    name: "Sân Bóng Đá Green Valley",
    type: "Bóng đá",
    location: "Quận 1",
    address: "123 Nguyễn Huệ, Quận 1, TP.HCM",
    price: 500000,
    weekendPrice: 700000,
    openTime: "06:00",
    closeTime: "22:00",
    image: "/soccer-field-green-grass.png",
    rating: 4.8,
    reviews: 124,
  },
  "2": {
    id: "2",
    name: "Sân Cầu Lông Pro",
    type: "Cầu lông",
    location: "Quận 3",
    address: "456 Lê Văn Sỹ, Quận 3, TP.HCM",
    price: 200000,
    weekendPrice: 280000,
    openTime: "05:00",
    closeTime: "23:00",
    image: "/indoor-badminton-court.png",
    rating: 4.6,
    reviews: 89,
  },
  "3": {
    id: "3",
    name: "Sân Bóng Rổ Arena",
    type: "Bóng rổ",
    location: "Quận 7",
    address: "789 Nguyễn Thị Thập, Quận 7, TP.HCM",
    price: 400000,
    weekendPrice: 550000,
    openTime: "06:00",
    closeTime: "21:00",
    image: "/indoor-basketball-court.png",
    rating: 4.9,
    reviews: 156,
  },
  "4": {
    id: "4",
    name: "Sân Tennis Elite",
    type: "Tennis",
    location: "Quận 2",
    address: "321 Thảo Điền, Quận 2, TP.HCM",
    price: 350000,
    weekendPrice: 450000,
    openTime: "05:30",
    closeTime: "22:30",
    image: "/professional-tennis-court.jpg",
    rating: 4.7,
    reviews: 102,
  },
}

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
]

const bookedSlots = ["08:00", "09:00", "14:00", "15:00"]

interface BookingFormProps {
  fieldId: string
}

export function BookingForm({ fieldId }: BookingFormProps) {
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [duration, setDuration] = useState(1)
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    phone: "",
    email: "",
    note: "",
  })
  const [voucherCode, setVoucherCode] = useState("")
  const [appliedVoucher, setAppliedVoucher] = useState<{ code: string; discount: number } | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<string>("momo")

  // Recurring booking state
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringFrequency, setRecurringFrequency] = useState<"weekly" | "biweekly" | "monthly">("weekly")
  const [recurringWeeks, setRecurringWeeks] = useState(4)

  // Payment state
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "processing" | "success" | "failed">("pending")
  const [countdown, setCountdown] = useState(1800) // 30 minutes in seconds

  const field = mockFields[fieldId] || mockFields["1"]

  // Check if selected day is weekend
  const isWeekend = selectedDate ? [0, 6].includes(selectedDate.getDay()) : false
  const basePrice = isWeekend ? field.weekendPrice : field.price
  const totalHours = duration
  const subtotal = basePrice * totalHours

  // Calculate recurring discount
  const recurringDiscount = isRecurring ? 0.1 : 0 // 10% discount for recurring
  const recurringTotal = isRecurring ? subtotal * recurringWeeks * (1 - recurringDiscount) : subtotal

  // Apply voucher discount
  const voucherDiscount = appliedVoucher ? (recurringTotal * appliedVoucher.discount) / 100 : 0
  const finalTotal = recurringTotal - voucherDiscount

  // Payment countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (currentStep === 4 && paymentMethod !== "at_venue" && paymentStatus === "pending") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setPaymentStatus("failed")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [currentStep, paymentMethod, paymentStatus])

  // Auto payment simulation for MoMo/VNPay
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (currentStep === 4 && (paymentMethod === "momo" || paymentMethod === "vnpay") && paymentStatus === "pending") {
      setPaymentStatus("processing")
      // Simulate payment gateway callback after 3-5 seconds
      const delay = 3000 + Math.random() * 2000
      timer = setTimeout(() => {
        setPaymentStatus("success")
        toast({
          title: "Thanh toán thành công!",
          description: "Đơn đặt sân của bạn đã được xác nhận.",
        })
      }, delay)
    }
    return () => clearTimeout(timer)
  }, [currentStep, paymentMethod, paymentStatus, toast])

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleApplyVoucher = () => {
    if (voucherCode.toUpperCase() === "GIAM20") {
      setAppliedVoucher({ code: "GIAM20", discount: 20 })
      toast({
        title: "Áp dụng mã thành công!",
        description: "Bạn được giảm 20% cho đơn đặt sân này.",
      })
    } else if (voucherCode.toUpperCase() === "NEWUSER") {
      setAppliedVoucher({ code: "NEWUSER", discount: 15 })
      toast({
        title: "Áp dụng mã thành công!",
        description: "Bạn được giảm 15% cho đơn đặt sân này.",
      })
    } else {
      toast({
        title: "Mã không hợp lệ",
        description: "Vui lòng kiểm tra lại mã giảm giá.",
        variant: "destructive",
      })
    }
  }

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null)
    setVoucherCode("")
  }

  const handleNext = () => {
    if (currentStep === 1 && (!selectedDate || !selectedTime)) {
      toast({
        title: "Vui lòng chọn đầy đủ",
        description: "Bạn cần chọn ngày và giờ để tiếp tục.",
        variant: "destructive",
      })
      return
    }
    if (currentStep === 2 && (!customerInfo.name || !customerInfo.phone)) {
      toast({
        title: "Vui lòng điền thông tin",
        description: "Họ tên và số điện thoại là bắt buộc.",
        variant: "destructive",
      })
      return
    }
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleBankTransferNotify = () => {
    toast({
      title: "Đã gửi thông báo!",
      description: "Chủ sân sẽ xác nhận thanh toán của bạn trong thời gian sớm nhất.",
    })
  }

  // Generate recurring dates
  const getRecurringDates = () => {
    if (!selectedDate || !isRecurring) return []
    const dates: Date[] = []
    for (let i = 0; i < recurringWeeks; i++) {
      const date = new Date(selectedDate)
      if (recurringFrequency === "weekly") {
        date.setDate(date.getDate() + i * 7)
      } else if (recurringFrequency === "biweekly") {
        date.setDate(date.getDate() + i * 14)
      } else {
        date.setMonth(date.getMonth() + i)
      }
      dates.push(date)
    }
    return dates
  }

  const steps = [
    { number: 1, label: "Ngày & Giờ" },
    { number: 2, label: "Thông tin" },
    { number: 3, label: "Thanh toán" },
    { number: 4, label: "Xác nhận" },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/field/${fieldId}`}>
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-foreground">Đặt Sân</h1>
              <p className="text-sm text-muted-foreground">{field.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep > step.number
                        ? "bg-primary text-primary-foreground"
                        : currentStep === step.number
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.number ? <Check className="h-5 w-5" /> : step.number}
                  </div>
                  <span
                    className={`text-xs mt-2 ${currentStep >= step.number ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {step.label}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-1 mx-2 rounded ${currentStep > step.number ? "bg-primary" : "bg-muted"}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {/* Step 1: Select Date & Time */}
            {currentStep === 1 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-foreground">Chọn Ngày & Giờ</h2>

                {/* Date Picker */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-foreground">Ngày đặt sân</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? formatDate(selectedDate, "EEEE, dd 'tháng' MM, yyyy") : "Chọn ngày"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  {isWeekend && (
                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-2">
                      * Giá cuối tuần: {field.weekendPrice.toLocaleString()}đ/giờ
                    </p>
                  )}
                </div>

                {/* Time Slots */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-foreground">Giờ bắt đầu</label>
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                    {timeSlots.map((time) => {
                      const isBooked = bookedSlots.includes(time)
                      const isSelected = selectedTime === time
                      return (
                        <Button
                          key={time}
                          variant={isSelected ? "default" : "outline"}
                          className={`${isBooked ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={isBooked}
                          onClick={() => setSelectedTime(time)}
                        >
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-primary"></div>
                      <span className="text-muted-foreground">Đã chọn</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded bg-muted opacity-50"></div>
                      <span className="text-muted-foreground">Đã đặt</span>
                    </div>
                  </div>
                </div>

                {/* Duration */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-foreground">Thời lượng</label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDuration(Math.max(1, duration - 1))}
                      disabled={duration <= 1}
                    >
                      -
                    </Button>
                    <span className="text-xl font-semibold w-20 text-center text-foreground">{duration} giờ</span>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setDuration(Math.min(4, duration + 1))}
                      disabled={duration >= 4}
                    >
                      +
                    </Button>
                  </div>
                  {selectedTime && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Từ {selectedTime} đến{" "}
                      {`${(Number.parseInt(selectedTime.split(":")[0]) + duration).toString().padStart(2, "0")}:00`}
                    </p>
                  )}
                </div>

                {/* Recurring Booking */}
                <div className="border-t border-border pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-5 w-5 text-primary" />
                      <span className="font-medium text-foreground">Đặt sân định kỳ</span>
                      <Badge variant="secondary" className="text-xs">
                        Giảm 10%
                      </Badge>
                    </div>
                    <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
                  </div>

                  {isRecurring && (
                    <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                      <div>
                        <Label className="text-sm text-foreground">Tần suất</Label>
                        <RadioGroup
                          value={recurringFrequency}
                          onValueChange={(v) => setRecurringFrequency(v as "weekly" | "biweekly" | "monthly")}
                          className="flex gap-4 mt-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="weekly" id="weekly" />
                            <Label htmlFor="weekly" className="text-foreground">
                              Hàng tuần
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="biweekly" id="biweekly" />
                            <Label htmlFor="biweekly" className="text-foreground">
                              2 tuần/lần
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="monthly" id="monthly" />
                            <Label htmlFor="monthly" className="text-foreground">
                              Hàng tháng
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div>
                        <Label className="text-sm text-foreground">Số lần đặt</Label>
                        <Select
                          value={recurringWeeks.toString()}
                          onValueChange={(v) => setRecurringWeeks(Number.parseInt(v))}
                        >
                          <SelectTrigger className="mt-2">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4">4 lần</SelectItem>
                            <SelectItem value="8">8 lần</SelectItem>
                            <SelectItem value="12">12 lần</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Preview recurring dates */}
                      <div>
                        <Label className="text-sm text-foreground">Lịch đặt sân</Label>
                        <div className="mt-2 max-h-40 overflow-y-auto space-y-1">
                          {getRecurringDates().map((date, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm py-1 px-2 bg-background rounded"
                            >
                              <CalendarDays className="h-4 w-4 text-primary" />
                              <span className="text-foreground">
                                Lần {index + 1}: {formatDate(date, "EEEE, dd 'tháng' MM, yyyy")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <Link href={`/field/${fieldId}`} className="flex-1">
                    <Button variant="outline" className="w-full bg-transparent">
                      Quay lại
                    </Button>
                  </Link>
                  <Button className="flex-1" onClick={handleNext}>
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Customer Info */}
            {currentStep === 2 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-foreground">Thông Tin Người Đặt</h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Họ và tên <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Nhập họ và tên"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">
                      Số điện thoại <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="Nhập số điện thoại"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="Nhập email (không bắt buộc)"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-foreground">Ghi chú</label>
                    <Input
                      placeholder="Ghi chú thêm (không bắt buộc)"
                      value={customerInfo.note}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, note: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                    Quay lại
                  </Button>
                  <Button className="flex-1" onClick={handleNext}>
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 3: Payment Method */}
            {currentStep === 3 && (
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-6 text-foreground">Thanh Toán</h2>

                {/* Voucher */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="h-5 w-5 text-primary" />
                    <span className="font-medium text-foreground">Mã giảm giá</span>
                  </div>
                  {appliedVoucher ? (
                    <div className="flex items-center justify-between bg-primary/10 border border-primary/30 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="font-medium text-foreground">{appliedVoucher.code}</span>
                        <Badge variant="secondary">-{appliedVoucher.discount}%</Badge>
                      </div>
                      <Button variant="ghost" size="sm" onClick={handleRemoveVoucher}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nhập mã voucher"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value)}
                      />
                      <Button variant="outline" onClick={handleApplyVoucher}>
                        Áp dụng
                      </Button>
                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="mb-6">
                  <span className="font-medium text-foreground block mb-3">Phương thức thanh toán</span>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "bank" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("bank")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="bank" id="bank" />
                        <Building2 className="h-5 w-5 text-blue-600" />
                        <Label htmlFor="bank" className="cursor-pointer text-foreground">
                          Chuyển khoản ngân hàng
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Miễn phí</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "momo" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("momo")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="momo" id="momo" />
                        <Smartphone className="h-5 w-5 text-pink-600" />
                        <Label htmlFor="momo" className="cursor-pointer text-foreground">
                          Ví MoMo
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Miễn phí</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "vnpay" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("vnpay")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="vnpay" id="vnpay" />
                        <CreditCard className="h-5 w-5 text-blue-500" />
                        <Label htmlFor="vnpay" className="cursor-pointer text-foreground">
                          VNPay
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Miễn phí</span>
                    </div>

                    <div
                      className={`flex items-center justify-between p-4 rounded-lg border-2 cursor-pointer transition-colors ${paymentMethod === "at_venue" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                      onClick={() => setPaymentMethod("at_venue")}
                    >
                      <div className="flex items-center gap-3">
                        <RadioGroupItem value="at_venue" id="at_venue" />
                        <Banknote className="h-5 w-5 text-green-600" />
                        <Label htmlFor="at_venue" className="cursor-pointer text-foreground">
                          Thanh toán tại sân
                        </Label>
                      </div>
                      <span className="text-sm text-muted-foreground">Tiền mặt</span>
                    </div>
                  </RadioGroup>

                  {paymentMethod === "at_venue" && (
                    <Alert className="mt-4 border-yellow-500/50 bg-yellow-500/10">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-700 dark:text-yellow-400">
                        Vui lòng đến sân đúng giờ và thanh toán trực tiếp cho nhân viên. Đơn đặt có thể bị hủy nếu bạn
                        đến trễ quá 15 phút.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="flex gap-4 mt-8">
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                    Quay lại
                  </Button>
                  <Button className="flex-1" onClick={handleNext}>
                    {paymentMethod === "at_venue" ? "Xác nhận đặt sân" : "Tiếp tục thanh toán"}
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Confirmation / Payment */}
            {currentStep === 4 && (
              <Card className="p-6">
                {/* Payment at venue - Success immediately */}
                {paymentMethod === "at_venue" && (
                  <div className="text-center py-8">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="h-10 w-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 text-foreground">Đặt Sân Thành Công!</h2>
                    <p className="text-muted-foreground mb-6">
                      Đơn đặt sân của bạn đã được ghi nhận. Vui lòng thanh toán khi đến sân.
                    </p>

                    <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                      <h3 className="font-semibold mb-3 text-foreground">Thông tin đặt sân</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mã đặt sân:</span>
                          <span className="font-medium text-foreground">BK-2025-001234</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sân:</span>
                          <span className="text-foreground">{field.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Ngày:</span>
                          <span className="text-foreground">{selectedDate ? formatDate(selectedDate) : ""}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Giờ:</span>
                          <span className="text-foreground">
                            {selectedTime} -{" "}
                            {`${(Number.parseInt(selectedTime.split(":")[0]) + duration).toString().padStart(2, "0")}:00`}
                          </span>
                        </div>
                        <div className="flex justify-between border-t border-border pt-2 mt-2">
                          <span className="text-muted-foreground">Tổng tiền:</span>
                          <span className="font-bold text-primary">{finalTotal.toLocaleString()}đ</span>
                        </div>
                      </div>
                    </div>

                    <Alert className="mb-6 text-left border-primary/30 bg-primary/5">
                      <Info className="h-4 w-4 text-primary" />
                      <AlertDescription className="text-foreground">
                        Vui lòng đến sân trước 15 phút và thanh toán <strong>{finalTotal.toLocaleString()}đ</strong> cho
                        nhân viên.
                      </AlertDescription>
                    </Alert>

                    <div className="flex gap-4">
                      <Link href="/bookings" className="flex-1">
                        <Button variant="outline" className="w-full bg-transparent">
                          Xem đơn đặt
                        </Button>
                      </Link>
                      <Link href="/" className="flex-1">
                        <Button className="w-full">Về trang chủ</Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* MoMo / VNPay - Auto processing */}
                {(paymentMethod === "momo" || paymentMethod === "vnpay") && (
                  <div className="text-center py-8">
                    {paymentStatus === "processing" && (
                      <>
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Loader2 className="h-10 w-10 text-primary animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-foreground">Đang xử lý thanh toán...</h2>
                        <p className="text-muted-foreground mb-6">
                          Vui lòng chờ trong giây lát. Hệ thống đang xác nhận thanh toán từ{" "}
                          {paymentMethod === "momo" ? "MoMo" : "VNPay"}.
                        </p>
                      </>
                    )}

                    {paymentStatus === "success" && (
                      <>
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-foreground">Thanh Toán Thành Công!</h2>
                        <p className="text-muted-foreground mb-6">
                          Đơn đặt sân của bạn đã được xác nhận và thanh toán thành công.
                        </p>

                        <div className="bg-muted/50 rounded-lg p-4 mb-6 text-left">
                          <h3 className="font-semibold mb-3 text-foreground">Thông tin đặt sân</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Mã đặt sân:</span>
                              <span className="font-medium text-foreground">BK-2025-001234</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sân:</span>
                              <span className="text-foreground">{field.name}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Ngày:</span>
                              <span className="text-foreground">{selectedDate ? formatDate(selectedDate) : ""}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Giờ:</span>
                              <span className="text-foreground">
                                {selectedTime} -{" "}
                                {`${(Number.parseInt(selectedTime.split(":")[0]) + duration).toString().padStart(2, "0")}:00`}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Thanh toán:</span>
                              <span className="text-foreground">{paymentMethod === "momo" ? "Ví MoMo" : "VNPay"}</span>
                            </div>
                            <div className="flex justify-between border-t border-border pt-2 mt-2">
                              <span className="text-muted-foreground">Đã thanh toán:</span>
                              <span className="font-bold text-primary">{finalTotal.toLocaleString()}đ</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <Link href="/bookings" className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              Xem đơn đặt
                            </Button>
                          </Link>
                          <Link href="/" className="flex-1">
                            <Button className="w-full">Về trang chủ</Button>
                          </Link>
                        </div>
                      </>
                    )}

                    {paymentStatus === "failed" && (
                      <>
                        <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <XCircle className="h-10 w-10 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-foreground">Thanh Toán Thất Bại</h2>
                        <p className="text-muted-foreground mb-6">Không thể hoàn tất thanh toán. Vui lòng thử lại.</p>
                        <div className="flex gap-4">
                          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                            Quay lại
                          </Button>
                          <Button
                            className="flex-1"
                            onClick={() => {
                              setPaymentStatus("pending")
                              setCountdown(1800)
                            }}
                          >
                            Thử lại
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Bank Transfer - Manual with QR */}
                {paymentMethod === "bank" && (
                  <div className="py-4">
                    {paymentStatus !== "success" ? (
                      <>
                        <div className="text-center mb-6">
                          <h2 className="text-xl font-bold mb-2 text-foreground">Chuyển Khoản Ngân Hàng</h2>
                          <p className="text-muted-foreground">Quét mã QR hoặc chuyển khoản theo thông tin bên dưới</p>
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Thời gian còn lại: </span>
                            <span className="font-mono font-bold text-primary">{formatCountdown(countdown)}</span>
                          </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex justify-center mb-6">
                          <div className="bg-white p-4 rounded-lg">
                            <QrCode className="h-48 w-48 text-gray-800" />
                          </div>
                        </div>

                        {/* Bank Info */}
                        <div className="bg-muted/50 rounded-lg p-4 mb-6 space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Ngân hàng:</span>
                            <span className="font-medium text-foreground">Vietcombank</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Số tài khoản:</span>
                            <span className="font-mono font-medium text-foreground">1234567890</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Chủ tài khoản:</span>
                            <span className="font-medium text-foreground">NGUYEN VAN A</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Nội dung CK:</span>
                            <span className="font-mono font-medium text-primary">BK2025001234</span>
                          </div>
                          <div className="flex justify-between items-center border-t border-border pt-3">
                            <span className="text-muted-foreground">Số tiền:</span>
                            <span className="font-bold text-xl text-primary">{finalTotal.toLocaleString()}đ</span>
                          </div>
                        </div>

                        <Alert className="mb-6 border-blue-500/30 bg-blue-500/10">
                          <Info className="h-4 w-4 text-blue-600" />
                          <AlertDescription className="text-blue-700 dark:text-blue-400">
                            Sau khi chuyển khoản, vui lòng nhấn nút bên dưới để thông báo cho chủ sân xác nhận.
                          </AlertDescription>
                        </Alert>

                        <div className="flex gap-4">
                          <Button variant="outline" className="flex-1 bg-transparent" onClick={handleBack}>
                            Quay lại
                          </Button>
                          <Button className="flex-1" onClick={handleBankTransferNotify}>
                            Tôi đã chuyển khoản
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2 text-foreground">Đã Ghi Nhận!</h2>
                        <p className="text-muted-foreground mb-6">
                          Chủ sân sẽ xác nhận thanh toán trong thời gian sớm nhất.
                        </p>
                        <div className="flex gap-4">
                          <Link href="/bookings" className="flex-1">
                            <Button variant="outline" className="w-full bg-transparent">
                              Xem đơn đặt
                            </Button>
                          </Link>
                          <Link href="/" className="flex-1">
                            <Button className="w-full">Về trang chủ</Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar - Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Thông tin đặt sân</h3>

              {/* Field Image */}
              <div className="relative w-full h-40 rounded-lg overflow-hidden mb-4">
                <img src={field.image || "/placeholder.svg"} alt={field.name} className="w-full h-full object-cover" />
              </div>

              {/* Field Info */}
              <h4 className="text-lg font-semibold text-foreground">{field.name}</h4>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-4 w-4" />
                <span>{field.address}</span>
              </div>

              <div className="border-t border-border my-4"></div>

              {/* Booking Details */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ngày</span>
                  <span className="font-medium text-foreground">
                    {selectedDate ? formatDate(selectedDate) : "Chưa chọn"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Giờ</span>
                  <span className="font-medium text-foreground">
                    {selectedTime
                      ? `${selectedTime} - ${`${(Number.parseInt(selectedTime.split(":")[0]) + duration).toString().padStart(2, "0")}:00`}`
                      : "Chưa chọn"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span className="font-medium text-foreground">{duration} giờ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Đơn giá</span>
                  <span className="font-medium text-foreground">{basePrice.toLocaleString()}đ/giờ</span>
                </div>
              </div>

              <div className="border-t border-border my-4"></div>

              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="text-foreground">{subtotal.toLocaleString()}đ</span>
                </div>

                {isRecurring && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">x {recurringWeeks} lần</span>
                      <span className="text-foreground">{(subtotal * recurringWeeks).toLocaleString()}đ</span>
                    </div>
                    <div className="flex justify-between text-primary">
                      <span>Giảm định kỳ (10%)</span>
                      <span>-{(subtotal * recurringWeeks * recurringDiscount).toLocaleString()}đ</span>
                    </div>
                  </>
                )}

                {appliedVoucher && (
                  <div className="flex justify-between text-primary">
                    <span>Voucher ({appliedVoucher.code})</span>
                    <span>-{voucherDiscount.toLocaleString()}đ</span>
                  </div>
                )}

                <div className="border-t border-border pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Tổng cộng</span>
                    <span className="font-bold text-2xl text-primary">{finalTotal.toLocaleString()}đ</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
