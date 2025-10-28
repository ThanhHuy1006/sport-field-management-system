"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Heart, ArrowLeft } from "lucide-react"

const mockWishlist = [
  {
    id: 1,
    name: "Green Valley Soccer Field",
    type: "Soccer",
    location: "District 1, HCMC",
    price: 500000,
    rating: 4.8,
    reviews: 124,
    image: "/placeholder.svg?key=vbfdr",
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
  },
]

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
          </Link>
          <h1 className="text-xl font-bold">My Wishlist</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            You have {mockWishlist.length} field{mockWishlist.length !== 1 ? "s" : ""} in your wishlist
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockWishlist.map((field) => (
            <Link key={field.id} href={`/field/${field.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition cursor-pointer h-full">
                <div className="relative">
                  <img src={field.image || "/placeholder.svg"} alt={field.name} className="w-full h-48 object-cover" />
                  <button className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-muted transition">
                    <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-lg mb-2">{field.name}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                    <MapPin className="w-4 h-4" />
                    {field.location}
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-primary font-bold">{field.price.toLocaleString()} VND</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{field.rating}</span>
                      <span className="text-xs text-muted-foreground">({field.reviews})</span>
                    </div>
                  </div>
                  <Button className="w-full">Book Now</Button>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}
