"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const sportImages = [
    {
      id: 1,
      sport: "Bóng đá",
      image: "/professional-soccer-field-with-players.jpg",
    },
    {
      id: 2,
      sport: "Cầu lông",
      image: "/badminton-court-indoor.jpg",
    },
    {
      id: 3,
      sport: "Bóng rổ",
      image: "/outdoor-basketball-game.png",
    },
    {
      id: 4,
      sport: "Quần vợt",
      image: "/outdoor-tennis-court.png",
    },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % sportImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [sportImages.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % sportImages.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + sportImages.length) % sportImages.length)
  }

  return (
    <section className="relative h-screen md:h-[600px] overflow-hidden bg-background">
      <div className="relative w-full h-full">
        {sportImages.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.image || "/placeholder.svg"} alt={slide.sport} className="w-full h-full object-cover" />
            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/50"></div>
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <div className="mb-8">
            <p className="text-primary text-lg font-semibold mb-2">{sportImages[currentSlide].sport}</p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 text-balance">
              Đặt Sân Thể Thao Hoàn Hảo
            </h1>
            <p className="text-lg md:text-xl text-gray-200 mb-8 text-balance max-w-2xl mx-auto">
              Tìm và đặt các sân thể thao tốt nhất trong khu vực của bạn. Từ bóng đá đến bóng rổ, quần vợt đến cầu
              lông—đặt ngay và chơi hôm nay.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="bg-primary text-primary-foreground font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition"
            >
              Duyệt Sân
            </Link>
            <Link
              href="/register"
              className="bg-white text-black font-semibold px-8 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Bắt Đầu
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex gap-4">
        <button
          onClick={prevSlide}
          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-sm"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition backdrop-blur-sm"
          aria-label="Next slide"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute bottom-8 right-8 z-20 flex gap-2">
        {sportImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition ${index === currentSlide ? "bg-white w-8" : "bg-white/50"}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
