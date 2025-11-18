"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import EditFieldForm from "./edit-field-form"

export default function EditFieldPage() {
  const params = useParams()
  const id = params.id as string

  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")

    async function load() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/owner/fields/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const json = await res.json()
        const raw = json.data

        // 🟢 MAP dữ liệu backend -> frontend
        const mapped = {
          name: raw.field_name,
          type: raw.sport_type,
          location: "", // backend chưa có -> để trống
          address: raw.address,
          capacity: raw.max_players?.toString() ?? "0",
          price: raw.base_price_per_hour?.toString() ?? "0",
          description: raw.description ?? "",
          status: raw.status,

          amenities: raw.field_facilities?.map((f: any) => f.facility_name) ?? [],

          openTime:
            raw.operating_hours && raw.operating_hours.length > 0
              ? raw.operating_hours[0].open_time
              : "06:00",

          closeTime:
            raw.operating_hours && raw.operating_hours.length > 0
              ? raw.operating_hours[0].close_time
              : "22:00",
        }

        setData(mapped)
      } catch (err) {
        console.error(err)
      }

      setLoading(false)
    }

    load()
  }, [id])

  if (loading) return <p className="p-6">Đang tải dữ liệu...</p>
  if (!data) return <p className="p-6 text-red-500">Không thể tải dữ liệu sân.</p>

  return <EditFieldForm fieldId={id} existingData={data} />
}
