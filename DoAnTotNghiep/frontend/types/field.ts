export interface Field {
  id: number
  name: string
  type: string
  rating: number
  reviews: number
  location: string
  district: string
  price: number
  image: string
  openTime: string
  closeTime: string
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
