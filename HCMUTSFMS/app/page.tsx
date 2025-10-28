"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { MapPin, Star, ArrowRight, Search } from "lucide-react"
import { TopNav } from "@/components/top-nav"

const mockFields = [
  {
    id: 1,
    name: "Green Valley Soccer Field",
    type: "Soccer",
    location: "District 1, HCMC",
    price: 500000,
    rating: 4.8,
    reviews: 124,
    image: "/soccer-field.png",
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
    image: "/badminton-court.png",
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
    image: "/outdoor-basketball-court.png",
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
    image: "/outdoor-tennis-court.png",
    available: false,
  },
]

export default function Home() {
  const [searchLocation, setSearchLocation] = useState("")
  const [selectedSport, setSelectedSport] = useState("All")

  const sports = ["All", "Soccer", "Badminton", "Basketball", "Tennis"]

  const filteredFields = mockFields.filter((field) => {
    const matchesLocation = field.location.toLowerCase().includes(searchLocation.toLowerCase())
    const matchesSport = selectedSport === "All" || field.type === selectedSport
    return matchesLocation && matchesSport
  })

  return (
    <main className="min-h-screen bg-background">
      <TopNav />

      {/* Hero Section */}
      <section className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
              Book Your Perfect Sports Field
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Find and reserve the best sports facilities in your area. Instant booking, transparent pricing, and a
              trusted community.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link href="/browse">
                <Button size="lg" className="gap-2">
                  <Search className="w-5 h-5" />
                  Browse Fields
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Search Section */}
      <section className="bg-background py-12 border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-muted rounded-lg border border-border p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-foreground mb-4">Find Your Field</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Location</label>
                <Input
                  placeholder="Enter location..."
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Time</label>
                <Input type="time" />
              </div>
              <div className="flex items-end">
                <Button className="w-full">Search</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sport Filter */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-2 flex-wrap">
          {sports.map((sport) => (
            <Button
              key={sport}
              variant={selectedSport === sport ? "default" : "outline"}
              onClick={() => setSelectedSport(sport)}
              size="sm"
            >
              {sport}
            </Button>
          ))}
        </div>
      </section>

      {/* Featured Fields */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Featured Fields</h2>
          <p className="text-muted-foreground">Popular sports facilities available for booking</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredFields.map((field) => (
            <Link key={field.id} href={`/field/${field.id}`}>
              <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                <div className="relative">
                  <img src={field.image || "/placeholder.svg"} alt={field.name} className="w-full h-40 object-cover" />
                  <div className="absolute top-2 right-2">
                    <span
                      className={`text-xs px-2 py-1 rounded font-medium ${
                        field.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}
                    >
                      {field.available ? "Available" : "Booked"}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-foreground mb-2 line-clamp-2">{field.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {field.location}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-semibold text-foreground">{(field.price / 1000).toFixed(0)}K VND</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{field.rating}</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent" size="sm">
                    View Details <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground mb-12 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold text-foreground mb-2">Search</h3>
              <p className="text-sm text-muted-foreground">Find fields by location, sport type, and date</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold text-foreground mb-2">Check Details</h3>
              <p className="text-sm text-muted-foreground">View amenities, pricing, and availability</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold text-foreground mb-2">Book Now</h3>
              <p className="text-sm text-muted-foreground">Complete booking with secure payment</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold text-foreground mb-2">Play & Review</h3>
              <p className="text-sm text-muted-foreground">Enjoy and share your experience</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">2,500+</div>
            <p className="text-muted-foreground font-medium">Active Fields</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">50,000+</div>
            <p className="text-muted-foreground font-medium">Happy Users</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">100,000+</div>
            <p className="text-muted-foreground font-medium">Bookings Made</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">15+</div>
            <p className="text-muted-foreground font-medium">Cities Covered</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Book Your Field?</h2>
          <p className="text-lg opacity-90 mb-8">Start your sports journey today</p>
          <Link href="/browse">
            <Button
              size="lg"
              variant="outline"
              className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              Browse Fields Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-foreground mb-4">About</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Cookies
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Facebook
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Instagram
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 HCMUT Sport Field Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
