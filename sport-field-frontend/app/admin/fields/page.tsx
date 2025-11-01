"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Check, X, Eye } from "lucide-react"

const mockFields = [
  {
    id: 1,
    name: "Sân Bóng Đá Green Valley",
    owner: "Trần Thị B",
    location: "Quận 1, TP.HCM",
    type: "Bóng Đá",
    status: "approved",
    createdDate: "2024-06-15",
  },
  {
    id: 2,
    name: "Sân Bóng Rổ Arena",
    owner: "Trần Thị B",
    location: "Quận 7, TP.HCM",
    type: "Bóng Rổ",
    status: "approved",
    createdDate: "2024-06-20",
  },
  {
    id: 3,
    name: "Sân Tennis Mới",
    owner: "Lê Văn C",
    location: "Quận 2, TP.HCM",
    type: "Tennis",
    status: "pending",
    createdDate: "2024-01-15",
  },
  {
    id: 4,
    name: "Sân Bóng Chuyền",
    owner: "Phạm Thị D",
    location: "Quận 4, TP.HCM",
    type: "Bóng Chuyền",
    status: "rejected",
    createdDate: "2024-01-10",
  },
]

export default function AdminFieldsPage() {
  const [fields, setFields] = useState(mockFields)
  const [filterStatus, setFilterStatus] = useState("all")

  const filteredFields = fields.filter((f) => filterStatus === "all" || f.status === filterStatus)

  const handleApprove = (id: number) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, status: "approved" } : f)))
  }

  const handleReject = (id: number) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, status: "rejected" } : f)))
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
          <h1 className="text-xl font-bold">Quản Lý Sân</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { value: "all", label: "Tất Cả" },
            { value: "pending", label: "Chờ Duyệt" },
            { value: "approved", label: "Đã Duyệt" },
            { value: "rejected", label: "Từ Chối" },
          ].map((status) => (
            <button
              key={status.value}
              onClick={() => setFilterStatus(status.value)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filterStatus === status.value ? "bg-primary text-white" : "bg-muted text-foreground hover:bg-muted/80"
              }`}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Fields List */}
        <div className="space-y-4">
          {filteredFields.map((field) => (
            <Card key={field.id} className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-bold text-foreground">{field.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        field.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : field.status === "approved"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {field.status === "pending" ? "Chờ Duyệt" : field.status === "approved" ? "Đã Duyệt" : "Từ Chối"}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Chủ Sân</p>
                      <p className="font-medium text-foreground">{field.owner}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Loại</p>
                      <p className="font-medium text-foreground">{field.type}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vị Trí</p>
                      <p className="font-medium text-foreground">{field.location}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Ngày Tạo</p>
                      <p className="font-medium text-foreground">{field.createdDate}</p>
                    </div>
                  </div>
                </div>

                {field.status === "pending" && (
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
                      Từ Chối
                    </Button>
                  </div>
                )}

                {field.status !== "pending" && (
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Xem
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>

        {filteredFields.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Không tìm thấy sân</p>
          </Card>
        )}
      </div>
    </main>
  )
}
