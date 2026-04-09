"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import {
  Search,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User,
  ShieldCheck,
  Ban,
} from "lucide-react"
import { Pagination } from "@/components/pagination"

// Mock data for all users
const mockUsers = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    phone: "+84 123 456 789",
    type: "customer" as const,
    joinDate: "2024-06-15",
    bookings: 24,
    status: "active" as const,
    avatar: "/male-avatar.jpg",
  },
  {
    id: 2,
    name: "Trần Thị B",
    email: "tranthib@example.com",
    phone: "+84 234 567 890",
    type: "owner" as const,
    joinDate: "2024-05-20",
    bookings: 156,
    status: "active" as const,
    businessName: "Sân Thể Thao ABC",
    businessAddress: "268 Lý Thường Kiệt, Q.10, TP.HCM",
    avatar: "/female-avatar.jpg",
  },
  {
    id: 3,
    name: "Lê Văn C",
    email: "levanc@example.com",
    phone: "+84 345 678 901",
    type: "customer" as const,
    joinDate: "2024-07-10",
    bookings: 8,
    status: "active" as const,
    avatar: "/male-avatar.jpg",
  },
  {
    id: 4,
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    phone: "+84 456 789 012",
    type: "owner" as const,
    joinDate: "2024-04-05",
    bookings: 234,
    status: "suspended" as const,
    businessName: "Sân Bóng XYZ",
    businessAddress: "123 Nguyễn Huệ, Q.1, TP.HCM",
    avatar: "/female-avatar.jpg",
  },
  {
    id: 5,
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    phone: "+84 567 890 123",
    type: "customer" as const,
    joinDate: "2024-08-20",
    bookings: 15,
    status: "active" as const,
    avatar: "/male-avatar.jpg",
  },
  {
    id: 6,
    name: "Võ Thị F",
    email: "vothif@example.com",
    phone: "+84 678 901 234",
    type: "owner" as const,
    joinDate: "2024-03-15",
    bookings: 89,
    status: "active" as const,
    businessName: "Sân Tennis Sunrise",
    businessAddress: "456 Trần Hưng Đạo, Q.5, TP.HCM",
    avatar: "/female-avatar.jpg",
  },
]

// Mock data for pending owner approvals
const mockPendingOwners = [
  {
    id: 101,
    name: "Nguyễn Minh G",
    email: "nguyenminhg@example.com",
    phone: "+84 789 012 345",
    type: "pending_owner" as const,
    joinDate: "2024-12-15",
    status: "pending" as const,
    businessName: "Sân Bóng Đá Thủ Đức",
    taxCode: "0123456789",
    businessAddress: "789 Võ Văn Ngân, Thủ Đức, TP.HCM",
    businessPhone: "+84 987 654 321",
    documents: {
      businessLicense: "/business-license.jpg",
      idCardFront: "/generic-id-card-front.png",
      idCardBack: "/id-card-back.jpg",
    },
    avatar: "/male-avatar.jpg",
  },
  {
    id: 102,
    name: "Lê Thị H",
    email: "lethih@example.com",
    phone: "+84 890 123 456",
    type: "pending_owner" as const,
    joinDate: "2024-12-16",
    status: "pending" as const,
    businessName: "Sân Cầu Lông Quận 7",
    taxCode: "0987654321",
    businessAddress: "321 Nguyễn Thị Thập, Q.7, TP.HCM",
    businessPhone: "+84 876 543 210",
    documents: {
      businessLicense: "/business-license.jpg",
      idCardFront: "/generic-id-card-front.png",
      idCardBack: "/id-card-back.jpg",
    },
    avatar: "/female-avatar.jpg",
  },
]

type PendingOwner = (typeof mockPendingOwners)[0]
type TabType = "all" | "customer" | "owner" | "pending"

