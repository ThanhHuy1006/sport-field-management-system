import type { PricePreset } from "@/types"

export const SPORT_TYPES = ["Tất cả", "Bóng đá", "Bóng rổ", "Cầu lông", "Tennis", "Bóng chuyền"] as const

export const DISTRICTS = [
  "Tất cả",
  "Quận 1",
  "Quận 2",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 7",
  "Bình Thạnh",
  "Phú Nhuận",
  "Tân Bình",
  "Gò Vấp",
] as const

export const PRICE_PRESETS: PricePreset[] = [
  { label: "Dưới 200K", min: 0, max: 200000 },
  { label: "200K - 400K", min: 200000, max: 400000 },
  { label: "400K - 600K", min: 400000, max: 600000 },
  { label: "Trên 600K", min: 600000, max: Number.POSITIVE_INFINITY },
]

export const FIELD_IMAGES: Record<string, string> = {
  "Bóng đá": "/soccer-field-green-grass.jpg",
  "Cầu lông": "/indoor-badminton-court.png",
  "Bóng rổ": "/indoor-basketball-court.png",
  Tennis: "/professional-tennis-court.jpg",
  "Bóng chuyền": "/beach-volleyball-court.png",
}

export const SORT_OPTIONS = [
  { value: "rating", label: "Đánh giá cao" },
  { value: "price-asc", label: "Giá thấp đến cao" },
  { value: "price-desc", label: "Giá cao đến thấp" },
  { value: "name", label: "Tên A-Z" },
] as const
