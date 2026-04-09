"use client"

import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Breadcrumb } from "@/components/layout/breadcrumb"
import { FieldCard, FieldFilters, FieldSearch } from "@/components/fields"
import { MOCK_FIELDS } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { PricePreset } from "@/types"

const ITEMS_PER_PAGE = 8

export default function BrowsePage() {
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedDistrict, setSelectedDistrict] = useState("Tất cả")
  const [selectedSport, setSelectedSport] = useState("Tất cả")
  const [selectedPrice, setSelectedPrice] = useState<PricePreset | null>(null)
  const [sortBy, setSortBy] = useState("rating")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    const sport = searchParams.get("sport")
    const location = searchParams.get("location")
    const query = searchParams.get("q")

    if (sport) setSelectedSport(sport)
    if (location) setSelectedDistrict(location)
    if (query) setSearchQuery(query)
  }, [searchParams])

  // Filter and sort fields
  const filteredFields = useMemo(() => {
    const result = MOCK_FIELDS.filter((field) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        field.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        field.location.toLowerCase().includes(searchQuery.toLowerCase())

      // District filter
      const matchesDistrict = selectedDistrict === "Tất cả" || field.district === selectedDistrict

      // Sport type filter
      const matchesSport = selectedSport === "Tất cả" || field.type === selectedSport

      // Price filter
      const matchesPrice =
        selectedPrice === null || (field.price >= selectedPrice.min && field.price <= selectedPrice.max)

      return matchesSearch && matchesDistrict && matchesSport && matchesPrice
    })

    // Sort
    switch (sortBy) {
      case "rating":
        result.sort((a, b) => b.rating - a.rating)
        break
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name))
        break
    }

    return result
  }, [searchQuery, selectedDistrict, selectedSport, selectedPrice, sortBy])

  const totalPages = Math.ceil(filteredFields.length / ITEMS_PER_PAGE)
  const paginatedFields = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredFields.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [filteredFields, currentPage])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedDistrict, selectedSport, selectedPrice, sortBy])

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages)
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
      }
    }
    return pages
  }

  return (
    <>
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-7xl mx-auto px-4">
          <Breadcrumb items={[{ label: "Danh sách sân" }]} className="mb-6" />

          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Danh Sách Sân Thể Thao</h1>
          <p className="text-lg text-foreground/70 mb-8">Khám phá và đặt sân thể thao chất lượng cao tại TP.HCM</p>

          <FieldSearch
            value={searchQuery}
            onChange={setSearchQuery}
            className="max-w-2xl bg-card rounded-lg shadow-lg"
          />
        </div>
      </section>

      {/* Filter Bar */}
      <FieldFilters
        selectedDistrict={selectedDistrict}
        setSelectedDistrict={setSelectedDistrict}
        selectedSport={selectedSport}
        setSelectedSport={setSelectedSport}
        selectedPrice={selectedPrice}
        setSelectedPrice={setSelectedPrice}
        sortBy={sortBy}
        setSortBy={setSortBy}
        viewMode={viewMode}
        setViewMode={setViewMode}
        totalResults={filteredFields.length}
      />

      {/* Results Section */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {filteredFields.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-xl text-muted-foreground">Không tìm thấy sân phù hợp</p>
              <p className="text-muted-foreground mt-2">Thử thay đổi bộ lọc để xem thêm kết quả</p>
            </div>
          ) : (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {paginatedFields.map((field) => (
                    <FieldCard key={field.id} field={field} viewMode="grid" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {paginatedFields.map((field) => (
                    <FieldCard key={field.id} field={field} viewMode="list" />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {getPageNumbers().map((page, index) =>
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
                    ),
                  )}

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Page info */}
              <p className="text-center text-sm text-muted-foreground mt-4">
                Hiển thị {(currentPage - 1) * ITEMS_PER_PAGE + 1} -{" "}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredFields.length)} trong {filteredFields.length} sân
              </p>
            </>
          )}
        </div>
      </section>
    </>
  )
}
