"use client"

import { useState } from "react"
import { useRouter } from 'next/navigation'
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search, Phone, Mail, MapPinIcon, Clock, CheckCircle } from 'lucide-react'
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
  const router = useRouter()
  const [sportType, setSportType] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [time, setTime] = useState("")

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (sportType) params.append("sport", sportType)
    if (location) params.append("location", location)
    if (date) params.append("date", date)
    if (time) params.append("time", time)

    router.push(`/browse?${params.toString()}`)
  }

  return (
    <main className="min-h-screen bg-background">
      <TopNav />

      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-900 dark:from-green-950 dark:via-green-900 dark:to-emerald-950">
        <div className="absolute inset-0 bg-[url('/sports-field-background.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/60" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Đặt Sân Thể Thao Dễ Dàng
          </h1>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Hệ thống quản lý sân thể thao HCMUT - Nhanh chóng, tiện lợi, đáng tin cậy
          </p>

          <Card className="p-6 md:p-8 bg-white dark:bg-slate-900 shadow-2xl max-w-3xl mx-auto border-0 dark:border dark:border-slate-700">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-left text-slate-700 dark:text-slate-200">
                  Loại sân
                </label>
                <Select value={sportType} onValueChange={setSportType}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:[&>span]:text-slate-300">
                    <SelectValue placeholder="Chọn loại sân" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="soccer">Bóng đá</SelectItem>
                    <SelectItem value="badminton">Cầu lông</SelectItem>
                    <SelectItem value="basketball">Bóng rổ</SelectItem>
                    <SelectItem value="tennis">Quần vợt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-left text-slate-700 dark:text-slate-200">
                  Địa điểm
                </label>
                <Select value={location} onValueChange={setLocation}>
                  <SelectTrigger className="dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:[&>span]:text-slate-300">
                    <SelectValue placeholder="Chọn quận" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="q1">Quận 1</SelectItem>
                    <SelectItem value="q3">Quận 3</SelectItem>
                    <SelectItem value="q7">Quận 7</SelectItem>
                    <SelectItem value="q10">Quận 10</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-left text-slate-700 dark:text-slate-200">
                  Ngày chơi
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400 dark:[&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-left text-slate-700 dark:text-slate-200">Giờ</label>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400 dark:[&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            <Button
              className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 h-12 text-base font-semibold text-white"
              onClick={handleSearch}
            >
              <Search className="w-5 h-5 mr-2" />
              Tìm sân ngay
            </Button>
          </Card>
        </div>
      </section>

      <section className="py-16 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600 dark:text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Đặt Sân 24/7</h3>
              <p className="text-muted-foreground">Hệ thống hoạt động liên tục, đặt sân bất cứ lúc nào</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Xác Nhận Nhanh</h3>
              <p className="text-muted-foreground">Nhận xác nhận đặt sân ngay lập tức qua email</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600 dark:text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chất Lượng Cao</h3>
              <p className="text-muted-foreground">Các sân được kiểm duyệt và đánh giá nghiêm ngặt</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Sân Nổi Bật</h2>
            <p className="text-lg text-muted-foreground">Các sân thể thao được yêu thích nhất</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mockFields.map((field) => (
              <Link key={field.id} href={`/field/${field.id}`}>
                <Card className="group overflow-hidden hover:shadow-lg dark:hover:shadow-primary/10 transition-shadow h-full border dark:border-border">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={field.image || "/placeholder.svg"}
                      alt={field.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {field.available && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold">
                        Còn trống
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{field.name}</h3>

                    <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4" />
                      <span>{field.location}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-green-600 dark:text-primary">
                        {(field.price / 1000).toFixed(0)}K VNĐ
                      </span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-semibold">{field.rating}</span>
                        <span className="text-xs text-muted-foreground">({field.reviews})</span>
                      </div>
                    </div>

                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 dark:bg-primary dark:hover:bg-primary/90 text-white">
                      Đặt ngay
                    </Button>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link href="/browse">
              <Button size="lg" variant="outline" className="font-semibold bg-transparent">
                Xem tất cả sân
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-green-700 to-green-600 dark:from-green-800 dark:to-emerald-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-yellow-400 dark:bg-yellow-500 text-green-900 dark:text-green-950 px-4 py-2 rounded-full font-bold text-sm mb-6">
            Ưu đãi đặc biệt
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Giảm 20% cho lần đặt đầu tiên</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Đăng ký tài khoản mới và nhận ngay ưu đãi hấp dẫn cho lần đặt sân đầu tiên
          </p>
          <Link href="/browse">
            <Button
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-100 dark:bg-white dark:text-green-800 dark:hover:bg-gray-200 font-bold h-12 px-8"
            >
              Khám phá ngay
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-12 border-t dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image src="/hcmut-logo.png" alt="HCMUT" width={40} height={40} className="rounded" />
                <span className="font-bold text-lg">HCMUT SFMS</span>
              </div>
              <p className="text-gray-400 text-sm">Hệ thống quản lý sân thể thao Đại học Bách Khoa TP.HCM</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên kết</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-green-400 transition-colors">
                    Trang chủ
                  </Link>
                </li>
                <li>
                  <Link href="/browse" className="hover:text-green-400 transition-colors">
                    Duyệt sân
                  </Link>
                </li>
                <li>
                  <Link href="/bookings" className="hover:text-green-400 transition-colors">
                    Đặt sân
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Chính sách</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>
                  <Link href="/help" className="hover:text-green-400 transition-colors">
                    Trợ giúp
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-green-400 transition-colors">
                    Điều khoản
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-green-400 transition-colors">
                    Bảo mật
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  (028) 3869 4242
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  support@hcmut.edu.vn
                </li>
                <li className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4" />
                  268 Lý Thường Kiệt, Q.10
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
            <p>© 2025 HCMUT Sport Field Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
