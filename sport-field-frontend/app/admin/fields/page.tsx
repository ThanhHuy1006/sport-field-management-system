"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, X, Eye } from "lucide-react"
import { getPendingFields, updateFieldStatus } from "@/lib/fetchers"

interface AdminField {
  id: number
  name: string
  location: string
  type: string
  status: string
  owner?: { name?: string; email?: string }
}

export default function AdminFieldsPage() {
  const [fields, setFields] = useState<AdminField[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("pending")

  // ✅ Load danh sách sân chờ duyệt từ backend
  useEffect(() => {
    getPendingFields()
      .then(setFields)
      .catch((err) => console.error("❌ Lỗi tải danh sách sân:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleApprove = async (id: number) => {
    try {
      await updateFieldStatus(id, "active")
      setFields((prev) => prev.filter((f) => f.id !== id))
      alert("✅ Đã duyệt sân thành công!")
    } catch (err) {
      console.error(err)
      alert("❌ Lỗi khi duyệt sân!")
    }
  }

  const handleReject = async (id: number) => {
    try {
      await updateFieldStatus(id, "hidden")
      setFields((prev) => prev.filter((f) => f.id !== id))
      alert("⚠️ Đã từ chối sân!")
    } catch (err) {
      console.error(err)
      alert("❌ Lỗi khi từ chối sân!")
    }
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Duyệt Sân (Admin)</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-lg font-semibold mb-6">
          {filterStatus === "pending" ? "Danh sách sân chờ duyệt" : "Tất cả sân"}
        </h2>

        {loading ? (
          <p className="text-center text-muted-foreground">Đang tải dữ liệu...</p>
        ) : fields.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Không có sân nào chờ duyệt</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {fields.map((field) => (
              <Card key={field.id} className="p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{field.name}</h3>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-700">
                        Chờ duyệt
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Chủ sân</p>
                        <p className="font-medium">{field.owner?.name || "Không rõ"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Email</p>
                        <p className="font-medium">{field.owner?.email || "-"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Địa chỉ</p>
                        <p className="font-medium">{field.location}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleApprove(field.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive bg-transparent"
                      onClick={() => handleReject(field.id)}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
