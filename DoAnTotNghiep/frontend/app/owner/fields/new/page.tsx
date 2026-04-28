"use client"

import type React from "react"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  DollarSign,
  ImagePlus,
  Info,
  MapPin,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  createOwnerField,
  uploadOwnerFieldImages,
  type CreateOwnerFieldPayload,
} from "@/features/fields/services/owner-fields.service"

type SelectedImage = {
  file: File
  previewUrl: string
}

type OperatingHourItem = {
  day_of_week: number
  label: string
  open_time: string
  close_time: string
  is_closed: boolean
}

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

const SPORT_OPTIONS = [
  { value: "football", label: "Bóng đá" },
  { value: "basketball", label: "Bóng rổ" },
  { value: "tennis", label: "Tennis" },
  { value: "badminton", label: "Cầu lông" },
  { value: "volleyball", label: "Bóng chuyền" },
  { value: "pickleball", label: "Pickleball" },
]

const QUICK_AMENITIES = [
  "Bãi đỗ xe",
  "Wifi",
  "Phòng thay đồ",
  "Nhà vệ sinh",
  "Đèn chiếu sáng",
  "Căn tin",
  "Cho thuê dụng cụ",
  "Nước uống",
]

const DEFAULT_OPERATING_HOURS: OperatingHourItem[] = [
  { day_of_week: 1, label: "Thứ 2", open_time: "06:00", close_time: "22:00", is_closed: false },
  { day_of_week: 2, label: "Thứ 3", open_time: "06:00", close_time: "22:00", is_closed: false },
  { day_of_week: 3, label: "Thứ 4", open_time: "06:00", close_time: "22:00", is_closed: false },
  { day_of_week: 4, label: "Thứ 5", open_time: "06:00", close_time: "22:00", is_closed: false },
  { day_of_week: 5, label: "Thứ 6", open_time: "06:00", close_time: "22:00", is_closed: false },
  { day_of_week: 6, label: "Thứ 7", open_time: "06:00", close_time: "23:00", is_closed: false },
  { day_of_week: 7, label: "Chủ nhật", open_time: "06:00", close_time: "23:00", is_closed: false },
]

function formatMoney(value: string) {
  const number = Number(value || 0)
  if (!number) return "0 VND"

  return `${new Intl.NumberFormat("vi-VN").format(number)} VND`
}

