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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, Edit, Trash2, Copy, TicketPercent, Calendar, Users } from 'lucide-react'
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
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "expired">("all")
  const [searchQuery, setSearchQuery] = useState("")

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
    isActive: true,
    description: "",
    applicableFields: ["all"],
  })

  const handleCreate = () => {
    const newVoucher: Voucher = {
      id: Date.now().toString(),
      ...formData,
      usedCount: 0,
    }
    setVouchers([newVoucher, ...vouchers])
    setIsCreateDialogOpen(false)
    resetForm()
    toast({
      title: "Tạo voucher thành công",
      description: `Mã voucher ${formData.code} đã được tạo`,
    })
  }

  const handleEdit = () => {
    if (!selectedVoucher) return
    setVouchers(
      vouchers.map((v) =>
        v.id === selectedVoucher.id
          ? { ...v, ...formData }
          : v
      )
    )
    setIsEditDialogOpen(false)
    setSelectedVoucher(null)
    resetForm()
    toast({
      title: "Cập nhật thành công",
      description: "Thông tin voucher đã được cập nhật",
    })
  }

  const handleDelete = () => {
    if (!selectedVoucher) return
    setVouchers(vouchers.filter((v) => v.id !== selectedVoucher.id))
    setIsDeleteDialogOpen(false)
    setSelectedVoucher(null)
    toast({
      title: "Xóa thành công",
      description: "Voucher đã được xóa",
    })
  }

  const handleToggleActive = (id: string) => {
    setVouchers(
      vouchers.map((v) =>
        v.id === id ? { ...v, isActive: !v.isActive } : v
      )
    )
    toast({
      title: "Cập nhật trạng thái",
      description: "Trạng thái voucher đã được thay đổi",
    })
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "Đã sao chép",
      description: `Mã voucher ${code} đã được sao chép`,
    })
  }

  const openEditDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setFormData({
      code: voucher.code,
      name: voucher.name,
      type: voucher.type,
      value: voucher.value,
      minAmount: voucher.minAmount || 0,
      maxDiscount: voucher.maxDiscount || 0,
      startDate: voucher.startDate,
      endDate: voucher.endDate,
      usageLimit: voucher.usageLimit,
      isActive: voucher.isActive,
      description: voucher.description,
      applicableFields: voucher.applicableFields,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (voucher: Voucher) => {
    setSelectedVoucher(voucher)
    setIsDeleteDialogOpen(true)
  }

  const resetForm = () => {
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
      isActive: true,
      description: "",
      applicableFields: ["all"],
    })
  }

  const getVoucherTypeLabel = (type: string) => {
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

  const getVoucherValueDisplay = (voucher: Voucher) => {
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

  const isExpired = (endDate: string) => {
    return new Date(endDate) < new Date()
  }

  const filteredVouchers = vouchers.filter((voucher) => {
    const matchesSearch =
      voucher.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && voucher.isActive && !isExpired(voucher.endDate)) ||
      (filterStatus === "expired" && isExpired(voucher.endDate))

    return matchesSearch && matchesStatus
  })

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/dashboard" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Quản Lý Voucher</h1>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Tạo Voucher
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <TicketPercent className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tổng Voucher</p>
                <p className="text-2xl font-bold">{vouchers.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Đang Hoạt Động</p>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => v.isActive && !isExpired(v.endDate)).length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lượt Sử Dụng</p>
                <p className="text-2xl font-bold">
                  {vouchers.reduce((sum, v) => sum + v.usedCount, 0)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-500/10 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Hết Hạn</p>
                <p className="text-2xl font-bold">
                  {vouchers.filter((v) => isExpired(v.endDate)).length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Tìm kiếm theo mã hoặc tên voucher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="expired">Hết hạn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Voucher List */}
        <div className="space-y-4">
          {filteredVouchers.length === 0 ? (
            <Card className="p-12 text-center">
              <TicketPercent className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Chưa có voucher nào</h3>
              <p className="text-muted-foreground mb-4">Tạo voucher đầu tiên để tăng doanh số</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo Voucher Ngay
              </Button>
            </Card>
          ) : (
            filteredVouchers.map((voucher) => (
              <Card key={voucher.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">{voucher.name}</h3>
                      <Badge variant={voucher.isActive ? "default" : "secondary"}>
                        {voucher.isActive ? "Đang hoạt động" : "Tạm dừng"}
                      </Badge>
                      {isExpired(voucher.endDate) && (
                        <Badge variant="destructive">Hết hạn</Badge>
                      )}
                      <Badge variant="outline">{getVoucherTypeLabel(voucher.type)}</Badge>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                      <code className="px-3 py-1 bg-muted rounded text-lg font-mono font-bold">
                        {voucher.code}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopyCode(voucher.code)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>

                    <p className="text-muted-foreground mb-4">{voucher.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Giá trị</p>
                        <p className="font-semibold text-lg text-primary">
                          {getVoucherValueDisplay(voucher)}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Thời gian</p>
                        <p className="font-medium">
                          {new Date(voucher.startDate).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(voucher.endDate).toLocaleDateString("vi-VN")}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lượt sử dụng</p>
                        <p className="font-medium">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </p>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(voucher.usedCount / voucher.usageLimit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Đơn tối thiểu</p>
                        <p className="font-medium">
                          {voucher.minAmount ? `${voucher.minAmount.toLocaleString()}đ` : "Không"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Switch
                      checked={voucher.isActive}
                      onCheckedChange={() => handleToggleActive(voucher.id)}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditDialog(voucher)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openDeleteDialog(voucher)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false)
          setIsEditDialogOpen(false)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isCreateDialogOpen ? "Tạo Voucher Mới" : "Chỉnh Sửa Voucher"}</DialogTitle>
            <DialogDescription>
              Điền thông tin voucher để tạo mã giảm giá cho khách hàng
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="code">Mã Voucher *</Label>
                <Input
                  id="code"
                  placeholder="VD: SUMMER2024"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                />
              </div>
              <div>
                <Label htmlFor="name">Tên Voucher *</Label>
                <Input
                  id="name"
                  placeholder="VD: Khuyến mãi mùa hè"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả chi tiết về voucher..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Loại Voucher *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: any) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Giảm theo % (Percentage)</SelectItem>
                    <SelectItem value="fixed">Giảm số tiền cố định</SelectItem>
                    <SelectItem value="free_hours">Tặng giờ miễn phí</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="value">
                  Giá Trị *{" "}
                  {formData.type === "percentage"
                    ? "(%)"
                    : formData.type === "fixed"
                      ? "(VND)"
                      : "(Giờ)"}
                </Label>
                <Input
                  id="value"
                  type="number"
                  placeholder={formData.type === "percentage" ? "20" : "50000"}
                  value={formData.value || ""}
                  onChange={(e) => setFormData({ ...formData, value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="minAmount">Đơn Tối Thiểu (VND)</Label>
                <Input
                  id="minAmount"
                  type="number"
                  placeholder="500000"
                  value={formData.minAmount || ""}
                  onChange={(e) => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                />
              </div>
              {formData.type === "percentage" && (
                <div>
                  <Label htmlFor="maxDiscount">Giảm Tối Đa (VND)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    placeholder="200000"
                    value={formData.maxDiscount || ""}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: Number(e.target.value) })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Ngày Bắt Đầu *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Ngày Kết Thúc *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="usageLimit">Giới Hạn Sử Dụng *</Label>
              <Input
                id="usageLimit"
                type="number"
                placeholder="100"
                value={formData.usageLimit || ""}
                onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>Kích hoạt voucher ngay</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateDialogOpen(false)
                setIsEditDialogOpen(false)
                resetForm()
              }}
            >
              Hủy
            </Button>
            <Button onClick={isCreateDialogOpen ? handleCreate : handleEdit}>
              {isCreateDialogOpen ? "Tạo Voucher" : "Cập Nhật"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận xóa voucher</DialogTitle>
            <DialogDescription>
              Bạn có chắc muốn xóa voucher "{selectedVoucher?.name}"? Hành động này không thể hoàn tác.
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
