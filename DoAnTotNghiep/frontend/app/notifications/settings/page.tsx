"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Bell, Calendar, Tag, DollarSign, Star, Clock, Save, CheckCircle } from "lucide-react"

export default function NotificationSettingsPage() {
  const [settings, setSettings] = useState({
    // Kênh thông báo
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,

    // Loại thông báo
    bookingReminder: true,
    reminderTime: 60, // phút trước
    bookingStatus: true,
    paymentStatus: true,
    promotions: true,
    slotAvailable: false,
    reviews: true,
    systemUpdates: true,

    // Thời gian yên tĩnh
    quietHoursEnabled: false,
    quietStart: "22:00",
    quietEnd: "07:00",
  })

  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // Save settings logic here
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const updateSetting = (key: string, value: boolean | number | string) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/notifications">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Cài đặt thông báo</h1>
              <p className="text-sm text-muted-foreground">Tùy chỉnh cách bạn nhận thông báo</p>
            </div>
          </div>
          <Button onClick={handleSave} className="gap-2">
            {saved ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Đã lưu
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>

        <div className="space-y-6">
          {/* Kênh thông báo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Kênh thông báo
              </CardTitle>
              <CardDescription>Chọn cách bạn muốn nhận thông báo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email">Email</Label>
                  <p className="text-sm text-muted-foreground">Nhận thông báo qua email</p>
                </div>
                <Switch
                  id="email"
                  checked={settings.emailEnabled}
                  onCheckedChange={(v) => updateSetting("emailEnabled", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="push">Thông báo đẩy</Label>
                  <p className="text-sm text-muted-foreground">Nhận thông báo trên trình duyệt</p>
                </div>
                <Switch
                  id="push"
                  checked={settings.pushEnabled}
                  onCheckedChange={(v) => updateSetting("pushEnabled", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="sms">SMS</Label>
                  <p className="text-sm text-muted-foreground">Nhận thông báo qua tin nhắn SMS</p>
                </div>
                <Switch
                  id="sms"
                  checked={settings.smsEnabled}
                  onCheckedChange={(v) => updateSetting("smsEnabled", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Loại thông báo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Loại thông báo
              </CardTitle>
              <CardDescription>Chọn loại thông báo bạn muốn nhận</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reminder" className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    Nhắc nhở trước giờ đặt
                  </Label>
                  <p className="text-sm text-muted-foreground">Nhận nhắc nhở trước khi đến giờ đặt sân</p>
                </div>
                <Switch
                  id="reminder"
                  checked={settings.bookingReminder}
                  onCheckedChange={(v) => updateSetting("bookingReminder", v)}
                />
              </div>

              {settings.bookingReminder && (
                <div className="ml-6 pl-4 border-l-2 border-muted">
                  <Label htmlFor="reminderTime" className="text-sm">
                    Nhắc trước (phút)
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      id="reminderTime"
                      type="number"
                      value={settings.reminderTime}
                      onChange={(e) => updateSetting("reminderTime", Number.parseInt(e.target.value) || 60)}
                      className="w-24"
                      min={15}
                      max={1440}
                    />
                    <span className="text-sm text-muted-foreground">phút</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="bookingStatus" className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Trạng thái đặt sân
                  </Label>
                  <p className="text-sm text-muted-foreground">Khi đơn được duyệt, từ chối hoặc hủy</p>
                </div>
                <Switch
                  id="bookingStatus"
                  checked={settings.bookingStatus}
                  onCheckedChange={(v) => updateSetting("bookingStatus", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="paymentStatus" className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    Thanh toán
                  </Label>
                  <p className="text-sm text-muted-foreground">Khi thanh toán được xác nhận</p>
                </div>
                <Switch
                  id="paymentStatus"
                  checked={settings.paymentStatus}
                  onCheckedChange={(v) => updateSetting("paymentStatus", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="promotions" className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-purple-500" />
                    Khuyến mãi
                  </Label>
                  <p className="text-sm text-muted-foreground">Ưu đãi, giảm giá và flash sale</p>
                </div>
                <Switch
                  id="promotions"
                  checked={settings.promotions}
                  onCheckedChange={(v) => updateSetting("promotions", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="slotAvailable" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-cyan-500" />
                    Slot trống
                  </Label>
                  <p className="text-sm text-muted-foreground">Khi sân yêu thích có slot trống</p>
                </div>
                <Switch
                  id="slotAvailable"
                  checked={settings.slotAvailable}
                  onCheckedChange={(v) => updateSetting("slotAvailable", v)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="reviews" className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    Đánh giá
                  </Label>
                  <p className="text-sm text-muted-foreground">Khi có đánh giá mới (cho chủ sân)</p>
                </div>
                <Switch id="reviews" checked={settings.reviews} onCheckedChange={(v) => updateSetting("reviews", v)} />
              </div>
            </CardContent>
          </Card>

          {/* Thời gian yên tĩnh */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Thời gian yên tĩnh
              </CardTitle>
              <CardDescription>Tắt thông báo trong khoảng thời gian nhất định</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="quietHours">Bật chế độ yên tĩnh</Label>
                  <p className="text-sm text-muted-foreground">Không nhận thông báo trong khoảng thời gian này</p>
                </div>
                <Switch
                  id="quietHours"
                  checked={settings.quietHoursEnabled}
                  onCheckedChange={(v) => updateSetting("quietHoursEnabled", v)}
                />
              </div>

              {settings.quietHoursEnabled && (
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <Label htmlFor="quietStart">Bắt đầu</Label>
                    <Input
                      id="quietStart"
                      type="time"
                      value={settings.quietStart}
                      onChange={(e) => updateSetting("quietStart", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quietEnd">Kết thúc</Label>
                    <Input
                      id="quietEnd"
                      type="time"
                      value={settings.quietEnd}
                      onChange={(e) => updateSetting("quietEnd", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
