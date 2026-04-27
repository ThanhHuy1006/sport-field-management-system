"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import EditFieldForm from "./edit-field-form"
import { getOwnerFieldDetail, type OwnerFieldApi } from "@/features/fields/services/owner-fields.service"

type ExistingImage = {
  id: number
  url: string
  isPrimary: boolean
}

type FieldData = {
  name: string
  type: string
  address?: string
  addressLine?: string
  ward?: string
  district?: string
  province?: string
  capacity: string
  price: string
  weekendPrice?: string
  description: string
  status: string
  amenities: string[]
  openTime: string
  closeTime: string
  approvalMode?: string | null
  existingImages: ExistingImage[]
}

function getPriceByDayType(field: OwnerFieldApi, dayType: "WEEKDAY" | "WEEKEND") {
  const rule = field.pricing_rules?.find((item) => item.day_type === dayType)

  return String(Number(rule?.price || field.base_price_per_hour || 0))
}

function getFieldImageUrl(url: string) {
  const normalizedPath = url.replaceAll("\\", "/")

  if (normalizedPath.startsWith("http")) {
    return normalizedPath
  }

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
  const backendOrigin = apiBaseUrl.replace(/\/api\/v1\/?$/, "")

  return `${backendOrigin}/${normalizedPath.replace(/^\/+/, "")}`
}

function mapFieldToFormData(field: OwnerFieldApi): FieldData {
  const activeHour = field.operating_hours?.find(
    (item) => !item.is_closed && item.open_time && item.close_time,
  )

  const amenities =
    field.amenities
      ?.map((item) => item.name)
      .filter((name): name is string => Boolean(name)) || []

  const existingImages =
    field.images?.map((image) => ({
      id: image.id,
      url: getFieldImageUrl(image.url),
      isPrimary: Boolean(image.is_primary),
    })) || []

  return {
    name: field.field_name || "",
    type: field.sport_type || "",
    address: field.address || "",
    addressLine: field.address_line || "",
    ward: field.ward || "",
    district: field.district || "",
    province: field.province || "TP. Hồ Chí Minh",
    capacity: field.max_players ? String(field.max_players) : "",
    price: getPriceByDayType(field, "WEEKDAY"),
    weekendPrice: getPriceByDayType(field, "WEEKEND"),
    description: field.description || "",
    status: field.status || "pending",
    amenities,
    openTime: activeHour?.open_time || "06:00",
    closeTime: activeHour?.close_time || "22:00",
    approvalMode: field.approval_mode || "MANUAL",
    existingImages,
  }
}

export default function EditFieldFormClient({ fieldId }: { fieldId: string }) {
  const router = useRouter()
  const { toast } = useToast()

  const [existingData, setExistingData] = useState<FieldData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchFieldDetail() {
      try {
        setIsLoading(true)

        const response = await getOwnerFieldDetail(fieldId)
        setExistingData(mapFieldToFormData(response.data))
      } catch (error) {
        toast({
          title: "Không tải được thông tin sân",
          description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
          variant: "destructive",
        })

        router.push("/owner/fields")
      } finally {
        setIsLoading(false)
      }
    }

    fetchFieldDetail()
  }, [fieldId, router, toast])

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Đang tải thông tin sân...</p>
      </main>
    )
  }

  if (!existingData) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Không tìm thấy thông tin sân.</p>
      </main>
    )
  }

  return <EditFieldForm fieldId={fieldId} existingData={existingData} />
}