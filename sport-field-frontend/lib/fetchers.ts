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
  address?: string
  location: string
  description?: string
  price: number
  rating: number | null
  reviewCount: number
  images: string[]
  amenities: string[]
  hours: string
  capacity?: number
  status?: string
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
// ========================
// OWNER — Quản lý sân của tôi
// ========================
export interface OwnerField {
  id: number
  field_name: string
  sport_type: string
  address: string
  base_price_per_hour: number
  status: string
  created_at: string
  max_players?: number | null
  image?: string | null
}

export async function getMyFields(): Promise<OwnerField[]> {
  const res = await api.get("/fields/my") // ✅ Gọi API của Owner
  return res.data
}

export async function createField(data: {
  name: string
  type: string
  location: string
  price_per_hour: number
  description: string
}): Promise<any> {
  const res = await api.post("/fields", data)
  return res.data
}

export async function deleteField(id: number): Promise<any> {
  const res = await api.delete(`/fields/${id}`)
  return res.data
}
export async function updateField(id: string | number, payload: any) {
  const res = await api.put(`/fields/${id}`, payload)
  return res.data
}