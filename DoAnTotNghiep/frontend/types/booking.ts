export interface Booking {
  id: number
  fieldId: number
  fieldName: string
  date: string
  startTime: string
  endTime: string
  status: "pending" | "confirmed" | "cancelled" | "completed"
  totalPrice: number
  userId: number
  createdAt: string
  
}

export interface TimeSlot {
  time: string
  available: boolean
  price?: number
}
