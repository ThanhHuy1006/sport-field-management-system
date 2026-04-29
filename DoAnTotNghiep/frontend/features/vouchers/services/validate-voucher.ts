import { apiRequest } from "@/lib/api-client"

export type ValidateVoucherPayload = {
  code: string
  order_amount: number
  owner_id?: number | null
}

export type VoucherItem = {
  id: number
  owner_id: number | null
  created_by: number | null
  code: string
  type: "FIXED" | "PERCENT"
  discount_value: number | null
  max_discount_amount: number | null
  min_order_value: number | null
  usage_limit_total: number | null
  usage_limit_per_user: number | null
  start_date: string
  end_date: string
  status: string
  created_at: string
}

export type ValidateVoucherResponse = {
  success: boolean
  message: string
  data: {
    voucher: VoucherItem
    order_amount: number
    discount_amount: number
    final_amount: number
  }
}

export function validateVoucher(payload: ValidateVoucherPayload) {
  return apiRequest<ValidateVoucherResponse>("/vouchers/validate", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true,
  })
}