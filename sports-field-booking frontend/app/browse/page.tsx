"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Filter, ArrowLeft } from "lucide-react"

const mockFields = [
  {
    id: 1,
    name: "Green Valley Soccer Field",
    type: "Soccer",
    location: "District 1, HCMC",
    price: 500000,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?key=vbfdr",
    available: true,
  },
  {
    id: 2,
    name: "Badminton Court Pro",
    type: "Badminton",
    location: "District 3, HCMC",
    price: 200000,
    rating: 4.6,
    reviews: 89,
    image: "/placeholder.svg?key=njyq6",
    available: true,
  },
  {
    id: 3,
    name: "Basketball Arena",
    type: "Basketball",
    location: "District 7, HCMC",
    price: 400000,
    rating: 4.9,
    reviews: 156,
    image: "/placeholder.svg?key=ejrsp",
    available: true,
  },
  {
    id: 4,
    name: "Tennis Court Elite",
    type: "Tennis",
    location: "District 2, HCMC",
    price: 350000,
    rating: 4.7,
    reviews: 102,
    image: "/placeholder.svg?key=jtmmn",
    available: false,
  },
  {
    id: 5,
    name: "Volleyball Court",
    type: "Volleyball",
    location: "District 4, HCMC",
    price: 300000,
    rating: 4.5,
    reviews: 67,
    image: "/placeholder.svg?key=abcde",
    available: true,
  },
  {
    id: 6,
    name: "Swimming Pool",
    type: "Swimming",
    location: "District 5, HCMC",
    price: 250000,
    rating: 4.4,
    reviews: 95,
    image: "/placeholder.svg?key=fghij",
    available: true,
  },
]

export default function BrowsePage() {
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedSport, setSelectedSport] = useState("All")
  const [priceRange, setPriceRange] = useState([0, 600000])
  const [showFilters, setShowFilters] = useState(false)

  const sports = ["All", "Soccer", "Badminton", "Basketball", "Tennis", "Volleyball", "Swimming"]

  const filteredFields = mockFields.filter((field) => {
    const matchesLocation = field.location.toLowerCase().includes(searchLocation.toLowerCase())
    const matchesSport = selectedSport === "All" || field.type === selectedSport
    const matchesPrice = field.price >= priceRange[0] && field.price <= priceRange[1]
    return matchesLocation && matchesSport && matchesPrice
  })

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
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? "block" : "hidden lg:block"}`}>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6 lg:hidden">
                <h2 className="text-lg font-bold">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="text-muted-foreground">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {/* Location Filter */}
                <div>
                  <h3 className="font-bold text-foreground mb-3">Location</h3>
                  <Input
                    placeholder="Search location..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                  />
                </div>

                {/* Sport Type Filter */}
                <div>
                  <h3 className="font-bold text-foreground mb-3">Sport Type</h3>
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
                  <h3 className="font-bold text-foreground mb-3">Price Range</h3>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="600000"
                      step="50000"
                      value={priceRange[1]}
                      onChange={(e) => setPriceRange([priceRange[0], Number.parseInt(e.target.value)])}
                      className="w-full"
                    />
                    <div className="text-sm text-muted-foreground">Up to {priceRange[1].toLocaleString()} VND</div>
                  </div>
                </div>

                <Button className="w-full" onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </div>
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

            {/* Results */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Showing {filteredFields.length} field{filteredFields.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredFields.map((field) => (
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
                          <span className="text-sm font-medium">{field.rating}</span>
                          <span className="text-xs text-muted-foreground">({field.reviews})</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded ${field.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                        >
                          {field.available ? "Available" : "Booked"}
                        </span>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredFields.length === 0 && (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground text-lg">No fields found matching your criteria</p>
              </Card>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
