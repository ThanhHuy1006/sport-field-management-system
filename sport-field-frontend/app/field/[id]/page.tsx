"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Clock, Phone, Mail, ArrowLeft, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react"
import { getFieldById, type FieldDetail } from "@/lib/fetchers"

export default function FieldDetailsPage() {
  const { id } = useParams()
  const [field, setField] = useState<FieldDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // ✅ Gọi API thật khi vào trang
  useEffect(() => {
    if (!id) return
    getFieldById(id as string)
      .then(setField)
      .catch((err) => console.error("Fetch field error:", err))
      .finally(() => setLoading(false))
  }, [id])

  const nextImage = () => {
    if (!field?.images?.length) return
    setCurrentImageIndex((prev) => (prev + 1) % field.images.length)
  }

  const prevImage = () => {
    if (!field?.images?.length) return
    setCurrentImageIndex((prev) => (prev - 1 + field.images.length) % field.images.length)
  }

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải thông tin sân...</p>
      </main>
    )

  if (!field)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy sân</p>
      </main>
    )

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition">
              <Share2 className="w-5 h-5" />
            </button>
            <button onClick={() => setIsWishlisted(!isWishlisted)} className="p-2 hover:bg-muted rounded-lg transition">
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative bg-muted rounded-lg overflow-hidden mb-8">
              <img
                src={field.images?.[currentImageIndex] || "/placeholder.svg"}
                alt={field.name}
                className="w-full h-96 object-cover"
              />
              {field.images?.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Field Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{field.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {field.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {field.rating ? `${field.rating.toFixed(1)} (${field.reviewCount})` : "Chưa có đánh giá"}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{field.price.toLocaleString()} VND</div>
                  <div className="text-sm text-muted-foreground">mỗi giờ</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Về sân này</h2>
              <p className="text-muted-foreground mb-6">{field.description || "Chưa có mô tả"}</p>

              <h3 className="text-lg font-bold mb-3">Tiện nghi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {field.amenities.length > 0 ? (
                  field.amenities.map((a, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {a}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa cập nhật</p>
                )}
              </div>
            </Card>

            {/* Hours */}
            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Giờ hoạt động</h3>
              </div>
              <p className="text-foreground">{field.hours || "Chưa cập nhật"}</p>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Đánh giá khách hàng</h3>
              {field.reviews.length ? (
                <div className="space-y-6">
                  {field.reviews.map((r) => (
                    <div key={r.id} className="pb-6 border-b border-border last:border-b-0">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{r.author}</span>
                        <span className="text-yellow-500">⭐ {r.rating}</span>
                      </div>
                      <p className="text-muted-foreground">{r.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Chưa có đánh giá nào.</p>
              )}
            </Card>
          </div>

          {/* Sidebar Booking */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24 space-y-4">
              <h3 className="text-xl font-bold mb-4">Đặt sân này</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Chọn ngày</label>
                <input type="date" className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Chọn giờ</label>
                <select className="w-full px-3 py-2 border rounded-md bg-background">
                  <option>08:00</option>
                  <option>09:00</option>
                  <option>10:00</option>
                  <option>14:00</option>
                </select>
              </div>
              <Button className="w-full text-lg">Đặt sân ngay</Button>

              {/* Chủ sân */}
              {field.owner && (
                <div className="border-t pt-4 mt-4 text-sm">
                  <p className="font-semibold">{field.owner.name}</p>
                  <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                    <Mail className="h-4 w-4" /> {field.owner.email}
                  </div>
                  {field.owner.phone && (
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <Phone className="h-4 w-4" /> {field.owner.phone}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
