"use client"

import { MapPin, Grid3X3, DollarSign, X, LayoutGrid, List, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { SPORT_TYPES, DISTRICTS, PRICE_PRESETS, SORT_OPTIONS } from "@/lib/constants"
import type { PricePreset } from "@/types"

interface FieldFiltersProps {
  selectedDistrict: string
  setSelectedDistrict: (value: string) => void
  selectedSport: string
  setSelectedSport: (value: string) => void
  selectedPrice: PricePreset | null
  setSelectedPrice: (value: PricePreset | null) => void
  sortBy: string
  setSortBy: (value: string) => void
  viewMode: "grid" | "list"
  setViewMode: (value: "grid" | "list") => void
  totalResults: number
}

export function FieldFilters({
  selectedDistrict,
  setSelectedDistrict,
  selectedSport,
  setSelectedSport,
  selectedPrice,
  setSelectedPrice,
  sortBy,
  setSortBy,
  viewMode,
  setViewMode,
  totalResults,
}: FieldFiltersProps) {
  const activeFiltersCount = [selectedDistrict !== "Tất cả", selectedSport !== "Tất cả", selectedPrice !== null].filter(
    Boolean,
  ).length

  const clearAllFilters = () => {
    setSelectedDistrict("Tất cả")
    setSelectedSport("Tất cả")
    setSelectedPrice(null)
  }

  const FilterContent = () => (
    <div className="flex flex-wrap items-center gap-3">
      {/* District filter */}
      <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
        <SelectTrigger
          className={`w-[160px] bg-background border-input ${
            selectedDistrict !== "Tất cả" ? "ring-2 ring-primary border-primary" : ""
          }`}
        >
          <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {DISTRICTS.map((district) => (
            <SelectItem key={district} value={district}>
              {district === "Tất cả" ? "Tất cả quận" : district}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Sport type filter */}
      <Select value={selectedSport} onValueChange={setSelectedSport}>
        <SelectTrigger
          className={`w-[160px] bg-background border-input ${
            selectedSport !== "Tất cả" ? "ring-2 ring-primary border-primary" : ""
          }`}
        >
          <Grid3X3 className="w-4 h-4 mr-2 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          {SPORT_TYPES.map((sport) => (
            <SelectItem key={sport} value={sport}>
              {sport === "Tất cả" ? "Tất cả loại sân" : sport}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Price filter */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`gap-2 ${selectedPrice ? "ring-2 ring-primary border-primary bg-primary/5" : ""}`}
          >
            <DollarSign className="w-4 h-4" />
            {selectedPrice ? selectedPrice.label : "Mức giá"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-56 p-3 bg-popover border-border" align="start">
          <div className="space-y-2">
            {PRICE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                variant={selectedPrice?.label === preset.label ? "default" : "outline"}
                className="w-full justify-start"
                onClick={() => setSelectedPrice(selectedPrice?.label === preset.label ? null : preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* Clear filters */}
      {activeFiltersCount > 0 && (
        <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-destructive">
          <X className="w-4 h-4 mr-1" />
          Xóa ({activeFiltersCount})
        </Button>
      )}
    </div>
  )

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Desktop filters */}
          <div className="hidden lg:block">
            <FilterContent />
          </div>

          {/* Mobile filter button */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="w-full bg-transparent">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Bộ lọc
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-auto bg-background">
                <SheetHeader>
                  <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
                </SheetHeader>
                <div className="py-4 space-y-4">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Right side: Results count, Sort, View mode */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Tìm thấy <strong className="text-foreground">{totalResults}</strong> sân
            </span>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] bg-background border-input">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex border border-input rounded-lg overflow-hidden">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-none"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-none"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
