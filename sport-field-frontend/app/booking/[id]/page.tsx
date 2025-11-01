"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Check, MapPin, Clock, Users } from "lucide-react"

const mockFieldDetails = {
  1: {
    name: "Green Valley Soccer Field",
    location: "District 1, HCMC",
    price: 500000,
  },
}

export default function BookingPage({ params }: { params: { id: string } }) {
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
    paymentMethod: "card",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setBookingData((prev) => ({ ...prev, [name]: value }))
  }

  const totalPrice = Number.parseInt(bookingData.duration || "1") * (field?.price || 0)

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
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/field/${params.id}`} className="text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-xl font-bold">Hoàn tất đặt sân</h1>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-12">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition ${
                  s <= step ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                }`}
              >
                {s < step ? <Check className="w-5 h-5" /> : s}
              </div>
              {s < 4 && <div className={`flex-1 h-1 mx-2 transition ${s < step ? "bg-primary" : "bg-muted"}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Step 1: Date & Time */}
            {step === 1 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Chọn ngày & giờ</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Ngày</label>
                    <Input type="date" name="date" value={bookingData.date} onChange={handleChange} required />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Giờ bắt đầu</label>
                    <select
                      name="time"
                      value={bookingData.time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                      required
                    >
                      <option value="">Chọn giờ</option>
                      <option value="08:00">08:00</option>
                      <option value="09:00">09:00</option>
                      <option value="10:00">10:00</option>
                      <option value="14:00">14:00</option>
                      <option value="15:00">15:00</option>
                      <option value="16:00">16:00</option>
                      <option value="18:00">18:00</option>
                      <option value="19:00">19:00</option>
                      <option value="20:00">20:00</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Thời lượng</label>
                    <select
                      name="duration"
                      value={bookingData.duration}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-md bg-background"
                    >
                      <option value="1">1 giờ</option>
                      <option value="2">2 giờ</option>
                      <option value="3">3 giờ</option>
                      <option value="4">4 giờ</option>
                    </select>
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!bookingData.date || !bookingData.time}
                    className="w-full"
                  >
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 2: Personal Info */}
            {step === 2 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Thông tin của bạn</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Họ và tên</label>
                    <Input
                      type="text"
                      name="fullName"
                      placeholder="Nguyễn Văn A"
                      value={bookingData.fullName}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                    <Input
                      type="email"
                      name="email"
                      placeholder="nguyenvana@example.com"
                      value={bookingData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Số điện thoại</label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+84 123 456 789"
                      value={bookingData.phone}
                      onChange={handleChange}
                      required
                    />
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
                      className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Quay lại
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!bookingData.fullName || !bookingData.email || !bookingData.phone}
                      className="flex-1"
                    >
                      Tiếp tục
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <Card className="p-8">
                <h2 className="text-2xl font-bold mb-6">Phương thức thanh toán</h2>
                <div className="space-y-4 mb-6">
                  {[
                    { id: "card", label: "Thẻ tín dụng/Ghi nợ", icon: "💳" },
                    { id: "bank", label: "Chuyển khoản ngân hàng", icon: "🏦" },
                    { id: "wallet", label: "Ví điện tử", icon: "📱" },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className="flex items-center p-4 border border-border rounded-lg cursor-pointer hover:bg-muted transition"
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={bookingData.paymentMethod === method.id}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <span className="ml-3 text-lg">{method.icon}</span>
                      <span className="ml-3 font-medium text-foreground">{method.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Quay lại
                  </Button>
                  <Button onClick={() => setStep(4)} className="flex-1">
                    Tiếp tục
                  </Button>
                </div>
              </Card>
            )}

            {/* Step 4: Confirmation */}
            {step === 4 && (
              <Card className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">Đặt sân thành công!</h2>
                  <p className="text-muted-foreground mt-2">Đơn đặt sân của bạn đã được tạo thành công</p>
                </div>

                <div className="bg-muted p-6 rounded-lg mb-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mã đặt sân</span>
                    <span className="font-bold">#BK-2025-001234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email xác nhận</span>
                    <span className="font-bold">{bookingData.email}</span>
                  </div>
                </div>

                <div className="flex gap-4">
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

          {/* Booking Summary */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-lg font-bold mb-6">Tóm tắt đặt sân</h3>

              <div className="space-y-4 pb-6 border-b border-border">
                <div>
                  <h4 className="font-bold text-foreground mb-1">{field.name}</h4>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {field.location}
                  </div>
                </div>

                {bookingData.date && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>
                      {bookingData.date} at {bookingData.time}
                    </span>
                  </div>
                )}

                {bookingData.duration && (
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{bookingData.duration} giờ</span>
                  </div>
                )}
              </div>

              <div className="space-y-3 py-6 border-b border-border">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Giá mỗi giờ</span>
                  <span>{field.price.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Thời lượng</span>
                  <span>{bookingData.duration} giờ</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span>50,000 VND</span>
                </div>
              </div>

              <div className="py-6 flex justify-between items-center">
                <span className="font-bold text-foreground">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{(totalPrice + 50000).toLocaleString()} VND</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
