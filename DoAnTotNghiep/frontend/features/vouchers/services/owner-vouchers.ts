import { apiRequest } from "@/lib/api-client";

export type OwnerVoucherType = "PERCENT" | "FIXED";
export type OwnerVoucherStatus = "active" | "inactive" | "expired";

export type OwnerVoucherItem = {
  id: number;
  owner_id: number | null;
  created_by: number | null;
  code: string;
  type: OwnerVoucherType;
  discount_value: number | null;
  max_discount_amount: number | null;
  min_order_value: number | null;
  usage_limit_total: number | null;
  usage_limit_per_user: number | null;
  start_date: string;
  end_date: string;
  status: OwnerVoucherStatus | string;
  created_at: string;
};

export type OwnerVoucherListResponse = {
  success: boolean;
  message: string;
  data: OwnerVoucherItem[];
};

export type OwnerVoucherDetailResponse = {
  success: boolean;
  message: string;
  data: OwnerVoucherItem;
};

export type CreateOwnerVoucherPayload = {
  code: string;
  type: OwnerVoucherType;
  discount_value: number;
  max_discount_amount?: number | null;
  min_order_value?: number;
  usage_limit_total?: number;
  usage_limit_per_user?: number;
  start_date: string;
  end_date: string;
};

export type UpdateOwnerVoucherPayload = Partial<
  Omit<CreateOwnerVoucherPayload, "code" | "type">
>;

export function getOwnerVouchers() {
  return apiRequest<OwnerVoucherListResponse>("/owner/vouchers", {
    method: "GET",
    requireAuth: true,
  });
}

export function createOwnerVoucher(payload: CreateOwnerVoucherPayload) {
  return apiRequest<OwnerVoucherDetailResponse>("/owner/vouchers", {
    method: "POST",
    body: JSON.stringify(payload),
    requireAuth: true,
  });
}

export function updateOwnerVoucher(
  voucherId: number,
  payload: UpdateOwnerVoucherPayload
) {
  return apiRequest<OwnerVoucherDetailResponse>(`/owner/vouchers/${voucherId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
    requireAuth: true,
  });
}

export function updateOwnerVoucherStatus(
  voucherId: number,
  status: OwnerVoucherStatus
) {
  return apiRequest<OwnerVoucherDetailResponse>(
    `/owner/vouchers/${voucherId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
      requireAuth: true,
    }
  );
}