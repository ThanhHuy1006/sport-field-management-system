"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Upload, X } from "lucide-react"
import Link from "next/link"

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

  const [amenities, setAmenities] = useState<string[]>(existingData.amenities ?? [])
  const [newAmenity, setNewAmenity] = useState("")

  const [operatingHours, setOperatingHours] = useState({
    openTime: existingData.openTime,
    closeTime: existingData.closeTime,
  })

  const [loading, setLoading] = useState(false)

  // 🟢 HANDLE SUBMIT — FIXED & UPDATED
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem("token")

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/owner/fields/${fieldId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // MAP field gửi lên backend
          field_name: formData.name,
          sport_type: formData.type,
          address: formData.address,
          max_players: Number(formData.capacity),
          base_price_per_hour: Number(formData.price),
          description: formData.description,
          status: formData.status,
          amenities: amenities,
          openTime: operatingHours.openTime,
          closeTime: operatingHours.closeTime,
        }),
      })

      if (!res.ok) {
        console.log("UPDATE FIELD FAILED:", await res.text())
        alert("Cập nhật sân thất bại!")
        setLoading(false)
        return
      }

      alert("Cập nhật thành công!")
      router.push("/owner/fields")
    } catch (err) {
      console.error("NETWORK ERROR:", err)
      alert("Không thể kết nối server.")
    }

    setLoading(false)
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
          {/* === Thông Tin Cơ Bản === */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Sân *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Loại Thể Thao *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>Trạng Thái *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
                <Label>Mô Tả</Label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* === Vị trí === */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Vị Trí</h2>
            <div className="space-y-4">
              <div>
                <Label>Khu Vực *</Label>
                <Input
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div>
                <Label>Địa Chỉ Chi Tiết *</Label>
                <Input
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* === Giá & Sức chứa === */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Giá & Sức Chứa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Giá Thuê (VND/h)</Label>
                <Input
                  type="number"
                  required
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div>
                <Label>Sức Chứa (người)</Label>
                <Input
                  type="number"
                  required
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* === Giờ hoạt động === */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Giờ Hoạt Động</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Giờ Mở</Label>
                <Input
                  type="time"
                  value={operatingHours.openTime}
                  onChange={(e) => setOperatingHours({ ...operatingHours, openTime: e.target.value })}
                />
              </div>

              <div>
                <Label>Giờ Đóng</Label>
                <Input
                  type="time"
                  value={operatingHours.closeTime}
                  onChange={(e) => setOperatingHours({ ...operatingHours, closeTime: e.target.value })}
                />
              </div>
            </div>
          </Card>

          {/* === Tiện Ích === */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tiện Ích</h2>

            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Thêm tiện ích..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addAmenity())}
              />
              <Button type="button" onClick={addAmenity}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {amenities.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {amenities.map((item, i) => (
                  <div key={i} className="flex items-center bg-muted px-3 py-1 rounded-full gap-2">
                    <span>{item}</span>
                    <button type="button" onClick={() => removeAmenity(i)}>
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* === Hình ảnh === */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hình Ảnh</h2>
            <div className="border-2 border-dashed p-8 text-center rounded-lg">
              <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground mt-2 mb-3">Chức năng upload hình sẽ làm sau</p>
              <Button type="button" variant="outline">
                Chọn Hình Ảnh
              </Button>
            </div>
          </Card>

          {/* === ACTIONS === */}
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.push("/owner/fields")}>
              Hủy
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Đang xử lý..." : "Lưu Thay Đổi"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  )
}
