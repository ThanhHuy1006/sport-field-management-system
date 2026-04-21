export interface Field {
  id: number
  name: string
  type: string
  rating: number
  reviews: number
  location: string
  district: string | null
  price: number
  image: string | null
  openTime: string | null
  closeTime: string | null
  available: boolean
}

export interface FieldCardProps {
  field: Field
  viewMode?: "grid" | "list"
}

export interface PricePreset {
  label: string
  min: number
  max: number
}
