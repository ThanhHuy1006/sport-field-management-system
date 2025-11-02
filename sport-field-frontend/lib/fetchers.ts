// sports-field-frontend/lib/fetchers.ts
import api from "./api"

// ========================
// DANH SÁCH SÂN (Browse)
// ========================
export interface BrowseField {
  id: number
  name: string
  type: string
  location: string
  price: number
  rating: number | null
  reviews: number
  image?: string | null
  available: boolean
  owner?: {
    id: number
    name: string
    email: string
  } | null
}

export async function getFields(): Promise<BrowseField[]> {
  const res = await api.get("/fields")
  return res.data
}

// ========================
// CHI TIẾT SÂN (Detail)
// ========================
export interface FieldDetail {
  id: number
  name: string
  type: string
  location: string
  description?: string
  price: number
  rating: number | null
  reviewCount: number
  images: string[]
  amenities: string[]
  hours: string
  capacity?: number
  owner?: {
    id: number
    name: string
    email: string
    phone?: string
  }
  reviews: {
    id: number
    author: string
    rating: number
    text: string
  }[]
}

export async function getFieldById(id: string | number): Promise<FieldDetail> {
  const res = await api.get(`/fields/${id}`)
  return res.data
}
