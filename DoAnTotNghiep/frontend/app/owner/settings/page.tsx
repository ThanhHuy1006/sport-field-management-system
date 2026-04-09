"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import {
  ArrowLeft,
  Save,
  Zap,
  Clock,
  UserCheck,
  CalendarCheck,
  Info,
  Building2,
  CreditCard,
  Bell,
  Repeat,
  Percent,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function OwnerSettingsPage() {
  const { toast } = useToast()

  // Auto-approval settings state
  const [autoApproval, setAutoApproval] = useState({
    enabled: false,
    mode: "all" as "all" | "returning" | "advance",
    returningThreshold: 3,
    advanceHours: 24,
    allowFieldOverride: true,
  })

  const [recurringSettings, setRecurringSettings] = useState({
    enabled: true,
    discountPercent: 10,
    minWeeks: 4,
    maxWeeks: 12,
    autoRenew: false,
    reminderDays: 3,
  })

  // Notification settings state
  const [notifications, setNotifications] = useState({
    newBooking: true,
    cancelBooking: true,
    paymentConfirm: true,
    weeklyReport: true,
    recurringReminder: true,
  })

  const handleSave = () => {
    console.log("[v0] Saving settings:", { autoApproval, recurringSettings, notifications })
    toast({
      title: "Đã lưu cài đặt",
      description: "Các thay đổi của bạn đã được lưu thành công.",
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Cài Đặt</h1>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Lưu
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Auto-Approval Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cài Đặt Duyệt Đơn</h2>
              <p className="text-sm text-muted-foreground">Tự động duyệt đơn đặt sân hoặc duyệt thủ công</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Master Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  id="auto-approval"
                  checked={autoApproval.enabled}
                  onCheckedChange={(checked) => setAutoApproval({ ...autoApproval, enabled: checked })}
                />
                <div>
                  <Label htmlFor="auto-approval" className="text-base font-medium cursor-pointer">
                    Tự động duyệt đơn đặt sân
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {autoApproval.enabled
                      ? "Đơn sẽ được duyệt tự động theo điều kiện bên dưới"
                      : "Bạn sẽ duyệt từng đơn thủ công"}
                  </p>
                </div>
              </div>
            </div>

            {/* Approval Mode */}
            {autoApproval.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                <Label className="text-sm font-medium text-muted-foreground">Chế độ duyệt tự động</Label>
                <RadioGroup
                  value={autoApproval.mode}
                  onValueChange={(value) =>
                    setAutoApproval({ ...autoApproval, mode: value as typeof autoApproval.mode })
                  }
                  className="space-y-3"
                >
                  {/* Option 1: All */}
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${autoApproval.mode === "all" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <RadioGroupItem value="all" id="mode-all" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-green-600" />
                        <Label htmlFor="mode-all" className="font-medium cursor-pointer">
                          Tự động duyệt tất cả
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Tất cả đơn đặt sân sẽ được duyệt ngay lập tức sau khi khách đặt
                      </p>
                    </div>
                  </div>

                  {/* Option 2: Returning customers */}
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${autoApproval.mode === "returning" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <RadioGroupItem value="returning" id="mode-returning" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-blue-600" />
                        <Label htmlFor="mode-returning" className="font-medium cursor-pointer">
                          Chỉ khách quen
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Chỉ tự động duyệt cho khách đã từng đặt sân thành công
                      </p>
                      {autoApproval.mode === "returning" && (
                        <div className="mt-3 flex items-center gap-2">
                          <Label className="text-sm">Số lần đặt tối thiểu:</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            value={autoApproval.returningThreshold}
                            onChange={(e) =>
                              setAutoApproval({
                                ...autoApproval,
                                returningThreshold: Number.parseInt(e.target.value) || 1,
                              })
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">lần</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Option 3: Advance booking */}
                  <div
                    className={`flex items-start gap-3 p-4 rounded-lg border-2 transition-colors cursor-pointer ${autoApproval.mode === "advance" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                  >
                    <RadioGroupItem value="advance" id="mode-advance" className="mt-1" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <Label htmlFor="mode-advance" className="font-medium cursor-pointer">
                          Đặt trước thời hạn
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Chỉ tự động duyệt khi khách đặt trước một khoảng thời gian nhất định
                      </p>
                      {autoApproval.mode === "advance" && (
                        <div className="mt-3 flex items-center gap-2">
                          <Label className="text-sm">Đặt trước tối thiểu:</Label>
                          <Input
                            type="number"
                            min={1}
                            max={168}
                            value={autoApproval.advanceHours}
                            onChange={(e) =>
                              setAutoApproval({ ...autoApproval, advanceHours: Number.parseInt(e.target.value) || 24 })
                            }
                            className="w-20"
                          />
                          <span className="text-sm text-muted-foreground">giờ</span>
                        </div>
                      )}
                    </div>
                  </div>
                </RadioGroup>

                {/* Allow field override */}
                <div className="flex items-center gap-3 pt-4 border-t border-border">
                  <Checkbox
                    id="allow-override"
                    checked={autoApproval.allowFieldOverride}
                    onCheckedChange={(checked) =>
                      setAutoApproval({ ...autoApproval, allowFieldOverride: checked as boolean })
                    }
                  />
                  <div>
                    <Label htmlFor="allow-override" className="font-medium cursor-pointer">
                      Cho phép cài đặt riêng từng sân
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Có thể override cài đặt này cho từng sân trong trang chỉnh sửa sân
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Repeat className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cài Đặt Đặt Sân Định Kỳ</h2>
              <p className="text-sm text-muted-foreground">Cho phép khách đặt lịch cố định hàng tuần/tháng</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Enable Toggle */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Switch
                  id="recurring-enabled"
                  checked={recurringSettings.enabled}
                  onCheckedChange={(checked) => setRecurringSettings({ ...recurringSettings, enabled: checked })}
                />
                <div>
                  <Label htmlFor="recurring-enabled" className="text-base font-medium cursor-pointer">
                    Cho phép đặt sân định kỳ
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Khách hàng có thể đặt lịch cố định với ưu đãi giảm giá
                  </p>
                </div>
              </div>
            </div>

            {recurringSettings.enabled && (
              <div className="space-y-4 pl-4 border-l-2 border-green-500/30">
                {/* Discount */}
                <div className="p-4 bg-muted/50 border border-border rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Percent className="w-4 h-4 text-green-600 dark:text-green-400" />
                    <Label className="font-medium">Giảm giá cho đặt định kỳ</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      min={0}
                      max={50}
                      value={recurringSettings.discountPercent}
                      onChange={(e) =>
                        setRecurringSettings({
                          ...recurringSettings,
                          discountPercent: Number.parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-24"
                    />
                    <span className="text-muted-foreground">% giảm giá</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Khách hàng sẽ được giảm {recurringSettings.discountPercent}% tổng hóa đơn khi đặt định kỳ
                  </p>
                </div>

                {/* Min/Max Weeks */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm mb-2 block">Số tuần tối thiểu</Label>
                    <Input
                      type="number"
                      min={2}
                      max={52}
                      value={recurringSettings.minWeeks}
                      onChange={(e) =>
                        setRecurringSettings({
                          ...recurringSettings,
                          minWeeks: Number.parseInt(e.target.value) || 4,
                        })
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-sm mb-2 block">Số tuần tối đa</Label>
                    <Input
                      type="number"
                      min={4}
                      max={52}
                      value={recurringSettings.maxWeeks}
                      onChange={(e) =>
                        setRecurringSettings({
                          ...recurringSettings,
                          maxWeeks: Number.parseInt(e.target.value) || 12,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Auto Renew */}
                <div className="flex items-center gap-3 p-4 border border-border rounded-lg">
                  <Checkbox
                    id="auto-renew"
                    checked={recurringSettings.autoRenew}
                    onCheckedChange={(checked) =>
                      setRecurringSettings({ ...recurringSettings, autoRenew: checked as boolean })
                    }
                  />
                  <div>
                    <Label htmlFor="auto-renew" className="font-medium cursor-pointer">
                      Tự động gia hạn
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Tự động gia hạn lịch định kỳ khi hết hạn (khách có thể hủy bất cứ lúc nào)
                    </p>
                  </div>
                </div>

                {/* Reminder */}
                <div>
                  <Label className="text-sm mb-2 block">Nhắc nhở trước khi hết hạn</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={14}
                      value={recurringSettings.reminderDays}
                      onChange={(e) =>
                        setRecurringSettings({
                          ...recurringSettings,
                          reminderDays: Number.parseInt(e.target.value) || 3,
                        })
                      }
                      className="w-20"
                    />
                    <span className="text-muted-foreground">ngày trước</span>
                  </div>
                </div>

                {/* Info */}
                <div className="flex items-start gap-2 p-3 bg-muted/50 border border-border rounded-lg">
                  <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-foreground">
                    <p className="font-medium mb-1">Lợi ích đặt định kỳ:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Doanh thu ổn định hàng tháng</li>
                      <li>Khách hàng trung thành hơn</li>
                      <li>Giảm công sức quản lý lịch</li>
                      <li>Tăng tỷ lệ lấp đầy sân</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Company Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Thông Tin Công Ty</h2>
              <p className="text-sm text-muted-foreground">Thông tin hiển thị trên hóa đơn</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tên Công Ty</Label>
              <Input defaultValue="Green Valley Sports" className="mt-1.5" />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" defaultValue="contact@greenvalley.com" className="mt-1.5" />
            </div>
            <div>
              <Label>Số Điện Thoại</Label>
              <Input defaultValue="+84 123 456 789" className="mt-1.5" />
            </div>
            <div>
              <Label>Mã Số Thuế</Label>
              <Input defaultValue="0123456789" className="mt-1.5" />
            </div>
            <div className="md:col-span-2">
              <Label>Địa Chỉ</Label>
              <Input defaultValue="123 Đường Thể Thao, Quận 1, TP.HCM" className="mt-1.5" />
            </div>
          </div>
        </Card>

        {/* Bank Information */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <CreditCard className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Thông Tin Ngân Hàng</h2>
              <p className="text-sm text-muted-foreground">Tài khoản nhận thanh toán</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Tên Ngân Hàng</Label>
              <Input defaultValue="Vietcombank" className="mt-1.5" />
            </div>
            <div>
              <Label>Chi Nhánh</Label>
              <Input defaultValue="TP.HCM" className="mt-1.5" />
            </div>
            <div>
              <Label>Số Tài Khoản</Label>
              <Input defaultValue="1234567890" className="mt-1.5" />
            </div>
            <div>
              <Label>Chủ Tài Khoản</Label>
              <Input defaultValue="NGUYEN VAN A" className="mt-1.5" />
            </div>
          </div>
        </Card>

        {/* Notification Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Cài Đặt Thông Báo</h2>
              <p className="text-sm text-muted-foreground">Quản lý các thông báo bạn nhận được</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              {
                key: "newBooking",
                label: "Thông Báo Đặt Sân Mới",
                description: "Nhận thông báo khi có đơn đặt sân mới",
                icon: CalendarCheck,
              },
              {
                key: "cancelBooking",
                label: "Cảnh Báo Hủy Đặt Sân",
                description: "Nhận thông báo khi có đơn đặt sân bị hủy",
                icon: Clock,
              },
              {
                key: "paymentConfirm",
                label: "Xác Nhận Thanh Toán",
                description: "Nhận email xác nhận thanh toán",
                icon: CreditCard,
              },
              {
                key: "weeklyReport",
                label: "Báo Cáo Hàng Tuần",
                description: "Nhận báo cáo hiệu suất hàng tuần",
                icon: Info,
              },
              {
                key: "recurringReminder",
                label: "Nhắc Nhở Lịch Định Kỳ",
                description: "Nhận thông báo khi lịch định kỳ sắp hết hạn",
                icon: Repeat,
              },
            ].map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                  <Switch
                    checked={notifications[item.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, [item.key]: checked })}
                  />
                </div>
              )
            })}
          </div>
        </Card>

        {/* Save Button - Mobile */}
        <div className="lg:hidden">
          <Button onClick={handleSave} className="w-full" size="lg">
            <Save className="w-4 h-4 mr-2" />
            Lưu Cài Đặt
          </Button>
        </div>
      </div>
    </main>
  )
}
