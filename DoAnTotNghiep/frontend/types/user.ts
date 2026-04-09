export interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  role: "user" | "owner" | "admin"
  createdAt: string
}

export interface Review {
  id: number
  userId: number
  userName: string
  fieldId: number
  rating: number
  comment: string
  date: string
}