export default function NewFieldPage() {
  const router = useRouter()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const selectedImagesRef = useRef<SelectedImage[]>([])

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    province: "TP. Hồ Chí Minh",
    district: "",
    ward: "",
    addressLine: "",
    capacity: "",
    description: "",
  })

  const [pricing, setPricing] = useState({
    weekdayPrice: "",
    weekendPrice: "",
  })

  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState("")
  const [operatingHours, setOperatingHours] = useState<OperatingHourItem[]>(DEFAULT_OPERATING_HOURS)
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    selectedImagesRef.current = selectedImages
  }, [selectedImages])

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [])

  const fullAddress = useMemo(() => {
    return [formData.addressLine.trim(), formData.ward.trim(), formData.district.trim(), formData.province.trim()]
      .filter(Boolean)
      .join(", ")
  }, [formData.addressLine, formData.ward, formData.district, formData.province])

  const openDaysCount = useMemo(() => {
    return operatingHours.filter((item) => !item.is_closed).length
  }, [operatingHours])

  const clearError = (key: string) => {
    if (!errors[key]) return

    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const updateOperatingHour = (
    dayOfWeek: number,
    key: "open_time" | "close_time" | "is_closed",
    value: string | boolean,
  ) => {
    setOperatingHours((prev) =>
      prev.map((item) =>
        item.day_of_week === dayOfWeek
          ? {
              ...item,
              [key]: value,
            }
          : item,
      ),
    )

    clearError("operatingHours")
  }

  const applySameHoursToAllOpenDays = () => {
    const firstOpenDay = operatingHours.find((item) => !item.is_closed)
    const openTime = firstOpenDay?.open_time || "06:00"
    const closeTime = firstOpenDay?.close_time || "22:00"

    setOperatingHours((prev) =>
      prev.map((item) =>
        item.is_closed
          ? item
          : {
              ...item,
              open_time: openTime,
              close_time: closeTime,
            },
      ),
    )

    clearError("operatingHours")

    toast({
      title: "Đã áp dụng giờ",
      description: `Áp dụng ${openTime} - ${closeTime} cho các ngày đang mở cửa.`,
    })
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sân"
    if (!formData.type) newErrors.type = "Vui lòng chọn loại thể thao"

    if (!formData.province.trim()) {
      newErrors.province = "Vui lòng nhập tỉnh/thành phố"
    }

    if (!formData.district.trim()) {
      newErrors.district = "Vui lòng nhập quận/huyện"
    }

    if (!formData.addressLine.trim()) {
      newErrors.addressLine = "Vui lòng nhập địa chỉ chi tiết"
    }

    const weekdayPrice = Number.parseInt(pricing.weekdayPrice, 10)
    if (!pricing.weekdayPrice) {
      newErrors.weekdayPrice = "Vui lòng nhập giá ngày thường"
    } else if (Number.isNaN(weekdayPrice) || weekdayPrice <= 0) {
      newErrors.weekdayPrice = "Giá thuê phải là số dương"
    } else if (weekdayPrice < 50000) {
      newErrors.weekdayPrice = "Giá thuê tối thiểu 50,000 VND"
    }

    const weekendPrice = Number.parseInt(pricing.weekendPrice, 10)
    if (!pricing.weekendPrice) {
      newErrors.weekendPrice = "Vui lòng nhập giá cuối tuần"
    } else if (Number.isNaN(weekendPrice) || weekendPrice <= 0) {
      newErrors.weekendPrice = "Giá thuê phải là số dương"
    } else if (weekendPrice < 50000) {
      newErrors.weekendPrice = "Giá thuê tối thiểu 50,000 VND"
    }

    const capacity = Number.parseInt(formData.capacity, 10)
    if (!formData.capacity) {
      newErrors.capacity = "Vui lòng nhập sức chứa"
    } else if (Number.isNaN(capacity) || capacity <= 0) {
      newErrors.capacity = "Sức chứa phải là số dương"
    } else if (capacity > 100) {
      newErrors.capacity = "Sức chứa tối đa 100 người"
    }

    const openDays = operatingHours.filter((item) => !item.is_closed)
    if (openDays.length === 0) {
      newErrors.operatingHours = "Sân phải mở cửa ít nhất 1 ngày trong tuần"
    } else {
      for (const item of openDays) {
        if (!item.open_time || !item.close_time) {
          newErrors.operatingHours = "Ngày mở cửa phải có giờ mở và giờ đóng cửa"
          break
        }

        if (item.open_time >= item.close_time) {
          newErrors.operatingHours = `${item.label}: giờ mở cửa phải trước giờ đóng cửa`
          break
        }
      }
    }

    if (selectedImages.length === 0) {
      newErrors.images = "Vui lòng chọn ít nhất 1 ảnh sân để admin kiểm duyệt"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const addImageFiles = (files: File[]) => {
    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - selectedImages.length

    if (remainingSlots <= 0) {
      toast({
        title: "Đã đạt giới hạn ảnh",
        description: `Mỗi sân chỉ được tối đa ${MAX_IMAGES} ảnh.`,
        variant: "destructive",
      })
      return
    }

    const acceptedFiles: SelectedImage[] = []

    for (const file of files.slice(0, remainingSlots)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Định dạng ảnh không hợp lệ",
          description: "Chỉ hỗ trợ JPG, PNG hoặc WEBP.",
          variant: "destructive",
        })
        continue
      }

      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "Ảnh quá lớn",
          description: "Mỗi ảnh không được vượt quá 5MB.",
          variant: "destructive",
        })
        continue
      }

      acceptedFiles.push({
        file,
        previewUrl: URL.createObjectURL(file),
      })
    }

    if (acceptedFiles.length > 0) {
      setSelectedImages((prev) => [...prev, ...acceptedFiles])
      clearError("images")
    }
  }

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    addImageFiles(files)
    event.target.value = ""
  }

  const handleDropImages = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const files = Array.from(event.dataTransfer.files || [])
    addImageFiles(files)
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const image = prev[index]
      if (image) URL.revokeObjectURL(image.previewUrl)

      return prev.filter((_, i) => i !== index)
    })
  }

  const toggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.some((item) => item.toLowerCase() === amenity.toLowerCase())
        ? prev.filter((item) => item.toLowerCase() !== amenity.toLowerCase())
        : [...prev, amenity],
    )
  }

  const addAmenity = () => {
    const value = newAmenity.trim()

    if (!value) return

    if (amenities.some((item) => item.toLowerCase() === value.toLowerCase())) {
      setNewAmenity("")
      return
    }

    setAmenities([...amenities, value])
    setNewAmenity("")
  }

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index))
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

    try {
      setIsSubmitting(true)

      const addressLine = formData.addressLine.trim()
      const ward = formData.ward.trim() || null
      const district = formData.district.trim()
      const province = formData.province.trim()

      const weekdayPrice = Number.parseInt(pricing.weekdayPrice, 10)
      const weekendPrice = Number.parseInt(pricing.weekendPrice, 10)

      const payload: CreateOwnerFieldPayload = {
        field_name: formData.name.trim(),
        sport_type: formData.type,
        description: formData.description.trim() || null,

        address: fullAddress,
        address_line: addressLine,
        ward,
        district,
        province,

        base_price_per_hour: weekdayPrice,
        weekday_price: weekdayPrice,
        weekend_price: weekendPrice,

        currency: "VND",
        min_duration_minutes: 60,
        max_players: Number.parseInt(formData.capacity, 10),

        approval_mode: "MANUAL",
        amenities,

        operating_hours: operatingHours.map((item) => ({
          day_of_week: item.day_of_week,
          open_time: item.is_closed ? null : item.open_time,
          close_time: item.is_closed ? null : item.close_time,
          is_closed: item.is_closed,
        })),
      }

      const createdField = await createOwnerField(payload)
      const fieldId = createdField.data.id

      await uploadOwnerFieldImages(
        fieldId,
        selectedImages.map((image) => image.file),
      )

      toast({
        title: "Gửi duyệt sân thành công!",
        description: `Sân "${formData.name}" đã được tạo và đang chờ admin duyệt.`,
      })

      router.push("/owner/fields")
      router.refresh()
    } catch (error) {
      toast({
        title: "Không thể tạo sân",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/owner/fields" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="h-5 w-5" />
            Quay lại
          </Link>

          <div className="text-center">
            <h1 className="text-xl font-bold">Thêm Sân Mới</h1>
            <p className="text-xs text-muted-foreground">Sân mới sẽ được gửi cho admin kiểm duyệt</p>
          </div>

          <Badge variant="outline" className="hidden sm:flex">
            Chờ duyệt
          </Badge>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1fr_340px]">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Thông Tin Cơ Bản</h2>
                <p className="text-sm text-muted-foreground">Nhập thông tin mô tả sân để admin kiểm duyệt.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên sân *</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Sân Cầu Lông Huy Sport 01"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    clearError("name")
                  }}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="type">Loại thể thao *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, type: value })
                      clearError("type")
                    }}
                  >
                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn loại thể thao" />
                    </SelectTrigger>
                    <SelectContent>
                      {SPORT_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="mt-1 text-sm text-red-500">{errors.type}</p>}
                </div>

                <div>
                  <Label htmlFor="capacity">Sức chứa tối đa *</Label>
                  <Input
                    id="capacity"
                    type="number"
                    placeholder="Ví dụ: 4"
                    value={formData.capacity}
                    onChange={(e) => {
                      setFormData({ ...formData, capacity: e.target.value })
                      clearError("capacity")
                    }}
                    className={errors.capacity ? "border-red-500" : ""}
                  />
                  {errors.capacity && <p className="mt-1 text-sm text-red-500">{errors.capacity}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô tả sân</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả cơ sở vật chất, mặt sân, khu vực gửi xe..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Vị Trí</h2>
                <p className="text-sm text-muted-foreground">Địa chỉ càng rõ thì khách càng dễ tìm sân.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                  <Input
                    id="province"
                    value={formData.province}
                    onChange={(e) => {
                      setFormData({ ...formData, province: e.target.value })
                      clearError("province")
                    }}
                    className={errors.province ? "border-red-500" : ""}
                  />
                  {errors.province && <p className="mt-1 text-sm text-red-500">{errors.province}</p>}
                </div>

                <div>
                  <Label htmlFor="district">Quận/Huyện *</Label>
                  <Input
                    id="district"
                    placeholder="Ví dụ: Thành phố Thủ Đức"
                    value={formData.district}
                    onChange={(e) => {
                      setFormData({ ...formData, district: e.target.value })
                      clearError("district")
                    }}
                    className={errors.district ? "border-red-500" : ""}
                  />
                  {errors.district && <p className="mt-1 text-sm text-red-500">{errors.district}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input
                  id="ward"
                  placeholder="Ví dụ: Phường An Khánh"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="addressLine">Địa chỉ chi tiết *</Label>
                <Input
                  id="addressLine"
                  placeholder="Ví dụ: Số 100 Trần Não"
                  value={formData.addressLine}
                  onChange={(e) => {
                    setFormData({ ...formData, addressLine: e.target.value })
                    clearError("addressLine")
                  }}
                  className={errors.addressLine ? "border-red-500" : ""}
                />
                {errors.addressLine && <p className="mt-1 text-sm text-red-500">{errors.addressLine}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Giá & Giờ Hoạt Động</h2>
                <p className="text-sm text-muted-foreground">
                  Cấu hình bảng giá và lịch hoạt động ngay lúc tạo sân.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="weekdayPrice">Giá ngày thường T2-T6 *</Label>
                <Input
                  id="weekdayPrice"
                  type="number"
                  placeholder="120000"
                  value={pricing.weekdayPrice}
                  onChange={(e) => {
                    setPricing({ ...pricing, weekdayPrice: e.target.value })
                    clearError("weekdayPrice")
                  }}
                  className={errors.weekdayPrice ? "border-red-500" : ""}
                />
                <p className="mt-1 text-xs text-muted-foreground">{formatMoney(pricing.weekdayPrice)} / giờ</p>
                {errors.weekdayPrice && <p className="mt-1 text-sm text-red-500">{errors.weekdayPrice}</p>}
              </div>

              <div>
                <Label htmlFor="weekendPrice">Giá cuối tuần T7-CN *</Label>
                <Input
                  id="weekendPrice"
                  type="number"
                  placeholder="150000"
                  value={pricing.weekendPrice}
                  onChange={(e) => {
                    setPricing({ ...pricing, weekendPrice: e.target.value })
                    clearError("weekendPrice")
                  }}
                  className={errors.weekendPrice ? "border-red-500" : ""}
                />
                <p className="mt-1 text-xs text-muted-foreground">{formatMoney(pricing.weekendPrice)} / giờ</p>
                {errors.weekendPrice && <p className="mt-1 text-sm text-red-500">{errors.weekendPrice}</p>}
              </div>
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-muted p-2 text-foreground">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Giờ hoạt động trong tuần</h3>
                    <p className="text-sm text-muted-foreground">
                      Bắt buộc cấu hình đủ 7 ngày. Ngày đóng cửa sẽ không nhận booking.
                    </p>
                  </div>
                </div>

                <Button type="button" variant="outline" size="sm" onClick={applySameHoursToAllOpenDays}>
                  Áp dụng giờ đầu cho ngày mở
                </Button>
              </div>

              <div className="space-y-3">
                {operatingHours.map((item) => (
                  <div
                    key={item.day_of_week}
                    className="grid gap-3 rounded-xl border border-border p-3 md:grid-cols-[110px_110px_1fr_1fr]"
                  >
                    <div className="flex items-center font-medium text-foreground">{item.label}</div>

                    <Button
                      type="button"
                      variant={item.is_closed ? "outline" : "default"}
                      onClick={() => updateOperatingHour(item.day_of_week, "is_closed", !item.is_closed)}
                    >
                      {item.is_closed ? "Đóng cửa" : "Mở cửa"}
                    </Button>

                    <div>
                      <Label className="text-xs">Giờ mở</Label>
                      <Input
                        type="time"
                        value={item.open_time}
                        disabled={item.is_closed}
                        onChange={(e) => updateOperatingHour(item.day_of_week, "open_time", e.target.value)}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Giờ đóng</Label>
                      <Input
                        type="time"
                        value={item.close_time}
                        disabled={item.is_closed}
                        onChange={(e) => updateOperatingHour(item.day_of_week, "close_time", e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {errors.operatingHours && <p className="mt-2 text-sm text-red-500">{errors.operatingHours}</p>}
            </div>
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Tiện Ích</h2>
                <p className="text-sm text-muted-foreground">Chọn nhanh hoặc tự thêm tiện ích riêng của sân.</p>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_AMENITIES.map((item) => {
                const active = amenities.some((amenity) => amenity.toLowerCase() === item.toLowerCase())

                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleAmenity(item)}
                    className={`rounded-full border px-3 py-1.5 text-sm transition ${
                      active
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background hover:bg-muted"
                    }`}
                  >
                    {item}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2">
              <Input
                placeholder="Ví dụ: Máy bán nước tự động"
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addAmenity()
                  }
                }}
              />
              <Button type="button" onClick={addAmenity}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {amenities.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {amenities.map((amenity, index) => (
                  <Badge key={`${amenity}-${index}`} variant="secondary" className="gap-2 px-3 py-1">
                    {amenity}
                    <button type="button" onClick={() => removeAmenity(index)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-5 md:p-6">
            <div className="mb-5 flex items-start gap-3">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">
                <ImagePlus className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Hình Ảnh Sân *</h2>
                <p className="text-sm text-muted-foreground">
                  Chọn tối đa {MAX_IMAGES} ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleSelectImages}
            />

            <div
              role="button"
              tabIndex={0}
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDropImages}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition ${
                isDragging ? "border-primary bg-primary/5" : errors.images ? "border-red-500" : "border-border"
              }`}
            >
              <Upload className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-1 font-medium text-foreground">Kéo thả ảnh vào đây hoặc bấm để chọn</p>
              <p className="text-sm text-muted-foreground">Hỗ trợ JPG, PNG, WEBP. Mỗi ảnh tối đa 5MB.</p>
            </div>

            {errors.images && <p className="mt-2 text-sm text-red-500">{errors.images}</p>}

            {selectedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                {selectedImages.map((image, index) => (
                  <div key={image.previewUrl} className="relative overflow-hidden rounded-xl border border-border">
                    <img
                      src={image.previewUrl || "/placeholder.svg"}
                      alt={`Ảnh sân ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Ảnh chính
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation()
                        removeImage(index)
                      }}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/owner/fields")} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi duyệt..." : "Gửi Duyệt Sân"}
            </Button>
          </div>
        </form>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="font-semibold">Tóm tắt hồ sơ sân</h2>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Tên sân</p>
                <p className="font-medium text-foreground">{formData.name || "Chưa nhập"}</p>
              </div>

              <div>
                <p className="text-muted-foreground">Loại sân</p>
                <p className="font-medium text-foreground">
                  {SPORT_OPTIONS.find((item) => item.value === formData.type)?.label || "Chưa chọn"}
                </p>
              </div>

              <div>
                <p className="text-muted-foreground">Địa chỉ</p>
                <p className="font-medium text-foreground">{fullAddress || "Chưa nhập"}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-muted-foreground">Ngày thường</p>
                  <p className="font-medium text-foreground">{formatMoney(pricing.weekdayPrice)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Cuối tuần</p>
                  <p className="font-medium text-foreground">{formatMoney(pricing.weekendPrice)}</p>
                </div>
              </div>

              <div>
                <p className="text-muted-foreground">Ngày mở cửa</p>
                <p className="font-medium text-foreground">{openDaysCount}/7 ngày</p>
              </div>

              <div>
                <p className="text-muted-foreground">Ảnh đã chọn</p>
                <p className="font-medium text-foreground">
                  {selectedImages.length}/{MAX_IMAGES} ảnh
                </p>
              </div>
            </div>
          </Card>

          <Card className="border-primary/20 bg-primary/5 p-5">
            <div className="mb-3 flex items-center gap-2 text-primary">
              <CalendarClock className="h-5 w-5" />
              <h3 className="font-semibold">Lưu ý lịch hoạt động</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Lịch hoạt động sẽ được lưu cùng lúc khi tạo sân. Ngày đóng cửa sẽ không cho khách xem slot hoặc đặt sân.
            </p>
          </Card>

          <Card className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold">Sau khi gửi</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Sân được tạo với trạng thái chờ duyệt.</li>
              <li>• Admin kiểm tra thông tin và hình ảnh sân.</li>
              <li>• Sân chỉ hiển thị public sau khi được duyệt.</li>
            </ul>
          </Card>
        </aside>
      </div>
    </main>
  )
}