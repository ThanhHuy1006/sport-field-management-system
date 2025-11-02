"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, X, Upload } from "lucide-react"
import { updateField } from "@/lib/fetchers"

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

export default function EditFieldForm({
  fieldId,
  existingData,
}: {
  fieldId: string
  existingData: FieldData
}) {
  const router = useRouter()

  const [formData, setFormData] = useState(existingData)
  const [amenities, setAmenities] = useState<string[]>(existingData.amenities)
  const [newAmenity, setNewAmenity] = useState("")
  const [operatingHours, setOperatingHours] = useState({
    openTime: existingData.openTime,
    closeTime: existingData.closeTime,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        name: formData.name,
        type: formData.type,
        location: formData.location,
        address: formData.address,
        capacity: formData.capacity,
        price: formData.price,
        description: formData.description,
        status: formData.status,
      }

      const res = await updateField(fieldId, payload)
      console.log("✅ API trả về:", res)
      alert("Cập nhật thành công!")
      router.push("/owner/fields")
    } catch (err) {
      console.error("❌ Lỗi cập nhật sân:", err)
      alert("Lỗi khi cập nhật sân. Vui lòng thử lại.")
    }
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

  // ======================= GIAO DIỆN =======================
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

      {/* Form chính */}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Loại Thể Thao *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
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
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
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
                  rows={3}
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
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="address">Địa Chỉ *</Label>
                <Input
                  id="address"
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
                <Label htmlFor="price">Giá Thuê (VND/giờ)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="capacity">Sức Chứa (người)</Label>
                <Input
                  id="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  required
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
                  placeholder="Thêm tiện ích mới..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                />
                <Button type="button" onClick={addAmenity}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(i)}
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

          {/* Nút hành động */}
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
