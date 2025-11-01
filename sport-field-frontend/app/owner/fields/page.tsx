"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Plus, Edit, Trash2, ArrowLeft, MapPin, Users } from "lucide-react"

const mockFields = [
  {
    id: 1,
    name: "Sân Bóng Đá Green Valley",
    type: "Bóng Đá",
    location: "Quận 1, TP.HCM",
    capacity: 22,
    price: 500000,
    status: "active",
    image: "/soccer-field.png",
  },
  {
    id: 2,
    name: "Sân Bóng Rổ Arena",
    type: "Bóng Rổ",
    location: "Quận 7, TP.HCM",
    capacity: 10,
    price: 400000,
    status: "active",
    image: "/outdoor-basketball-court.png",
  },
  {
    id: 3,
    name: "Sân Tennis Elite",
    type: "Tennis",
    location: "Quận 2, TP.HCM",
    capacity: 4,
    price: 350000,
    status: "inactive",
    image: "/outdoor-tennis-court.png",
  },
]

export default function OwnerFieldsPage() {
  const [fields, setFields] = useState(mockFields)

  const handleDelete = (id: number) => {
    setFields(fields.filter((f) => f.id !== id))
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Quản Lý Sân</h1>
          <Link href="/owner/fields/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Thêm Sân
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="space-y-4">
          {fields.map((field) => (
            <Card key={field.id} className="overflow-hidden">
              <div className="flex flex-col md:flex-row">
                <img
                  src={field.image || "/placeholder.svg"}
                  alt={field.name}
                  className="w-full md:w-48 h-48 object-cover"
                />
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-foreground mb-1">{field.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4" />
                          {field.location}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          field.status === "active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {field.status === "active" ? "Hoạt Động" : "Không Hoạt Động"}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Loại</p>
                        <p className="font-medium text-foreground">{field.type}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sức Chứa</p>
                        <p className="font-medium text-foreground flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {field.capacity} người
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Giá</p>
                        <p className="font-medium text-foreground">{field.price.toLocaleString()} VND/giờ</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t border-border">
                    <Link href={`/owner/fields/${field.id}/edit`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Sửa
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive bg-transparent"
                      onClick={() => handleDelete(field.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {fields.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg mb-4">Chưa có sân nào</p>
            <Link href="/owner/fields/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân Đầu Tiên
              </Button>
            </Link>
          </Card>
        )}
      </div>
    </main>
  )
}
