"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Calendar, Clock, Search, Phone, Mail, MapPinIcon } from "lucide-react"
import { TopNav } from "@/components/top-nav"

const mockFields = [
  {
    id: 1,
    name: "Sân Bóng Đá Green Valley",
    type: "Bóng đá",
    location: "Quận 1, TP.HCM",
    price: 500000,
    rating: 4.8,
    reviews: 124,
    image: "/soccer-field.png",
    available: true,
  },
  {
    id: 2,
    name: "Sân Cầu Lông Pro",
    type: "Cầu lông",
    location: "Quận 3, TP.HCM",
    price: 200000,
    rating: 4.6,
    reviews: 89,
    image: "/badminton-court.png",
    available: true,
  },
  {
    id: 3,
    name: "Sân Bóng Rổ Arena",
    type: "Bóng rổ",
    location: "Quận 7, TP.HCM",
    price: 400000,
    rating: 4.9,
    reviews: 156,
    image: "/outdoor-basketball-court.png",
    available: true,
  },
  {
    id: 4,
    name: "Sân Quần Vợt Elite",
    type: "Quần vợt",
    location: "Quận 2, TP.HCM",
    price: 350000,
    rating: 4.7,
    reviews: 102,
    image: "/outdoor-tennis-court.png",
    available: true,
  },
]

const reviews = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    rating: 5,
    comment: "Sân rất đẹp, sạch sẽ và tiện nghi đầy đủ. Nhân viên thân thiện!",
    date: "2 ngày trước",
  },
  {
    id: 2,
    name: "Trần Thị B",
    rating: 4,
    comment: "Giá cả hợp lý, vị trí thuận tiện. Sẽ quay lại lần sau.",
    date: "1 tuần trước",
  },
  {
    id: 3,
    name: "Lê Minh C",
    rating: 5,
    comment: "Hệ thống đặt sân online rất tiện lợi. Recommend!",
    date: "2 tuần trước",
  },
]

export default function Home() {
  const [sportType, setSportType] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <TopNav />

      {/* Hero Section with Search */}
      <section className="relative bg-gradient-to-br from-green-700 to-green-900 dark:from-green-900 dark:to-green-950 text-white py-20 md:py-32">
        <div className="absolute inset-0 bg-[url('/sports-field-background.jpg')] bg-cover bg-center opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-balance">Đặt sân thể thao mọi lúc, mọi nơi</h1>
            <p className="text-xl md:text-2xl opacity-90">Hệ thống quản lý sân thể thao Đại Học Bách Khoa TP.HCM</p>
          </div>

          {/* Search Form */}
          <Card className="max-w-5xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Loại sân</label>
                <Select value={sportType} onValueChange={setSportType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn loại sân" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soccer">Bóng đá</SelectItem>
                    <SelectItem value="badminton">Cầu lông</SelectItem>
                    <SelectItem value="basketball">Bóng rổ</SelectItem>
                    <SelectItem value="tennis">Quần vợt</SelectItem>
                    <SelectItem value="volleyball">Bóng chuyền</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Địa điểm</label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quận" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1">Quận 1</SelectItem>
                    <SelectItem value="q2">Quận 2</SelectItem>
                    <SelectItem value="q3">Quận 3</SelectItem>
                    <SelectItem value="q7">Quận 7</SelectItem>
                    <SelectItem value="q10">Quận 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ngày chơi</label>
                <div className="relative">
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10" />
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Giờ</label>
                <div className="relative">
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="pl-10" />
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="flex items-end">
                <Button className="w-full h-10 bg-green-600 hover:bg-green-700 text-white">
                  <Search className="w-4 h-4 mr-2" />
                  Tìm sân
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Featured Fields Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-foreground mb-2">Sân nổi bật</h2>
            <p className="text-muted-foreground">Các sân thể thao được đánh giá cao nhất</p>
          </div>
          <Link href="/browse">
            <Button variant="outline">Xem tất cả</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockFields.map((field) => (
            <Link key={field.id} href={`/field/${field.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full">
                <div className="relative h-48">
                  <img
                    src={field.image || "/placeholder.svg"}
                    alt={field.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium shadow-md">
                      Còn trống
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-foreground mb-2 line-clamp-1">{field.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {field.location}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-bold text-green-600">{(field.price / 1000).toFixed(0)}K VND</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-semibold">{field.rating}</span>
                      <span className="text-xs text-muted-foreground">({field.reviews})</span>
                    </div>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" size="sm">
                    Đặt ngay
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Promotions Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-900 dark:from-green-800 dark:to-green-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">🎁 Ưu đãi hôm nay – Giảm 20%</h2>
          <p className="text-xl mb-6 opacity-90">Đặt sân ngay hôm nay để nhận ưu đãi đặc biệt!</p>
          <Link href="/browse">
            <Button size="lg" className="bg-white text-green-700 hover:bg-gray-100 font-semibold">
              Khám phá ngay
            </Button>
          </Link>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">💬 Đánh giá từ người chơi</h2>
          <p className="text-muted-foreground">Những trải nghiệm thực tế từ cộng đồng</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <Card key={review.id} className="p-6">
              <div className="flex items-center gap-1 mb-3">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-foreground mb-4 italic">"{review.comment}"</p>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-foreground">{review.name}</span>
                <span className="text-sm text-muted-foreground">{review.date}</span>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/hcmut-logo.png" alt="HCMUT Logo" width={40} height={40} className="rounded" />
                <span className="font-bold text-foreground">HCMUT SFMS</span>
              </div>
              <p className="text-sm text-muted-foreground">Hệ thống quản lý sân thể thao Đại học Bách Khoa TP.HCM</p>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="hover:text-foreground transition-colors">
                    Sân bóng
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="hover:text-foreground transition-colors">
                    Đặt sân
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">Chính sách</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors">
                    Điều khoản sử dụng
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="/refund" className="hover:text-foreground transition-colors">
                    Chính sách hoàn tiền
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-foreground mb-4">📞 Liên hệ - Hỗ trợ</h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>0964167367</span>
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>huy.dangthanh@hcmut.edu.vn</span>
                </li>
                <li className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  <span>268 Lý Thường Kiệt, Q.10</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>© 2025 Hệ Thống Quản Lý Sân Thể Thao ĐHBK TPHCM. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
