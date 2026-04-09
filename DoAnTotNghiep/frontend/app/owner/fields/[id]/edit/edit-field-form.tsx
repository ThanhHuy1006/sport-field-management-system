"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, X, Clock, DollarSign, Zap, UserCheck, CalendarCheck, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface FieldData {
  name: string
  type: string
  location: string
  address: string
  capacity: string
  price: string
  weekendPrice?: string
  description: string
  status: string
  amenities: string[]
  openTime: string
  closeTime: string
}

export default function EditFieldForm({ fieldId, existingData }: { fieldId: string; existingData: FieldData }) {
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: existingData.name,
    type: existingData.type,
    location: existingData.location,
    address: existingData.address,
    capacity: existingData.capacity,
    description: existingData.description,
    status: existingData.status,
  })

  const [pricing, setPricing] = useState({
    weekdayPrice: existingData.price,
    weekendPrice: existingData.weekendPrice || String(Number(existingData.price) * 1.2),
  })

  const [amenities, setAmenities] = useState<string[]>(existingData.amenities)
  const [newAmenity, setNewAmenity] = useState("")
  const [operatingHours, setOperatingHours] = useState({
    openTime: existingData.openTime,
    closeTime: existingData.closeTime,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [autoApprovalOverride, setAutoApprovalOverride] = useState({
    enabled: false, // Whether to override global settings
    useAutoApproval: true, // If override enabled, whether to auto-approve or not
    mode: "global" as "global" | "all" | "returning" | "advance" | "manual",
    returningThreshold: 3,
    advanceHours: 24,
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sân"
    if (!formData.type) newErrors.type = "Vui lòng chọn loại thể thao"
    if (!formData.location.trim()) newErrors.location = "Vui lòng nhập khu vực"
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ chi tiết"

    const weekdayPrice = Number.parseInt(pricing.weekdayPrice)
    if (!pricing.weekdayPrice) {
      newErrors.weekdayPrice = "Vui lòng nhập giá ngày thường"
    } else if (isNaN(weekdayPrice) || weekdayPrice <= 0) {
      newErrors.weekdayPrice = "Giá thuê phải là số dương"
    } else if (weekdayPrice < 50000) {
      newErrors.weekdayPrice = "Giá thuê tối thiểu 50,000 VND"
    }

    const weekendPrice = Number.parseInt(pricing.weekendPrice)
    if (!pricing.weekendPrice) {
      newErrors.weekendPrice = "Vui lòng nhập giá cuối tuần"
    } else if (isNaN(weekendPrice) || weekendPrice <= 0) {
      newErrors.weekendPrice = "Giá thuê phải là số dương"
    } else if (weekendPrice < 50000) {
      newErrors.weekendPrice = "Giá thuê tối thiểu 50,000 VND"
    }

    const capacity = Number.parseInt(formData.capacity)
    if (!formData.capacity) {
      newErrors.capacity = "Vui lòng nhập sức chứa"
    } else if (isNaN(capacity) || capacity <= 0) {
      newErrors.capacity = "Sức chứa phải là số dương"
    } else if (capacity > 100) {
      newErrors.capacity = "Sức chứa tối đa 100 người"
    }

    if (operatingHours.openTime >= operatingHours.closeTime) {
      newErrors.operatingHours = "Giờ mở cửa phải trước giờ đóng cửa"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng kiểm tra lại các trường bắt buộc.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log("[v0] Updated field data:", {
      fieldId,
      formData,
      pricing,
      amenities,
      operatingHours,
      autoApprovalOverride,
    })

    toast({
      title: "Đã lưu thay đổi",
      description: "Thông tin sân đã được cập nhật thành công.",
    })

    setIsSubmitting(false)
    router.push("/owner/fields")
  }

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()])
      setNewAmenity("")
    }
  }

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/fields" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Chỉnh Sửa Sân</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Thông tin cơ bản */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Sân *</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Sân Bóng Đá Green Valley"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }}
                  className={errors.name ? "border-red-500" : ""}
                  required
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Loại Thể Thao *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, type: value })
                      if (errors.type) setErrors({ ...errors, type: "" })
                    }}
                  >
                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn loại thể thao" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soccer">Bóng Đá</SelectItem>
                      <SelectItem value="basketball">Bóng Rổ</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="badminton">Cầu Lông</SelectItem>
                      <SelectItem value="volleyball">Bóng Chuyền</SelectItem>
                      <SelectItem value="pickleball">Pickleball</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Trạng Thái *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt Động</SelectItem>
                      <SelectItem value="inactive">Không Hoạt Động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="capacity">Sức Chứa (người) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="22"
                  value={formData.capacity}
                  onChange={(e) => {
                    setFormData({ ...formData, capacity: e.target.value })
                    if (errors.capacity) setErrors({ ...errors, capacity: "" })
                  }}
                  className={errors.capacity ? "border-red-500" : ""}
                  required
                />
                {errors.capacity && <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>}
              </div>

              <div>
                <Label htmlFor="description">Mô Tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sân..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* Vị trí */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Vị Trí</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Khu Vực *</Label>
                <Input
                  id="location"
                  placeholder="Ví dụ: Quận 1, TP.HCM"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value })
                    if (errors.location) setErrors({ ...errors, location: "" })
                  }}
                  className={errors.location ? "border-red-500" : ""}
                  required
                />
                {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="address">Địa Chỉ Chi Tiết *</Label>
                <Input
                  id="address"
                  placeholder="Số nhà, tên đường..."
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value })
                    if (errors.address) setErrors({ ...errors, address: "" })
                  }}
                  className={errors.address ? "border-red-500" : ""}
                  required
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Giá & Giờ Hoạt Động</h2>
            </div>

            {/* Bảng giá */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Bảng Giá Thuê Sân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weekdayPrice">Giá Ngày Thường (T2-T6) *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="weekdayPrice"
                      type="number"
                      placeholder="500000"
                      value={pricing.weekdayPrice}
                      onChange={(e) => {
                        setPricing({ ...pricing, weekdayPrice: e.target.value })
                        if (errors.weekdayPrice) setErrors({ ...errors, weekdayPrice: "" })
                      }}
                      className={errors.weekdayPrice ? "border-red-500" : ""}
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">VND/giờ</span>
                  </div>
                  {errors.weekdayPrice && <p className="text-sm text-red-500 mt-1">{errors.weekdayPrice}</p>}
                </div>

                <div>
                  <Label htmlFor="weekendPrice">Giá Cuối Tuần (T7-CN) *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="weekendPrice"
                      type="number"
                      placeholder="600000"
                      value={pricing.weekendPrice}
                      onChange={(e) => {
                        setPricing({ ...pricing, weekendPrice: e.target.value })
                        if (errors.weekendPrice) setErrors({ ...errors, weekendPrice: "" })
                      }}
                      className={errors.weekendPrice ? "border-red-500" : ""}
                      required
                    />
                    <span className="text-sm text-muted-foreground whitespace-nowrap">VND/giờ</span>
                  </div>
                  {errors.weekendPrice && <p className="text-sm text-red-500 mt-1">{errors.weekendPrice}</p>}
                </div>
              </div>
            </div>

            {/* Giờ hoạt động */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">Giờ Hoạt Động</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="openTime">Giờ Mở Cửa</Label>
                  <Input
                    id="openTime"
                    type="time"
                    value={operatingHours.openTime}
                    onChange={(e) => {
                      setOperatingHours({
                        ...operatingHours,
                        openTime: e.target.value,
                      })
                      if (errors.operatingHours) setErrors({ ...errors, operatingHours: "" })
                    }}
                    className={errors.operatingHours ? "border-red-500" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="closeTime">Giờ Đóng Cửa</Label>
                  <Input
                    id="closeTime"
                    type="time"
                    value={operatingHours.closeTime}
                    onChange={(e) => {
                      setOperatingHours({
                        ...operatingHours,
                        closeTime: e.target.value,
                      })
                      if (errors.operatingHours) setErrors({ ...errors, operatingHours: "" })
                    }}
                    className={errors.operatingHours ? "border-red-500" : ""}
                  />
                </div>
              </div>
              {errors.operatingHours && <p className="text-sm text-red-500 mt-2">{errors.operatingHours}</p>}
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Cài Đặt Duyệt Đơn Riêng</h2>
                <p className="text-sm text-muted-foreground">Override cài đặt duyệt đơn global cho sân này</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Override Toggle */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Switch
                    id="override-approval"
                    checked={autoApprovalOverride.enabled}
                    onCheckedChange={(checked) =>
                      setAutoApprovalOverride({ ...autoApprovalOverride, enabled: checked })
                    }
                  />
                  <div>
                    <Label htmlFor="override-approval" className="font-medium cursor-pointer">
                      Sử dụng cài đặt riêng cho sân này
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {autoApprovalOverride.enabled
                        ? "Cài đặt riêng được áp dụng"
                        : "Sử dụng cài đặt global từ trang Cài đặt"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Override Options */}
              {autoApprovalOverride.enabled && (
                <div className="space-y-4 pl-4 border-l-2 border-primary/30">
                  <RadioGroup
                    value={autoApprovalOverride.mode}
                    onValueChange={(value) =>
                      setAutoApprovalOverride({
                        ...autoApprovalOverride,
                        mode: value as typeof autoApprovalOverride.mode,
                      })
                    }
                    className="space-y-3"
                  >
                    {/* Manual */}
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${autoApprovalOverride.mode === "manual" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <RadioGroupItem value="manual" id="field-mode-manual" className="mt-1" />
                      <div>
                        <Label htmlFor="field-mode-manual" className="font-medium cursor-pointer">
                          Duyệt thủ công
                        </Label>
                        <p className="text-sm text-muted-foreground">Tất cả đơn đặt sân này phải được duyệt thủ công</p>
                      </div>
                    </div>

                    {/* Auto all */}
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${autoApprovalOverride.mode === "all" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <RadioGroupItem value="all" id="field-mode-all" className="mt-1" />
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="w-4 h-4 text-green-600" />
                        <div>
                          <Label htmlFor="field-mode-all" className="font-medium cursor-pointer">
                            Tự động duyệt tất cả
                          </Label>
                          <p className="text-sm text-muted-foreground">Mọi đơn đặt sân này đều được duyệt tự động</p>
                        </div>
                      </div>
                    </div>

                    {/* Returning */}
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${autoApprovalOverride.mode === "returning" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <RadioGroupItem value="returning" id="field-mode-returning" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-blue-600" />
                          <Label htmlFor="field-mode-returning" className="font-medium cursor-pointer">
                            Chỉ khách quen
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Chỉ tự động cho khách đã đặt sân này trước đó</p>
                        {autoApprovalOverride.mode === "returning" && (
                          <div className="mt-2 flex items-center gap-2">
                            <Label className="text-sm">Tối thiểu:</Label>
                            <Input
                              type="number"
                              min={1}
                              max={10}
                              value={autoApprovalOverride.returningThreshold}
                              onChange={(e) =>
                                setAutoApprovalOverride({
                                  ...autoApprovalOverride,
                                  returningThreshold: Number.parseInt(e.target.value) || 1,
                                })
                              }
                              className="w-16 h-8"
                            />
                            <span className="text-sm text-muted-foreground">lần</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Advance */}
                    <div
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${autoApprovalOverride.mode === "advance" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
                    >
                      <RadioGroupItem value="advance" id="field-mode-advance" className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-orange-600" />
                          <Label htmlFor="field-mode-advance" className="font-medium cursor-pointer">
                            Đặt trước thời hạn
                          </Label>
                        </div>
                        <p className="text-sm text-muted-foreground">Chỉ tự động khi đặt trước một khoảng thời gian</p>
                        {autoApprovalOverride.mode === "advance" && (
                          <div className="mt-2 flex items-center gap-2">
                            <Label className="text-sm">Đặt trước:</Label>
                            <Input
                              type="number"
                              min={1}
                              max={168}
                              value={autoApprovalOverride.advanceHours}
                              onChange={(e) =>
                                setAutoApprovalOverride({
                                  ...autoApprovalOverride,
                                  advanceHours: Number.parseInt(e.target.value) || 24,
                                })
                              }
                              className="w-16 h-8"
                            />
                            <span className="text-sm text-muted-foreground">giờ</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Info */}
                  <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg">
                    <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Cài đặt này sẽ ghi đè cài đặt global trong trang Cài đặt chỉ cho sân này.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Tiện ích */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tiện Ích</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ví dụ: Bãi đỗ xe, Phòng thay đồ..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
                />
                <Button type="button" onClick={addAmenity}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                      <span className="text-sm">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Hình ảnh */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hình Ảnh</h2>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">Kéo thả hình ảnh hoặc click để chọn</p>
              <Button type="button" variant="outline" size="sm">
                Chọn Hình Ảnh
              </Button>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/owner/fields")}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : "Lưu Thay Đổi"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
