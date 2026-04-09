"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin, Star, Heart, ArrowLeft } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Pagination } from "@/components/pagination"

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
  const [wishlist, setWishlist] = useState(mockWishlist)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  const totalPages = Math.ceil(wishlist.length / itemsPerPage)
  const paginatedWishlist = wishlist.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleRemove = (fieldId: number) => {
    setWishlist(wishlist.filter((field) => field.id !== fieldId))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/profile" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Danh sách yêu thích</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">Bạn có {wishlist.length} sân trong danh sách yêu thích</p>
        </div>

        {wishlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Chưa có sân yêu thích</h2>
            <p className="text-muted-foreground mb-6">Thêm các sân bạn thích vào danh sách để dễ dàng tìm lại sau</p>
            <Link href="/browse">
              <Button>Khám phá sân</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {paginatedWishlist.map((field) => (
                <Card key={field.id} className="overflow-hidden hover:shadow-lg transition h-full">
                  <div className="relative">
                    <Link href={`/field/${field.id}`}>
                      <img
                        src={field.image || "/placeholder.svg"}
                        alt={field.name}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-muted transition">
                          <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Xóa khỏi yêu thích?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Bạn có chắc muốn xóa {field.name} khỏi danh sách yêu thích?
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Hủy</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRemove(field.id)}>Xóa</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  <div className="p-4">
                    <Link href={`/field/${field.id}`}>
                      <h3 className="font-bold text-lg mb-2 hover:text-primary transition">{field.name}</h3>
                    </Link>
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
                    <Link href={`/booking/${field.id}`}>
                      <Button className="w-full">Đặt ngay</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={wishlist.length}
            />
          </>
        )}
      </div>
    </main>
  )
}
