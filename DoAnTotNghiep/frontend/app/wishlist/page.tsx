"use client"

import { useEffect, useState, type SyntheticEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
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
import {
  getStoredAccessToken,
  getStoredUser,
} from "@/features/auth/lib/auth-storage"
import {
  getMyFavoriteFields,
  mapFavoriteFieldToUi,
  removeFavoriteField,
  type FavoriteFieldUi,
} from "@/features/favorites/services/favorites.service"

function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget

  if (img.src.includes("/placeholder.svg")) return

  img.src = "/placeholder.svg"
}

export default function WishlistPage() {
  const router = useRouter()

  const [authChecked, setAuthChecked] = useState(false)
  const [wishlist, setWishlist] = useState<FavoriteFieldUi[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [removingIds, setRemovingIds] = useState<number[]>([])

  const itemsPerPage = 9

  useEffect(() => {
    const token = getStoredAccessToken()
    const user = getStoredUser()
    const role = String(user?.role ?? "").toUpperCase()

    if (!token || !user) {
      router.replace("/login?redirect=/wishlist")
      return
    }

    if (role === "OWNER") {
      router.replace("/owner/dashboard")
      return
    }

    if (role === "ADMIN") {
      router.replace("/admin/dashboard")
      return
    }

    if (role !== "USER") {
      router.replace("/browse")
      return
    }

    setAuthChecked(true)
  }, [router])

  useEffect(() => {
    if (!authChecked) return

    const token = getStoredAccessToken()

    if (!token) {
      router.replace("/login?redirect=/wishlist")
      return
    }

    let cancelled = false

    async function fetchWishlist() {
      try {
        setIsLoading(true)
        setError("")

        const result = await getMyFavoriteFields({
          page: currentPage,
          limit: itemsPerPage,
        })

        if (cancelled) return

        setWishlist(result.data.items.map(mapFavoriteFieldToUi))
        setTotalItems(result.data.pagination.total)
        setTotalPages(Math.max(1, result.data.pagination.totalPages || 1))
      } catch (err) {
        if (cancelled) return

        setWishlist([])
        setTotalItems(0)
        setTotalPages(1)
        setError(
          err instanceof Error
            ? err.message
            : "Không thể tải danh sách yêu thích",
        )
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchWishlist()

    return () => {
      cancelled = true
    }
  }, [authChecked, currentPage, router])

  const handleRemove = async (fieldId: number) => {
    const token = getStoredAccessToken()

    if (!token) {
      router.push("/login?redirect=/wishlist")
      return
    }

    try {
      setRemovingIds((prev) =>
        prev.includes(fieldId) ? prev : [...prev, fieldId],
      )
      setError("")

      await removeFavoriteField(fieldId)

      const nextWishlist = wishlist.filter((field) => field.id !== fieldId)
      const nextTotalItems = Math.max(0, totalItems - 1)
      const nextTotalPages = Math.max(1, Math.ceil(nextTotalItems / itemsPerPage))

      setWishlist(nextWishlist)
      setTotalItems(nextTotalItems)
      setTotalPages(nextTotalPages)

      if (nextWishlist.length === 0 && currentPage > 1) {
        setCurrentPage((prev) => Math.max(1, prev - 1))
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể xóa khỏi yêu thích",
      )
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== fieldId))
    }
  }

  if (!authChecked) {
    return null
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href="/profile"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Danh sách yêu thích</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Bạn có {totalItems} sân trong danh sách yêu thích
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
            {error}
          </Card>
        )}

        {isLoading ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Đang tải danh sách yêu thích...
            </p>
          </Card>
        ) : wishlist.length === 0 ? (
          <Card className="p-12 text-center">
            <Heart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Chưa có sân yêu thích</h2>
            <p className="text-muted-foreground mb-6">
              Thêm các sân bạn thích vào danh sách để dễ dàng tìm lại sau
            </p>
            <Link href="/browse">
              <Button>Khám phá sân</Button>
            </Link>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {wishlist.map((field) => {
                const isRemoving = removingIds.includes(field.id)

                return (
                  <Card
                    key={field.id}
                    className="overflow-hidden hover:shadow-lg transition h-full"
                  >
                    <div className="relative">
                      <Link href={`/field/${field.id}`}>
                        <img
                          src={field.image || "/placeholder.svg"}
                          alt={field.name}
                          onError={handleImageError}
                          className="w-full h-48 object-cover"
                        />
                      </Link>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <button
                            disabled={isRemoving}
                            className="absolute top-3 right-3 p-2 bg-white rounded-full hover:bg-muted transition disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                          </button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Xóa khỏi yêu thích?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Bạn có chắc muốn xóa {field.name} khỏi danh sách
                              yêu thích?
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Hủy</AlertDialogCancel>
                            <AlertDialogAction
                              disabled={isRemoving}
                              onClick={() => handleRemove(field.id)}
                            >
                              {isRemoving ? "Đang xóa..." : "Xóa"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>

                    <div className="p-4">
                      <Link href={`/field/${field.id}`}>
                        <h3 className="font-bold text-lg mb-2 hover:text-primary transition">
                          {field.name}
                        </h3>
                      </Link>

                      <div className="mb-2 text-sm text-muted-foreground">
                        {field.type}
                      </div>

                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="line-clamp-2">{field.location}</span>
                      </div>

                      <div className="flex items-center justify-between mb-4">
                        <span className="text-primary font-bold">
                          {field.price.toLocaleString("vi-VN")} {field.currency}
                        </span>

                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {field.rating}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ({field.reviews})
                          </span>
                        </div>
                      </div>

                      <Link href={`/booking/${field.id}`}>
                        <Button className="w-full">Đặt ngay</Button>
                      </Link>
                    </div>
                  </Card>
                )
              })}
            </div>

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
            />
          </>
        )}
      </div>
    </main>
  )
}
