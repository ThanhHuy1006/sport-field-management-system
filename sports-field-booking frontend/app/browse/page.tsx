"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Filter, ArrowLeft } from "lucide-react"
import { getFields } from "@/lib/fetchers"
import type { BrowseField } from "@/lib/fetchers"

export default function BrowsePage() {
  const [fields, setFields] = useState<BrowseField[]>([])
  const [filtered, setFiltered] = useState<BrowseField[]>([])
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedSport, setSelectedSport] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 600000])
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  const sports = ["All", "Soccer", "Badminton", "Basketball", "Tennis", "Volleyball", "Swimming"]

  useEffect(() => {
    getFields()
      .then((data) => {
        setFields(data)
        setFiltered(data)
      })
      .catch((err) => console.error("Fetch error:", err))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const results = fields.filter((f) => {
      const matchLocation = f.location?.toLowerCase().includes(searchLocation.toLowerCase())
      const matchSport = selectedSport === "All" || f.type === selectedSport
      const matchPrice = f.price >= priceRange[0] && f.price <= priceRange[1]
      return matchLocation && matchSport && matchPrice
    })
    setFiltered(results)
  }, [fields, searchLocation, selectedSport, priceRange])

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải danh sách sân...</p>
      </main>
    )

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">Browse Fields</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-2 lg:hidden">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)}>✕</button>
              </div>

              <div>
                <h3 className="font-bold mb-3">Location</h3>
                <Input
                  placeholder="Search location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>

              <div>
                <h3 className="font-bold mb-3">Sport Type</h3>
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
                      <span>{sport}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-3">Price Range</h3>
                <input
                  type="range"
                  min="0"
                  max="600000"
                  step="50000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
                <div className="text-sm text-muted-foreground">Up to {priceRange[1].toLocaleString()} VND</div>
              </div>

              <Button className="w-full" onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setShowFilters(true)}
              className="lg:hidden flex items-center gap-2 mb-6 px-4 py-2 border border-border rounded-lg"
            >
              <Filter className="w-4 h-4" />
              Filters
            </button>

            <div className="mb-6 text-muted-foreground">
              Showing {filtered.length} field{filtered.length !== 1 ? "s" : ""}
            </div>

            {/* Grid of Fields */}
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
                          <span className="text-sm font-medium">{field.rating?.toFixed(1) ?? "N/A"}</span>
                          <span className="text-xs text-muted-foreground">({field.reviews})</span>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            field.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}
                        >
                          {field.available ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filtered.length === 0 && (
              <Card className="p-12 text-center mt-6">
                <p className="text-muted-foreground text-lg">No fields found matching your criteria</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
