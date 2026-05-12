import { apiGet, apiRequest } from "@/lib/api-client"

export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface OwnerProfileData {
  id: number
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  role: string
  status: string
  created_at?: string
  updated_at?: string
  owner_profile: {
    user_id: number
    business_name: string | null
    tax_code: string | null
    address: string | null
    license_url: string | null
    id_front_url: string | null
    id_back_url: string | null
    status: string | null
    approved_by: number | null
    approved_at: string | null
    reject_reason: string | null
    created_at: string | null
  } | null
}

export interface UpdateOwnerProfilePayload {
  name?: string
  phone?: string
  avatar_url?: string
}

export interface UploadedFile {
  url: string
  storage_path: string
  original_name: string
  mime_type: string
  size_bytes: number
}

export function getMyOwnerProfile() {
  return apiGet<ApiResponse<OwnerProfileData>>("/owner/profile/me")
}

export function updateMyOwnerProfile(payload: UpdateOwnerProfilePayload) {
  return apiRequest<ApiResponse<OwnerProfileData>>("/owner/profile/me", {
    method: "PUT",
    body: JSON.stringify(payload),
  })
}

export function uploadOwnerAvatar(file: File) {
  const formData = new FormData()
  formData.append("avatar", file)

  return apiRequest<ApiResponse<UploadedFile>>("/uploads/avatar", {
    method: "POST",
    body: formData,
  })
}