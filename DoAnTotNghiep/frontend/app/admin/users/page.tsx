"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Trash2, Eye, AlertCircle } from "lucide-react"
import { Pagination } from "@/components/pagination"

const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    type: "customer",
    joinDate: "2024-06-15",
    bookings: 24,
    status: "active",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    type: "owner",
    joinDate: "2024-05-20",
    bookings: 156,
    status: "active",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    type: "customer",
    joinDate: "2024-07-10",
    bookings: 8,
    status: "active",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    type: "owner",
    joinDate: "2024-04-05",
    bookings: 234,
    status: "suspended",
  },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || user.type === filterType
    return matchesSearch && matchesType
  })

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const pendingApprovalsCount = 2 // In real app: fetch from API

  const handleDelete = (id: number) => {
    setUsers(users.filter((u) => u.id !== id))
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
          <h1 className="text-xl font-bold">Quản Lý Người Dùng</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {pendingApprovalsCount > 0 && (
          <Link href="/admin/approvals">
            <Card className="p-4 mb-6 bg-yellow-50 border-yellow-200 hover:bg-yellow-100 transition cursor-pointer">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">{pendingApprovalsCount} đơn chủ sân đang chờ phê duyệt</p>
                  <p className="text-sm text-yellow-800">Click để xem và duyệt các đơn đăng ký</p>
                </div>
                <Badge variant="secondary" className="bg-yellow-200 text-yellow-900">
                  {pendingApprovalsCount}
                </Badge>
              </div>
            </Card>
          </Link>
        )}

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-border rounded-md bg-background text-foreground"
          >
            <option value="all">Tất Cả Người Dùng</option>
            <option value="customer">Khách Hàng</option>
            <option value="owner">Chủ Sân</option>
            <option value="admin">Quản Trị Viên</option>
          </select>
        </div>

        {/* Users Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Tên</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Email</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Loại</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Ngày Tham Gia</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Đặt Sân</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Trạng Thái</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-foreground">Hành Động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{user.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.email}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.type === "customer" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                        }`}
                      >
                        {user.type === "customer" ? "Khách Hàng" : "Chủ Sân"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{user.joinDate}</td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{user.bookings}</td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}
                      >
                        {user.status === "active" ? "Hoạt Động" : "Tạm Khóa"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length > 0 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredUsers.length}
              />
            </div>
          )}
        </Card>

        {filteredUsers.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Không tìm thấy người dùng</p>
          </Card>
        )}
      </div>
    </main>
  )
}
