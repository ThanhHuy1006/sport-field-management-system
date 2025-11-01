// sports-field-frontend/lib/fetchers.ts
import api from "./api"

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

// ✅ Lấy danh sách sân (public)
export async function getFields(): Promise<BrowseField[]> {
  const res = await api.get("/fields")
  return res.data
}

// ✅ Lấy chi tiết sân theo ID
export async function getFieldById(id: number): Promise<BrowseField> {
  const res = await api.get(`/fields/${id}`)
  return res.data
}
