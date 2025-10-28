"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Clock, Phone, Mail, ArrowLeft, Heart, Share2, ChevronLeft, ChevronRight } from "lucide-react"

const mockFieldDetails = {
  1: {
    id: 1,
    name: "Green Valley Soccer Field",
    type: "Soccer",
    location: "District 1, HCMC",
    address: "123 Sports Street, District 1, Ho Chi Minh City",
    price: 500000,
    rating: 4.8,
    reviewCount: 124,
    images: ["/placeholder.svg?key=vbfdr", "/placeholder.svg?key=njyq6", "/placeholder.svg?key=ejrsp"],
    description:
      "Professional soccer field with premium grass, perfect for matches and training. Equipped with modern facilities including changing rooms, parking, and spectator seating.",
    amenities: [
      "Parking",
      "Changing Rooms",
      "Shower Facilities",
      "Spectator Seating",
      "Floodlights",
      "Equipment Rental",
    ],
    hours: "06:00 - 22:00",
    capacity: 22,
    owner: {
      name: "Green Valley Sports",
      phone: "+84 123 456 789",
      email: "contact@greenvalley.com",
      rating: 4.8,
      reviews: 156,
    },
    availability: {
      "2025-01-15": ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "18:00", "19:00", "20:00"],
      "2025-01-16": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"],
      "2025-01-17": ["08:00", "09:00", "10:00", "14:00", "15:00", "16:00", "18:00", "19:00"],
    },
    reviews: [
      { id: 1, author: "John Doe", rating: 5, text: "Excellent field! Very well maintained.", date: "2025-01-10" },
      { id: 2, author: "Jane Smith", rating: 4, text: "Good facilities, friendly staff.", date: "2025-01-08" },
      { id: 3, author: "Mike Johnson", rating: 5, text: "Best soccer field in the city!", date: "2025-01-05" },
    ],
  },
}

export default function FieldDetailsPage({ params }: { params: { id: string } }) {
  const field = mockFieldDetails[params.id as keyof typeof mockFieldDetails]
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isWishlisted, setIsWishlisted] = useState(false)

  if (!field) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Field not found</h1>
          <Link href="/">
            <Button className="mt-4">Back to Home</Button>
          </Link>
        </div>
      </main>
    )
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % field.images.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + field.images.length) % field.images.length)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Back
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
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="relative bg-muted rounded-lg overflow-hidden mb-8">
              <img
                src={field.images[currentImageIndex] || "/placeholder.svg"}
                alt={field.name}
                className="w-full h-96 object-cover"
              />
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
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {field.images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Field Info */}
            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{field.name}</h1>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {field.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {field.rating} ({field.reviewCount} reviews)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{field.price.toLocaleString()} VND</div>
                  <div className="text-sm text-muted-foreground">per hour</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">About This Field</h2>
              <p className="text-muted-foreground mb-6">{field.description}</p>

              <h3 className="text-lg font-bold mb-3">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {field.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full" />
                    {amenity}
                  </div>
                ))}
              </div>
            </Card>

            {/* Operating Hours */}
            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Operating Hours</h3>
              </div>
              <p className="text-foreground">{field.hours}</p>
            </Card>

            {/* Owner Info */}
            <Card className="p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Field Owner</h3>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground mb-2">{field.owner.name}</h4>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {field.owner.rating} ({field.owner.reviews} reviews)
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {field.owner.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {field.owner.email}
                    </div>
                  </div>
                </div>
                <Button variant="outline">Contact Owner</Button>
              </div>
            </Card>

            {/* Reviews */}
            <Card className="p-6">
              <h3 className="text-lg font-bold mb-6">Customer Reviews</h3>
              <div className="space-y-6">
                {field.reviews.map((review) => (
                  <div key={review.id} className="pb-6 border-b border-border last:border-b-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-foreground">{review.author}</h4>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                    <p className="text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Book This Field</h3>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Date</label>
                  <input type="date" className="w-full px-3 py-2 border border-border rounded-md" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Select Time</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option>Choose a time slot</option>
                    <option>08:00 - 09:00</option>
                    <option>09:00 - 10:00</option>
                    <option>10:00 - 11:00</option>
                    <option>14:00 - 15:00</option>
                    <option>15:00 - 16:00</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Duration (hours)</label>
                  <select className="w-full px-3 py-2 border border-border rounded-md bg-background">
                    <option>1 hour</option>
                    <option>2 hours</option>
                    <option>3 hours</option>
                    <option>4 hours</option>
                  </select>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Price per hour</span>
                  <span className="font-bold">{field.price.toLocaleString()} VND</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-bold">1 hour</span>
                </div>
                <div className="border-t border-border pt-2 mt-2 flex justify-between">
                  <span className="font-bold">Total</span>
                  <span className="text-lg font-bold text-primary">{field.price.toLocaleString()} VND</span>
                </div>
              </div>

              <Link href={`/booking/${field.id}`}>
                <Button className="w-full mb-3">Continue to Booking</Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent">
                Add to Wishlist
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
