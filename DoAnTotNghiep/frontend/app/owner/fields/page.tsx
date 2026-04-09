"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2, MapPin, Users, Search, Filter, Clock, DollarSign } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Pagination } from "@/components/pagination"

const mockFields = [
  {
    id: 1,
    name: "Sân Bóng Đá Green Valley",
    type: "Bóng Đá",
    location: "Quận 1, TP.HCM",
    capacity: 22,
    price: 500000,
    weekendPrice: 600000,
    openTime: "06:00",
    closeTime: "22:00",
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
    weekendPrice: 500000,
    openTime: "07:00",
    closeTime: "21:00",
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
    weekendPrice: 450000,
    openTime: "06:00",
    closeTime: "22:00",
    status: "inactive",
    image: "/outdoor-tennis-court.png",
  },
]

export default function OwnerFieldsPage() {
  const [fields, setFields] = useState(mockFields)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [deleteDialog, setDeleteDialog] = useState<number | null>(null)
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 6

  const filteredFields = fields.filter((field) => {
    const matchesSearch = field.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || field.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredFields.length / itemsPerPage)
  const paginatedFields = filteredFields.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleDelete = (id: number) => {
    setFields(fields.filter((f) => f.id !== id))
    setDeleteDialog(null)
    toast({
      title: "Đã xóa sân",
      description: "Sân đã được xóa khỏi danh sách.",
    })
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm mb-3">
            <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/owner/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              Dashboard
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">Quản lý sân</span>
          </div>
          <h1 className="text-xl font-bold">Quản Lý Sân</h1>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-4 mb-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sân..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="active">Hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
            <Link href="/owner/fields/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Thêm Sân
              </Button>
            </Link>
          </div>
        </Card>

        <div className="text-sm text-muted-foreground mb-4">
          Hiển thị {filteredFields.length} / {fields.length} sân
        </div>

        <div className="space-y-4 mb-8">
          {paginatedFields.map((field) => (
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

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
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
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Giá T2-T6
                        </p>
                        <p className="font-medium text-primary">{field.price.toLocaleString()} VND/h</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          Giá T7-CN
                        </p>
                        <p className="font-medium text-primary">{field.weekendPrice.toLocaleString()} VND/h</p>
                      </div>
                    </div>

                    {/* Giờ hoạt động */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Clock className="w-4 h-4" />
                      <span>
                        Giờ hoạt động: {field.openTime} - {field.closeTime}
                      </span>
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
                      onClick={() => setDeleteDialog(field.id)}
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

        {filteredFields.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredFields.length}
          />
        )}
      </div>

      <Dialog open={deleteDialog !== null} onOpenChange={() => setDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa sân</DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa sân này? Hành động này không thể hoàn tác.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog(null)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={() => deleteDialog && handleDelete(deleteDialog)}>
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
