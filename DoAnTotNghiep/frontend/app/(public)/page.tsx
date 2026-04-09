"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Star, Search, Clock, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react"
import { MOCK_FIELDS } from "@/lib/data"
import { DISTRICTS, SPORT_TYPES } from "@/lib/constants"

function SportIcon({ sport, className }: { sport: string; className?: string }) {
  if (sport === "Bóng đá") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polygon points="12,7 15.5,10 14.2,14.5 9.8,14.5 8.5,10" fill="currentColor" stroke="none" />
        <line x1="12" y1="2" x2="12" y2="7" />
        <line x1="20.5" y1="7" x2="15.5" y2="10" />
        <line x1="17.5" y1="19.5" x2="14.2" y2="14.5" />
        <line x1="6.5" y1="19.5" x2="9.8" y2="14.5" />
        <line x1="3.5" y1="7" x2="8.5" y2="10" />
      </svg>
    )
  }
  if (sport === "Bóng rổ") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2v20" />
        <path d="M2 12h20" />
        <path d="M4.9 4.9c3.9 3.9 10.3 3.9 14.2 0" />
        <path d="M4.9 19.1c3.9-3.9 10.3-3.9 14.2 0" />
      </svg>
    )
  }
  if (sport === "Cầu lông") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="3" y1="21" x2="12" y2="12" />
        <path d="M12 12 C12 12, 17 7, 20 4" strokeLinecap="round" />
        <circle cx="19" cy="5" r="4" />
        <line x1="16" y1="5" x2="22" y2="5" />
        <line x1="19" y1="2" x2="19" y2="8" />
      </svg>
    )
  }
  if (sport === "Tennis") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 C8 6, 8 18, 12 22" />
        <path d="M12 2 C16 6, 16 18, 12 22" />
      </svg>
    )
  }
  if (sport === "Bóng chuyền") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2 C7 7, 7 17, 12 22" />
        <path d="M2 10 C6 9, 14 15, 22 10" />
        <path d="M3.5 16 C8 13, 16 15, 21 12" />
      </svg>
    )
  }
  // Default globe icon (no sport selected)
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20" />
    </svg>
  )
}

