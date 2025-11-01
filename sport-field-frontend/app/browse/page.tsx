"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Filter, ArrowLeft } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getFields, type BrowseField } from "@/lib/fetchers"

export default function BrowsePage() {
  const [fields, setFields] = useState<BrowseField[]>([])
  const [filtered, setFiltered] = useState<BrowseField[]>([])
  const [selectedLocation, setSelectedLocation] = useState("all")
  const [selectedSport, setSelectedSport] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 600000])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  const sports = ["All", "Soccer", "Badminton", "Basketball", "Tennis", "Volleyball", "Swimming"]
  const districts = [
    { value: "all", label: "Tất cả quận" },
    { value: "District 1", label: "Quận 1" },
    { value: "District 3", label: "Quận 3" },
    { value: "District 5", label: "Quận 5" },
    { value: "District 7", label: "Quận 7" },
    { value: "Binh Thanh", label: "Bình Thạnh" },
    { value: "Tan Binh", label: "Tân Bình" },
    { value: "Phu Nhuan", label: "Phú Nhuận" },
  ]

  // ✅ Gọi API khi load trang
  useEffect(() => {
    getFields()
      .then((data) => {
        setFields(data)
        setFiltered(data)
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  // ✅ Áp dụng filter
  useEffect(() => {
    const results = fields.filter((field) => {
      const matchesLocation = selectedLocation === "all" || field.location?.includes(selectedLocation)
      const matchesSport = selectedSport === "All" || field.type === selectedSport
      const matchesPrice = field.price >= priceRange[0] && field.price <= priceRange[1]
      return matchesLocation && matchesSport && matchesPrice
    })
    setFiltered(results)
  }, [fields, selectedLocation, selectedSport, priceRange])

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải danh sách sân...</p>
      </main>
    )

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay Lại
          </Link>
          <h1 className="text-xl font-bold text-foreground">Duyệt Sân</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-2 lg:hidden">
                <h2 className="text-lg font-bold">Bộ Lọc</h2>
                <button onClick={() => setShowFilters(false)}>✕</button>
              </div>

              {/* Location Filter */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Vị Trí</h3>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quận..." />
                  </SelectTrigger>
                  <SelectContent>
                    {districts.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sport Filter */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Loại Thể Thao</h3>
                <div className="space-y-2">
                  {sports.map((sport) => (
                    <label key={sport} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="sport"
                        value={sport}
                        checked={selectedSport === sport}
                        onChange={(e) => setSelectedSport(e.target.value)}
                        className="w-4 h-4"
                      />
                      <span className="text-sm text-foreground">{sport}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Khoảng Giá</h3>
                <input
                  type="range"
                  min="0"
                  max="600000"
                  step="50000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Tối đa {priceRange[1].toLocaleString()} VND</div>
              </div>

              <Button className="w-full" onClick={() => setShowFilters(false)}>
                Áp Dụng Bộ Lọc
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {filtered.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">
                  Không tìm thấy sân phù hợp với tiêu chí của bạn
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((field) => (
                  <Link key={field.id} href={`/field/${field.id}`}>
                    <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                      <img
                        src={field.image || "/placeholder.svg"}
                        alt={field.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="font-bold text-lg mb-2">{field.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                          <MapPin className="w-4 h-4" />
                          {field.location}
                        </div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-primary font-bold">{field.price.toLocaleString()} VND</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-medium">
                              {field.rating ? field.rating.toFixed(1) : "N/A"}
                            </span>
                            <span className="text-xs text-muted-foreground">({field.reviews})</span>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            field.available
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {field.available ? "Còn Trống" : "Đã Đặt"}
                        </span>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
