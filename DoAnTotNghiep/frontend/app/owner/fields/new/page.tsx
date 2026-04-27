"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, X, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  createOwnerField,
  updateOwnerOperatingHour,
  uploadOwnerFieldImages,
  type CreateOwnerFieldPayload,
} from "@/features/fields/services/owner-fields.service"

type SelectedImage = {
  file: File
  previewUrl: string
}

const MAX_IMAGES = 5
const MAX_IMAGE_SIZE = 5 * 1024 * 1024

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

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
    status: "pending",
  })

  const [pricing, setPricing] = useState({
    weekdayPrice: "",
    weekendPrice: "",
  })

  const [amenities, setAmenities] = useState<string[]>([])
  const [newAmenity, setNewAmenity] = useState("")

  const [operatingHours, setOperatingHours] = useState({
    openTime: "06:00",
    closeTime: "22:00",
  })

  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    selectedImagesRef.current = selectedImages
  }, [selectedImages])

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((image) => URL.revokeObjectURL(image.previewUrl))
    }
  }, [])

  const clearError = (key: string) => {
    if (!errors[key]) return

    setErrors((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
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

    if (operatingHours.openTime >= operatingHours.closeTime) {
      newErrors.operatingHours = "Giờ mở cửa phải trước giờ đóng cửa"
    }

    if (selectedImages.length === 0) {
      newErrors.images = "Vui lòng chọn ít nhất 1 ảnh sân để admin kiểm duyệt"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectImages = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])

    if (files.length === 0) return

    const remainingSlots = MAX_IMAGES - selectedImages.length

    if (remainingSlots <= 0) {
      toast({
        title: "Đã đạt giới hạn ảnh",
        description: `Chỉ được chọn tối đa ${MAX_IMAGES} ảnh.`,
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

    event.target.value = ""
  }

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const image = prev[index]
      if (image) URL.revokeObjectURL(image.previewUrl)

      return prev.filter((_, i) => i !== index)
    })
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

  const createOperatingHoursForAllDays = async (fieldId: number) => {
    await Promise.all(
      Array.from({ length: 7 }, (_, day) =>
        updateOwnerOperatingHour(fieldId, {
          day_of_week: day,
          open_time: operatingHours.openTime,
          close_time: operatingHours.closeTime,
          is_closed: false,
        }),
      ),
    )
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

      const fullAddress = [addressLine, ward, district, province].filter(Boolean).join(", ")

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

        amenities,
      }

      const createdField = await createOwnerField(payload)
      const fieldId = createdField.data.id

      await createOperatingHoursForAllDays(fieldId)

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
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/fields" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Thêm Sân Mới</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
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
                    clearError("name")
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
                      clearError("type")
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
                  <Label htmlFor="status">Trạng Thái</Label>
                  <Input id="status" value="Chờ duyệt" disabled />
                  <p className="text-xs text-muted-foreground mt-1">
                    Sân mới sẽ chờ admin kiểm duyệt trước khi hiển thị cho khách hàng.
                  </p>
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
                    clearError("capacity")
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

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Vị Trí</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="province">Tỉnh/Thành phố *</Label>
                  <Input
                    id="province"
                    placeholder="Ví dụ: TP. Hồ Chí Minh"
                    value={formData.province}
                    onChange={(e) => {
                      setFormData({ ...formData, province: e.target.value })
                      clearError("province")
                    }}
                    className={errors.province ? "border-red-500" : ""}
                    required
                  />
                  {errors.province && <p className="text-sm text-red-500 mt-1">{errors.province}</p>}
                </div>

                <div>
                  <Label htmlFor="district">Quận/Huyện *</Label>
                  <Input
                    id="district"
                    placeholder="Ví dụ: Quận 7"
                    value={formData.district}
                    onChange={(e) => {
                      setFormData({ ...formData, district: e.target.value })
                      clearError("district")
                    }}
                    className={errors.district ? "border-red-500" : ""}
                    required
                  />
                  {errors.district && <p className="text-sm text-red-500 mt-1">{errors.district}</p>}
                </div>
              </div>

              <div>
                <Label htmlFor="ward">Phường/Xã</Label>
                <Input
                  id="ward"
                  placeholder="Ví dụ: Phường Tân Quy"
                  value={formData.ward}
                  onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="addressLine">Địa Chỉ Chi Tiết *</Label>
                <Input
                  id="addressLine"
                  placeholder="Số nhà, tên đường..."
                  value={formData.addressLine}
                  onChange={(e) => {
                    setFormData({ ...formData, addressLine: e.target.value })
                    clearError("addressLine")
                  }}
                  className={errors.addressLine ? "border-red-500" : ""}
                  required
                />
                {errors.addressLine && <p className="text-sm text-red-500 mt-1">{errors.addressLine}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Giá & Giờ Hoạt Động</h2>
            </div>

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
                        clearError("weekdayPrice")
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
                        clearError("weekendPrice")
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
                      clearError("operatingHours")
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
                      clearError("operatingHours")
                    }}
                    className={errors.operatingHours ? "border-red-500" : ""}
                  />
                </div>
              </div>

              {errors.operatingHours && <p className="text-sm text-red-500 mt-2">{errors.operatingHours}</p>}
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tiện Ích</h2>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ví dụ: Bãi đỗ xe, Phòng thay đồ..."
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

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hình Ảnh *</h2>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleSelectImages}
            />

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${
                errors.images ? "border-red-500" : "border-border"
              }`}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Chọn tối đa {MAX_IMAGES} ảnh sân. Ảnh đầu tiên sẽ là ảnh đại diện.
              </p>
              <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                Chọn Hình Ảnh
              </Button>
            </div>

            {errors.images && <p className="text-sm text-red-500 mt-2">{errors.images}</p>}

            {selectedImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                {selectedImages.map((image, index) => (
                  <div key={image.previewUrl} className="relative overflow-hidden rounded-lg border border-border">
                    <img
                      src={image.previewUrl || "/placeholder.svg"}
                      alt={`Ảnh sân ${index + 1}`}
                      className="h-28 w-full object-cover"
                    />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                        Ảnh chính
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => router.push("/owner/fields")} disabled={isSubmitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang gửi duyệt..." : "Gửi Duyệt Sân"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}