export default function Home() {
  const router = useRouter()
  const [sportType, setSportType] = useState("")
  const [location, setLocation] = useState("")
  const [currentSlide, setCurrentSlide] = useState(0)

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (sportType) params.append("sport", sportType)
    if (location) params.append("location", location)
    router.push(`/browse?${params.toString()}`)
  }

  const featuredFields = MOCK_FIELDS.slice(0, 8)
  const fieldsPerSlide = 4
  const totalSlides = Math.ceil(featuredFields.length / fieldsPerSlide)

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  // Get current visible fields
  const visibleFields = featuredFields.slice(currentSlide * fieldsPerSlide, (currentSlide + 1) * fieldsPerSlide)

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-900 dark:from-green-950 dark:to-emerald-950">
        <div className="absolute inset-0 bg-[url('/sports-field-background.jpg')] bg-cover bg-center opacity-40 dark:opacity-20" />
        <div className="absolute inset-0 bg-black/50 dark:bg-black/70" />

        <div className="relative max-w-4xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Đặt Sân Thể Thao Dễ Dàng
          </h1>
          <p className="text-xl text-white/90 dark:text-white/80 mb-10 max-w-2xl mx-auto">
            Hệ thống quản lý sân thể thao HCMUT - Nhanh chóng, tiện lợi, đáng tin cậy
          </p>

          {/* Search Card - Uber Style */}
          <div className="max-w-md mx-auto">
            <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
              {/* Sport Type Field */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 transition-all">
                    <SportIcon sport={sportType} className="w-5 h-5 text-foreground" />
                  </div>
                  <Select value={sportType} onValueChange={setSportType}>
                    <SelectTrigger className="flex-1 h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0">
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">Loại sân</div>
                        <SelectValue placeholder="Chọn môn thể thao" className="text-foreground font-medium" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {SPORT_TYPES.filter((s) => s !== "Tất cả").map((sport) => (
                        <SelectItem key={sport} value={sport}>
                          {sport}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Field */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-foreground" />
                  </div>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger className="flex-1 h-auto border-0 bg-transparent p-0 shadow-none focus:ring-0">
                      <div className="text-left">
                        <div className="text-xs text-muted-foreground">Khu vực</div>
                        <SelectValue placeholder="Chọn quận/huyện" className="text-foreground font-medium" />
                      </div>
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border">
                      {DISTRICTS.filter((d) => d !== "Tất cả").map((district) => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Search Button */}
              <div className="p-4">
                <Button
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-xl"
                  onClick={handleSearch}
                >
                  <Search className="w-5 h-5 mr-2" />
                  Tìm sân
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 bg-muted/30 dark:bg-muted/10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-transparent dark:border-green-800/30">
                <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Đặt Sân 24/7</h3>
              <p className="text-muted-foreground">Hệ thống hoạt động liên tục, đặt sân bất cứ lúc nào</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-transparent dark:border-green-800/30">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Xác Nhận Nhanh</h3>
              <p className="text-muted-foreground">Nhận xác nhận đặt sân ngay lập tức qua email</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border border-transparent dark:border-green-800/30">
                <Star className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-foreground">Chất Lượng Cao</h3>
              <p className="text-muted-foreground">Các sân được kiểm duyệt và đánh giá nghiêm ngặt</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Fields Section */}
      <section className="py-12 pb-20 bg-background">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Sân Nổi Bật</h2>
            <p className="text-lg text-muted-foreground">Các sân thể thao được yêu thích nhất</p>
          </div>

          <div className="relative">
            {/* Prev Button */}
            {totalSlides > 1 && (
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-background border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Previous slide"
              >
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
            )}

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {visibleFields.map((field) => (
                <Link key={field.id} href={`/field/${field.id}`}>
                  <Card className="group overflow-hidden hover:shadow-lg transition-all h-full border bg-card">
                    <div className="relative h-48 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <img
                        src={field.image || "/placeholder.svg"}
                        alt={field.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {field.available && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded font-semibold shadow-lg">
                          Còn trống
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-2 line-clamp-1 text-foreground">{field.name}</h3>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{field.district}, TP.HCM</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-primary">{(field.price / 1000).toFixed(0)}K</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold text-foreground">{field.rating}</span>
                          <span className="text-xs text-muted-foreground">({field.reviews})</span>
                        </div>
                      </div>

                      <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                        Đặt ngay
                      </Button>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Next Button */}
            {totalSlides > 1 && (
              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-background border border-border rounded-full shadow-lg flex items-center justify-center hover:bg-muted transition-colors"
                aria-label="Next slide"
              >
                <ChevronRight className="w-5 h-5 text-foreground" />
              </button>
            )}
          </div>

          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-colors ${
                    index === currentSlide ? "bg-primary" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/browse">
              <Button size="lg" variant="outline" className="font-semibold bg-transparent">
                Xem tất cả sân
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-700 to-green-600 dark:from-green-900 dark:to-emerald-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="inline-block bg-yellow-400 dark:bg-yellow-500 text-green-900 dark:text-green-950 px-4 py-2 rounded-full font-bold text-sm mb-6 shadow-lg">
            Ưu đãi đặc biệt
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Giảm 20% cho lần đặt đầu tiên</h2>
          <p className="text-xl text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
            Đăng ký tài khoản mới và nhận ngay ưu đãi hấp dẫn cho lần đặt sân đầu tiên
          </p>
          <Link href="/browse">
            <Button
              size="lg"
              className="bg-white text-green-700 hover:bg-gray-100 dark:bg-white dark:text-green-800 dark:hover:bg-gray-200 font-bold h-12 px-8 shadow-xl"
            >
              Khám phá ngay
            </Button>
          </Link>
        </div>
      </section>
    </>
  )
}
