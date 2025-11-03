"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import EditFieldForm from "./edit-field-form"
import { getFieldById } from "@/lib/fetchers"

export default function EditFieldPage() {
  const { id } = useParams()
  const [fieldData, setFieldData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    getFieldById(Number(id))
      .then((data) => {
        console.log("📦 Dữ liệu sân nhận được:", data)
        setFieldData({
          name: data.name || "",
          type: data.type || "",
          location: data.location || "",
          address: data.address || data.location || "",
          capacity: data.capacity ? String(data.capacity) : "",
          price: data.price ? String(data.price) : "",
          description: data.description || "",
          status: data.status || "active",
          amenities: data.amenities || [],
          openTime: "06:00",
          closeTime: "22:00",
        })
      })
      .catch((err) => console.error("❌ Lỗi tải dữ liệu sân:", err))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <p className="text-center mt-20">⏳ Đang tải dữ liệu sân...</p>
  if (!fieldData) return <p className="text-center mt-20 text-red-500">Không tìm thấy sân!</p>
  return <EditFieldForm fieldId={String(id)} existingData={fieldData} />
}
