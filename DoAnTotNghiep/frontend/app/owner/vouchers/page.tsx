"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Edit, Trash2, Copy, TicketPercent, Calendar, Users } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Voucher {
  id: string
  code: string
  name: string
  type: "percentage" | "fixed" | "free_hours"
  value: number
  minAmount?: number
  maxDiscount?: number
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
  description: string
  applicableFields: string[]
}

export default function OwnerVouchersPage() {
  const { toast } = useToast()
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      id: "1",
      code: "SUMMER2024",
      name: "Khuyến mãi mùa hè",
      type: "percentage",
      value: 20,
      minAmount: 500000,
      maxDiscount: 200000,
      startDate: "2024-06-01",
      endDate: "2024-08-31",
      usageLimit: 100,
      usedCount: 45,
      isActive: true,
      description: "Giảm 20% cho đơn từ 500k, tối đa 200k",
      applicableFields: ["all"],
    },
    {
      id: "2",
      code: "NEWUSER50",
      name: "Ưu đãi khách hàng mới",
      type: "fixed",
      value: 50000,
      minAmount: 200000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      usageLimit: 500,
      usedCount: 234,
      isActive: true,
      description: "Giảm 50k cho khách hàng mới",
      applicableFields: ["all"],
    },
    {
      id: "3",
      code: "FREEHOUR",
      name: "Tặng 1 giờ miễn phí",
      type: "free_hours",
      value: 1,
      minAmount: 1000000,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      usageLimit: 50,
      usedCount: 12,
      isActive: true,
      description: "Tặng 1 giờ miễn phí cho đơn từ 1 triệu",
      applicableFields: ["field1", "field2"],
    },
  ])

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed" | "free_hours",
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    startDate: "",
    endDate: "",
    usageLimit: 100,
    description: "",
  })

  const [editFormData, setEditFormData] = useState({
    code: "",
    name: "",
    type: "percentage" as "percentage" | "fixed" | "free_hours",
    value: 0,
    minAmount: 0,
    maxDiscount: 0,
    startDate: "",
    endDate: "",
    usageLimit: 100,
    description: "",
  })

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Đã sao chép",
      description: `Mã ${code} đã được sao chép vào clipboard`,
    })
  }

  const handleToggleActive = (id: string) => {
    setVouchers((prev) => prev.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v)))
    toast({
      title: "Đã cập nhật",
      description: "Trạng thái voucher đã được thay đổi",
    })
  }

  const handleDelete = () => {
    if (selectedVoucher) {
      setVouchers((prev) => prev.filter((v) => v.id !== selectedVoucher.id))
      toast({
        title: "Đã xóa",
        description: "Voucher đã được xóa thành công",
      })
    }
    setIsDeleteDialogOpen(false)
    setSelectedVoucher(null)
  }

  const handleCreate = () => {
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      ...formData,
      usedCount: 0,
      isActive: true,
      applicableFields: ["all"],
    }
    setVouchers((prev) => [...prev, newVoucher])
    toast({
      title: "Đã tạo",
      description: "Voucher mới đã được tạo thành công",
    })
    setIsCreateDialogOpen(false)
    setFormData({
      code: "",
      name: "",
      type: "percentage",
      value: 0,
      minAmount: 0,
      maxDiscount: 0,
      startDate: "",
      endDate: "",
      usageLimit: 100,
      description: "",
    })
  }

  const handleOpenEditDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setEditFormData({
      code: voucher.code,
      name: voucher.name,
      type: voucher.type,
      value: voucher.value,
      minAmount: voucher.minAmount || 0,
      maxDiscount: voucher.maxDiscount || 0,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      usageLimit: voucher.usageLimit,
      description: voucher.description,
    })
    setIsEditDialogOpen(true)
  }

  const handleSaveEdit = () => {
    if (selectedVoucher) {
      setVouchers((prev) =>
        prev.map((v) =>
          v.id === selectedVoucher.id
            ? {
                ...v,
                ...editFormData,
              }
            : v,
        ),
      )
      toast({
        title: "Đã cập nhật",
        description: "Voucher đã được cập nhật thành công",
      })
    }
    setIsEditDialogOpen(false)
    setSelectedVoucher(null)
  }

  const filteredVouchers = vouchers.filter((v) => {
    const matchesSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) || v.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && v.isActive) ||
      (filterStatus === "inactive" && !v.isActive)
    return matchesSearch && matchesStatus
  })

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "percentage":
        return "Giảm %"
      case "fixed":
        return "Giảm tiền"
      case "free_hours":
        return "Tặng giờ"
      default:
        return type
    }
  }

  const getValueDisplay = (voucher: Voucher) => {
    switch (voucher.type) {
      case "percentage":
        return `${voucher.value}%`
      case "fixed":
        return `${voucher.value.toLocaleString()}đ`
      case "free_hours":
        return `${voucher.value} giờ`
      default:
        return voucher.value
    }
  }

  const isExpired = (endDate: string) => new Date(endDate) < new Date()

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Link href="/" className="hover:text-primary">
                Trang chủ
              </Link>
              <span>/</span>
              <Link href="/owner/dashboard" className="hover:text-primary">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-foreground">Quản lý Voucher</span>
            </div>
            <h1 className="text-2xl font-bold">Quản Lý Voucher</h1>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Voucher
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-950 rounded-lg">
                <TicketPercent className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng Voucher</p>
                <p className="text-2xl font-bold">{vouchers.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-lg">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang Hoạt Động</p>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => v.isActive && !isExpired(v.endDate)).length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-950 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lượt Sử Dụng</p>
                <p className="text-2xl font-bold">{vouchers.reduce((sum, v) => sum + v.usedCount, 0)}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
                <Calendar className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hết Hạn</p>
                <p className="text-2xl font-bold">{vouchers.filter((v) => isExpired(v.endDate)).length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm kiếm theo mã hoặc tên voucher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="inactive">Đã tắt</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Vouchers List */}
        <div className="space-y-4">
          {filteredVouchers.map((voucher) => (
            <Card key={voucher.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-lg font-bold">{voucher.name}</h3>
                    <Badge variant={voucher.isActive ? "default" : "secondary"}>
                      {voucher.isActive ? "Đang hoạt động" : "Đã tắt"}
                    </Badge>
                    {isExpired(voucher.endDate) && <Badge variant="destructive">Hết hạn</Badge>}
                    <Badge variant="outline">{getTypeLabel(voucher.type)}</Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <code className="px-3 py-1 bg-muted rounded font-mono text-sm">{voucher.code}</code>
                    <Button variant="ghost" size="sm" onClick={() => handleCopyCode(voucher.code)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3">{voucher.description}</p>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Giá trị</p>
                      <p className="font-semibold text-green-600">{getValueDisplay(voucher)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Thời gian</p>
                      <p className="font-medium">
                        {voucher.startDate} - {voucher.endDate}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Lượt sử dụng</p>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </p>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden max-w-[100px]">
                          <div
                            className="h-full bg-green-600 rounded-full"
                            style={{ width: `${(voucher.usedCount / voucher.usageLimit) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Đơn tối thiểu</p>
                      <p className="font-medium">{voucher.minAmount?.toLocaleString()}đ</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Switch checked={voucher.isActive} onCheckedChange={() => handleToggleActive(voucher.id)} />
                  <Button variant="outline" size="icon" onClick={() => handleOpenEditDialog(voucher)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:text-destructive bg-transparent"
                    onClick={() => {
                      setSelectedVoucher(voucher)
                      setIsDeleteDialogOpen(true)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {filteredVouchers.length === 0 && (
            <Card className="p-12 text-center">
              <TicketPercent className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Chưa có voucher nào</p>
              <Button className="mt-4" onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Voucher đầu tiên
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tạo Voucher mới</DialogTitle>
            <DialogDescription>Nhập thông tin voucher khuyến mãi</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mã voucher</Label>
                <Input
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: SUMMER2024"
                />
              </div>
              <div>
                <Label>Loại</Label>
                <Select
                  value={formData.type}
                  onValueChange={(v: "percentage" | "fixed" | "free_hours") => setFormData({ ...formData, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Giảm %</SelectItem>
                    <SelectItem value="fixed">Giảm tiền</SelectItem>
                    <SelectItem value="free_hours">Tặng giờ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tên voucher</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Khuyến mãi mùa hè"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giá trị</Label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Giới hạn sử dụng</Label>
              <Input
                type="number"
                value={formData.usageLimit}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Mô tả chi tiết voucher..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreate}>Tạo Voucher</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Chỉnh sửa Voucher</DialogTitle>
            <DialogDescription>Cập nhật thông tin voucher khuyến mãi</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Mã voucher</Label>
                <Input
                  value={editFormData.code}
                  onChange={(e) => setEditFormData({ ...editFormData, code: e.target.value.toUpperCase() })}
                  placeholder="VD: SUMMER2024"
                />
              </div>
              <div>
                <Label>Loại</Label>
                <Select
                  value={editFormData.type}
                  onValueChange={(v: "percentage" | "fixed" | "free_hours") =>
                    setEditFormData({ ...editFormData, type: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Giảm %</SelectItem>
                    <SelectItem value="fixed">Giảm tiền</SelectItem>
                    <SelectItem value="free_hours">Tặng giờ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Tên voucher</Label>
              <Input
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                placeholder="VD: Khuyến mãi mùa hè"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Giá trị</Label>
                <Input
                  type="number"
                  value={editFormData.value}
                  onChange={(e) => setEditFormData({ ...editFormData, value: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label>Đơn tối thiểu</Label>
                <Input
                  type="number"
                  value={editFormData.minAmount}
                  onChange={(e) => setEditFormData({ ...editFormData, minAmount: Number(e.target.value) })}
                />
              </div>
            </div>

            {editFormData.type === "percentage" && (
              <div>
                <Label>Giảm tối đa</Label>
                <Input
                  type="number"
                  value={editFormData.maxDiscount}
                  onChange={(e) => setEditFormData({ ...editFormData, maxDiscount: Number(e.target.value) })}
                  placeholder="VD: 200000"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ngày bắt đầu</Label>
                <Input
                  type="date"
                  value={editFormData.startDate}
                  onChange={(e) => setEditFormData({ ...editFormData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>Ngày kết thúc</Label>
                <Input
                  type="date"
                  value={editFormData.endDate}
                  onChange={(e) => setEditFormData({ ...editFormData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label>Giới hạn sử dụng</Label>
              <Input
                type="number"
                value={editFormData.usageLimit}
                onChange={(e) => setEditFormData({ ...editFormData, usageLimit: Number(e.target.value) })}
              />
            </div>

            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                placeholder="Mô tả chi tiết voucher..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSaveEdit}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn xóa voucher "{selectedVoucher?.name}"? Hành động này không thể hoàn tác.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