export default function AdminUsersPage() {
  const [users, setUsers] = useState(mockUsers)
  const [pendingOwners, setPendingOwners] = useState(mockPendingOwners)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [selectedPendingOwner, setSelectedPendingOwner] = useState<PendingOwner | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showPendingDialog, setShowPendingDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const { toast } = useToast()
  const itemsPerPage = 10

  // Filter users based on tab and search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "customer" && user.type === "customer") ||
      (activeTab === "owner" && user.type === "owner")
    return matchesSearch && matchesTab
  })

  const filteredPendingOwners = pendingOwners.filter(
    (owner) =>
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Pagination
  const displayData = activeTab === "pending" ? filteredPendingOwners : filteredUsers
  const totalPages = Math.ceil(displayData.length / itemsPerPage)
  const paginatedData = displayData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  // Stats
  const stats = {
    total: users.length + pendingOwners.length,
    customers: users.filter((u) => u.type === "customer").length,
    owners: users.filter((u) => u.type === "owner").length,
    pending: pendingOwners.length,
  }

  // Handlers
  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const handleViewPendingOwner = (owner: PendingOwner) => {
    setSelectedPendingOwner(owner)
    setShowPendingDialog(true)
  }

  const handleDeleteUser = (id: number) => {
    setUsers(users.filter((u) => u.id !== id))
    toast({
      title: "Đã xóa",
      description: "Người dùng đã được xóa khỏi hệ thống.",
    })
  }

  const handleToggleStatus = (id: number) => {
    setUsers(users.map((u) => (u.id === id ? { ...u, status: u.status === "active" ? "suspended" : "active" } : u)))
    const user = users.find((u) => u.id === id)
    toast({
      title: user?.status === "active" ? "Đã khóa" : "Đã mở khóa",
      description: `Tài khoản ${user?.name} đã được ${user?.status === "active" ? "khóa" : "mở khóa"}.`,
    })
  }

  const handleApproveOwner = (id: number) => {
    const approvedOwner = pendingOwners.find((o) => o.id === id)
    if (approvedOwner) {
      // Add to users list as owner
      const newOwner = {
        id: approvedOwner.id,
        name: approvedOwner.name,
        email: approvedOwner.email,
        phone: approvedOwner.phone,
        type: "owner",
        joinDate: new Date().toISOString().split("T")[0],
        bookings: 0,
        status: "active",
        businessName: approvedOwner.businessName,
        businessAddress: approvedOwner.businessAddress,
        avatar: approvedOwner.avatar,
      }
      setUsers([...users, newOwner])
      setPendingOwners(pendingOwners.filter((o) => o.id !== id))
      setShowPendingDialog(false)
      setSelectedPendingOwner(null)
      toast({
        title: "Đã Phê Duyệt",
        description: `${approvedOwner.name} đã được phê duyệt thành chủ sân.`,
      })
    }
  }

  const handleRejectOwner = () => {
    if (selectedPendingOwner && rejectReason.trim()) {
      const rejectedName = selectedPendingOwner.name
      setPendingOwners(pendingOwners.filter((o) => o.id !== selectedPendingOwner.id))
      setShowRejectDialog(false)
      setShowPendingDialog(false)
      setSelectedPendingOwner(null)
      setRejectReason("")
      toast({
        title: "Đã Từ Chối",
        description: `Đơn của ${rejectedName} đã bị từ chối.`,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-4 md:p-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Quản Lý Người Dùng</h1>
        <p className="text-muted-foreground">Quản lý tất cả người dùng và phê duyệt chủ sân mới</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tổng cộng</p>
              <p className="text-xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <User className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Khách hàng</p>
              <p className="text-xl font-bold text-foreground">{stats.customers}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chủ sân</p>
              <p className="text-xl font-bold text-foreground">{stats.owners}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              <p className="text-xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as TabType)
          setCurrentPage(1)
        }}
        className="mb-6"
      >
        <TabsList className="grid w-full grid-cols-4 max-w-lg">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="customer">Khách hàng</TabsTrigger>
          <TabsTrigger value="owner">Chủ sân</TabsTrigger>
          <TabsTrigger value="pending" className="relative">
            Chờ duyệt
            {stats.pending > 0 && (
              <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-amber-500">
                {stats.pending}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content based on tab */}
      {activeTab === "pending" ? (
        // Pending Owners List
        <div className="space-y-4">
          {filteredPendingOwners.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Không có đơn chờ duyệt</h2>
              <p className="text-muted-foreground">Tất cả đơn đăng ký chủ sân đã được xử lý</p>
            </Card>
          ) : (
            filteredPendingOwners.map((owner) => (
              <Card key={owner.id} className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <img
                    src={owner.avatar || "/placeholder.svg"}
                    alt={owner.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-foreground">{owner.name}</h3>
                      <Badge
                        variant="outline"
                        className="bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700"
                      >
                        Chờ Duyệt
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{owner.email}</p>
                    <p className="text-sm text-muted-foreground">
                      <Building2 className="w-3 h-3 inline mr-1" />
                      {owner.businessName}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Đăng ký ngày {owner.joinDate}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewPendingOwner(owner)}>
                      <Eye className="w-4 h-4 mr-1" />
                      Xem
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleApproveOwner(owner.id)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Duyệt
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
                      onClick={() => {
                        setSelectedPendingOwner(owner)
                        setShowRejectDialog(true)
                      }}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Từ chối
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      ) : (
        // Users Table
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground">Người dùng</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground hidden md:table-cell">
                    Email
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground">Loại</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground hidden lg:table-cell">
                    Ngày tham gia
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground hidden md:table-cell">
                    Đặt sân
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{user.name}</p>
                          <p className="text-xs text-muted-foreground md:hidden">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground hidden md:table-cell">
                      {user.email}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <Badge
                        variant="outline"
                        className={
                          user.type === "customer"
                            ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
                            : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
                        }
                      >
                        {user.type === "customer" ? "Khách hàng" : "Chủ sân"}
                      </Badge>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                      {user.joinDate}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm font-medium text-foreground hidden md:table-cell">
                      {user.bookings}
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <Badge
                        variant="outline"
                        className={
                          user.status === "active"
                            ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
                            : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
                        }
                      >
                        {user.status === "active" ? "Hoạt động" : "Tạm khóa"}
                      </Badge>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm">
                      <div className="flex gap-1">
                        <Button variant="outline" size="sm" onClick={() => handleViewUser(user)} title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === "active" ? "Khóa tài khoản" : "Mở khóa"}
                          className={user.status === "active" ? "text-amber-600" : "text-green-600"}
                        >
                          {user.status === "active" ? <Ban className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive bg-transparent"
                          onClick={() => handleDeleteUser(user.id)}
                          title="Xóa"
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

          {displayData.length > 0 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={displayData.length}
              />
            </div>
          )}
        </Card>
      )}

      {displayData.length === 0 && activeTab !== "pending" && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy người dùng</p>
        </Card>
      )}

      {/* User Detail Dialog */}
      <Dialog open={showUserDialog} onOpenChange={setShowUserDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar || "/placeholder.svg"}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedUser.name}</h3>
                  <Badge
                    variant="outline"
                    className={
                      selectedUser.type === "customer"
                        ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
                    }
                  >
                    {selectedUser.type === "customer" ? "Khách hàng" : "Chủ sân"}
                  </Badge>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-border">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedUser.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedUser.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">Tham gia: {selectedUser.joinDate}</span>
                </div>
                {selectedUser.type === "owner" && selectedUser.businessName && (
                  <>
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">{selectedUser.businessName}</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <span className="text-foreground">{selectedUser.businessAddress}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold text-foreground">{selectedUser.bookings}</p>
                  <p className="text-sm text-muted-foreground">Lượt đặt sân</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <Badge
                    variant="outline"
                    className={
                      selectedUser.status === "active"
                        ? "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                    }
                  >
                    {selectedUser.status === "active" ? "Hoạt động" : "Tạm khóa"}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">Trạng thái</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserDialog(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pending Owner Detail Dialog */}
      <Dialog open={showPendingDialog} onOpenChange={setShowPendingDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đơn Đăng Ký Chủ Sân</DialogTitle>
          </DialogHeader>
          {selectedPendingOwner && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedPendingOwner.avatar || "/placeholder.svg"}
                  alt={selectedPendingOwner.name}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedPendingOwner.name}</h3>
                  <p className="text-sm text-muted-foreground">Đăng ký ngày {selectedPendingOwner.joinDate}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedPendingOwner.email}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-foreground">{selectedPendingOwner.phone}</span>
                </div>
              </div>

              {/* Business Info */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Thông Tin Doanh Nghiệp
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tên:</span>{" "}
                    <span className="font-medium text-foreground">{selectedPendingOwner.businessName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">MST:</span>{" "}
                    <span className="font-medium text-foreground">{selectedPendingOwner.taxCode}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">{selectedPendingOwner.businessAddress}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">SĐT:</span>{" "}
                    <span className="font-medium text-foreground">{selectedPendingOwner.businessPhone}</span>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div className="border-t border-border pt-4">
                <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Giấy Tờ Đính Kèm
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Giấy Phép Kinh Doanh</p>
                    <img
                      src={selectedPendingOwner.documents.businessLicense || "/placeholder.svg"}
                      alt="Business License"
                      className="w-full max-w-md rounded border border-border cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(selectedPendingOwner.documents.businessLicense, "_blank")}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">CMND/CCCD (Trước)</p>
                      <img
                        src={selectedPendingOwner.documents.idCardFront || "/placeholder.svg"}
                        alt="ID Card Front"
                        className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                        onClick={() => window.open(selectedPendingOwner.documents.idCardFront, "_blank")}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">CMND/CCCD (Sau)</p>
                      <img
                        src={selectedPendingOwner.documents.idCardBack || "/placeholder.svg"}
                        alt="ID Card Back"
                        className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                        onClick={() => window.open(selectedPendingOwner.documents.idCardBack, "_blank")}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPendingDialog(false)}>
              Đóng
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => selectedPendingOwner && handleApproveOwner(selectedPendingOwner.id)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Phê Duyệt
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
              onClick={() => setShowRejectDialog(true)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Từ Chối Đơn Đăng Ký</DialogTitle>
            <DialogDescription>Vui lòng nhập lý do từ chối để gửi cho {selectedPendingOwner?.name}.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Ví dụ: Giấy phép kinh doanh không rõ ràng, thông tin CMND không khớp..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-32"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleRejectOwner}
              disabled={!rejectReason.trim()}
            >
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
