"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { FieldCard, FieldFilters, FieldSearch } from "@/components/fields"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PricePreset } from "@/types"
import {
  getBrowseFields,
  type BrowseFieldItem,
} from "@/features/fields/services/get-browse-fields";

const ITEMS_PER_PAGE = 8

function mapUiSortToApiSort(sortBy: string) {
  switch (sortBy) {
    case "price-asc":
      return "price_asc"
    case "price-desc":
      return "price_desc"
    case "name":
      return "name"
    case "rating":
      return "rating"
    default:
      return "newest"
  }
}

function getPageNumbers(totalPages: number, currentPage: number) {
  const pages: (number | string)[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
    return pages
  }

  if (currentPage <= 3) {
    pages.push(1, 2, 3, 4, "...", totalPages)
    return pages
  }

  if (currentPage >= totalPages - 2) {
    pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    return pages
  }

  pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
  return pages
}

export default function BrowsePage() {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "")
  const [selectedDistrict, setSelectedDistrict] = useState(
    () => searchParams.get("district") ?? searchParams.get("location") ?? "Tất cả"
  )
  const [selectedSport, setSelectedSport] = useState(
    () => searchParams.get("sport") ?? searchParams.get("sport_type") ?? "Tất cả"
  )
  const [selectedPrice, setSelectedPrice] = useState<PricePreset | null>(null)
  const [sortBy, setSortBy] = useState(() => searchParams.get("sort") ?? "rating")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(() => {
    const page = Number(searchParams.get("page") ?? 1)
    return Number.isNaN(page) || page < 1 ? 1 : page
  })

  const [fields, setFields] = useState<BrowseFieldItem[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value)
    setCurrentPage(1)
  }

  const handleSportChange = (value: string) => {
    setSelectedSport(value)
    setCurrentPage(1)
  }

  const handlePriceChange = (value: PricePreset | null) => {
    setSelectedPrice(value)
    setCurrentPage(1)
  }

  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    let cancelled = false

    async function fetchFields() {
      try {
        setIsLoading(true)
        setError("")

        const result = await getBrowseFields({
          q: searchQuery.trim() || undefined,
          sport: selectedSport !== "Tất cả" ? selectedSport : undefined,
          district: selectedDistrict !== "Tất cả" ? selectedDistrict : undefined,
          sort: mapUiSortToApiSort(sortBy),
          page: currentPage,
          limit: ITEMS_PER_PAGE,
          minPrice: selectedPrice?.min,
          maxPrice: selectedPrice?.max,
        })

        if (cancelled) return

        setFields(result.data.items ?? [])
        setPagination(
          result.data.pagination ?? {
            page: 1,
            limit: ITEMS_PER_PAGE,
            total: 0,
            totalPages: 0,
          }
        )
      } catch (err) {
        if (cancelled) return

        setFields([])
        setPagination({
          page: 1,
          limit: ITEMS_PER_PAGE,
          total: 0,
          totalPages: 0,
        })
        setError(err instanceof Error ? err.message : "Đã có lỗi xảy ra")
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchFields()

    return () => {
      cancelled = true
    }
  }, [searchQuery, selectedDistrict, selectedSport, selectedPrice, sortBy, currentPage])

  const pageNumbers = getPageNumbers(pagination.totalPages, currentPage)
  const startItem = pagination.total === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endItem = Math.min(currentPage * ITEMS_PER_PAGE, pagination.total)

  return (
    <>
      <section className="relative py-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb items={[{ label: "Danh sách sân" }]} className="mb-6" />

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Danh Sách Sân Thể Thao
          </h1>
          <p className="text-lg text-foreground/70 mb-8">
            Khám phá và đặt sân thể thao chất lượng cao tại TP.HCM
          </p>

          <FieldSearch
            value={searchQuery}
            onChange={handleSearchChange}
            className="max-w-2xl bg-card rounded-lg shadow-lg"
          />
        </div>
      </section>

      <FieldFilters
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={handleDistrictChange}
        selectedSport={selectedSport}
        setSelectedSport={handleSportChange}
        selectedPrice={selectedPrice}
        setSelectedPrice={handlePriceChange}
        sortBy={sortBy}
        setSortBy={handleSortChange}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalResults={pagination.total}
      />

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {isLoading ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">Đang tải danh sách sân...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-xl text-destructive">{error}</p>
              <p className="text-muted-foreground mt-2">
                Kiểm tra lại API hoặc cấu hình NEXT_PUBLIC_API_BASE_URL
              </p>
            </div>
          ) : fields.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">Không tìm thấy sân phù hợp</p>
              <p className="text-muted-foreground mt-2">
                Thử thay đổi bộ lọc để xem thêm kết quả
              </p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {fields.map((field) => (
                    <FieldCard key={field.id} field={field} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {fields.map((field) => (
                    <FieldCard key={field.id} field={field} viewMode="list" />
                  ))}
                </div>
              )}

              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {pageNumbers.map((page, index) =>
                    page === "..." ? (
                      <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="icon"
                        onClick={() => handlePageChange(page as number)}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-4">
                Hiển thị {startItem} - {endItem} trong {pagination.total} sân
              </p>
            </>
          )}
        </div>
      </section>
    </>
  )
}