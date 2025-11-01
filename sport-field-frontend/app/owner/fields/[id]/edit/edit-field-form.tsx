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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Upload, Plus, X } from "lucide-react"

interface FieldData {
  name: string
  type: string
  location: string
  address: string
  capacity: string
  price: string
  description: string
  status: string
  amenities: string[]
  openTime: string
  closeTime: string
}

export default function EditFieldForm({ fieldId, existingData }: { fieldId: string; existingData: FieldData }) {
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: existingData.name,
    type: existingData.type,
    location: existingData.location,
    address: existingData.address,
    capacity: existingData.capacity,
    price: existingData.price,
    description: existingData.description,
    status: existingData.status,
  })
  const [amenities, setAmenities] = useState<string[]>(existingData.amenities)
  const [newAmenity, setNewAmenity] = useState("")
  const [operatingHours, setOperatingHours] = useState({
    openTime: existingData.openTime,
    closeTime: existingData.closeTime,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] Updated field data:", { fieldId, formData, amenities, operatingHours })
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
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Loại Thể Thao *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại thể thao" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soccer">Bóng Đá</SelectItem>
                      <SelectItem value="basketball">Bóng Rổ</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="badminton">Cầu Lông</SelectItem>
                      <SelectItem value="volleyball">Bóng Chuyền</SelectItem>
                    </SelectContent>
                  </Select>
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
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Địa Chỉ Chi Tiết *</Label>
                <Input
                  id="address"
                  placeholder="Số nhà, tên đường..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Giá & Sức chứa */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Giá & Sức Chứa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Giá Thuê (VND/giờ) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="500000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="capacity">Sức Chứa (người) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="22"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Giờ hoạt động */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Giờ Hoạt Động</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Giờ Mở Cửa</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={operatingHours.openTime}
                  onChange={(e) =>
                    setOperatingHours({
                      ...operatingHours,
                      openTime: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <Label htmlFor="closeTime">Giờ Đóng Cửa</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={operatingHours.closeTime}
                  onChange={(e) =>
                    setOperatingHours({
                      ...operatingHours,
                      closeTime: e.target.value,
                    })
                  }
                />
              </div>
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
            <Button type="button" variant="outline" onClick={() => router.push("/owner/fields")}>
              Hủy
            </Button>
            <Button type="submit">Lưu Thay Đổi</Button>
          </div>
        </form>
      </div>
    </main>
  )
}
