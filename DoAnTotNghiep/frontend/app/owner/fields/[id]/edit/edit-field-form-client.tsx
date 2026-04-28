"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { getOwnerFieldDetail, type OwnerFieldApi } from "@/features/fields/services/owner-fields.service"
import EditFieldForm, { type FieldData } from "./edit-field-form"

const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1"
).replace(/\/api\/v1\/?$/, "")

function toAssetUrl(url?: string | null) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  if (url.startsWith("/uploads")) return `${API_ORIGIN}${url}`
  return url
}

function mapSportType(type?: string | null) {
  const value = String(type || "").trim().toLowerCase()

  if (value === "football" || value === "soccer" || value === "bóng đá") return "soccer"
  if (value === "basketball" || value === "bóng rổ") return "basketball"
  if (value === "tennis") return "tennis"
  if (value === "badminton" || value === "cầu lông") return "badminton"
  if (value === "volleyball" || value === "bóng chuyền") return "volleyball"
  if (value === "pickleball") return "pickleball"

  return type || ""
}

function mapFieldToFormData(field: OwnerFieldApi): FieldData {
  const weekdayRule = field.pricing_rules?.find((item) => item.day_type === "WEEKDAY")
  const weekendRule = field.pricing_rules?.find((item) => item.day_type === "WEEKEND")
  const activeHour = field.operating_hours?.find((item) => item.open_time && item.close_time)

  return {
    name: field.field_name || "",
    type: mapSportType(field.sport_type),

    address: field.address || "",
    addressLine: field.address_line || field.address || "",
    ward: field.ward || "",
    district: field.district || "",
    province: field.province || "TP. Hồ Chí Minh",

    capacity: field.max_players ? String(field.max_players) : "",
    price: String(weekdayRule?.price ?? field.base_price_per_hour ?? 0),
    weekendPrice: String(weekendRule?.price ?? field.base_price_per_hour ?? 0),
    description: field.description || "",
    status: field.status || "pending",
    amenities: field.amenities?.map((item) => item.name || "").filter(Boolean) || [],

    openTime: activeHour?.open_time || "06:00",
    closeTime: activeHour?.close_time || "22:00",
    approvalMode: field.approval_mode || "MANUAL",

    existingImages:
      field.images?.map((image) => ({
        id: image.id,
        url: toAssetUrl(image.url),
        isPrimary: Boolean(image.is_primary),
      })) || [],
  }
}

export default function EditFieldFormClient({ fieldId }: { fieldId: string }) {
  const [data, setData] = useState<FieldData | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    let mounted = true

    async function fetchField() {
      try {
        setLoading(true)
        setErrorMessage("")

        const res = await getOwnerFieldDetail(fieldId)

        if (!mounted) return

        setData(mapFieldToFormData(res.data))
      } catch (error) {
        if (!mounted) return

        setErrorMessage(error instanceof Error ? error.message : "Không thể tải thông tin sân")
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchField()

    return () => {
      mounted = false
    }
  }, [fieldId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <Card className="mx-auto max-w-4xl p-8 text-center text-muted-foreground">
          Đang tải thông tin sân...
        </Card>
      </main>
    )
  }

  if (errorMessage || !data) {
    return (
      <main className="min-h-screen bg-background p-6">
        <Card className="mx-auto max-w-4xl p-8 text-center">
          <p className="font-medium text-destructive">Không thể tải thông tin sân</p>
          <p className="mt-2 text-sm text-muted-foreground">{errorMessage}</p>
        </Card>
      </main>
    )
  }

  return <EditFieldForm fieldId={fieldId} existingData={data} />
}