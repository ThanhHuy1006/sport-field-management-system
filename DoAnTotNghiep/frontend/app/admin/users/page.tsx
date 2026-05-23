"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
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
import { apiGet, apiRequest } from "@/lib/api-client"
import { getImageUrl } from "@/lib/image-url"

type ApiResponse<T> = {
  success?: boolean
  message?: string
  data?: T
}

type ApiListData<T> =
  | T[]
  | {
      items?: T[]
      pagination?: {
        page?: number
        limit?: number
        total?: number
        total_pages?: number
      }
    }

type AdminUser = {
  id: number
  name: string | null
  email: string
  phone: string | null
  avatar_url: string | null
  role: "USER" | "OWNER" | "ADMIN" | string
  status: "active" | "locked" | "deleted" | "ACTIVE" | "LOCKED" | "DELETED" | string
  created_at: string | null
  updated_at?: string | null
  owner_profile?: {
    status: string
    business_name: string | null
    tax_code: string | null
    address: string | null
    license_url: string | null
    id_front_url: string | null
    id_back_url: string | null
    approved_at: string | null
    reject_reason: string | null
  } | null
}

type AdminOwnerRegistration = {
  user_id: number
  business_name: string | null
  tax_code: string | null
  address: string | null
  license_url: string | null
  id_front_url: string | null
  id_back_url: string | null
  status: "pending" | "approved" | "rejected" | "PENDING" | "APPROVED" | "REJECTED" | string
  approved_by: number | null
  approved_at: string | null
  reject_reason: string | null
  created_at: string | null
  user: {
    id: number
    name: string | null
    email: string
    phone: string | null
    avatar_url?: string | null
    role: string
    status: string
  } | null
  reviewed_by?: {
    id: number
    name: string | null
    email: string
  } | null
}

type UiUser = {
  id: number
  name: string
  email: string
  phone: string
  type: "customer" | "owner" | "admin"
  joinDate: string
  status: "active" | "locked" | "deleted" | string
  avatar: string
  businessName?: string | null
  businessAddress?: string | null
}

type PendingOwner = {
  id: number
  name: string
  email: string
  phone: string
  type: "pending_owner"
  joinDate: string
  status: "pending"
  businessName: string
  taxCode: string
  businessAddress: string
  businessPhone: string
  documents: {
    businessLicense: string
    idCardFront: string
    idCardBack: string
  }
  avatar: string
}

type TabType = "all" | "customer" | "owner" | "pending"

const ITEMS_PER_PAGE = 10
const PLACEHOLDER_IMAGE = "/placeholder.svg"

function extractItems<T>(data: ApiListData<T> | null | undefined): T[] {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.items)) return data.items
  return []
}

function formatDate(value?: string | null) {
  if (!value) return "-"

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleDateString("vi-VN")
}

function normalizeUserStatus(status?: string | null) {
  const normalized = String(status || "active").toLowerCase()

  if (normalized === "active" || normalized === "locked" || normalized === "deleted") {
    return normalized
  }

  return normalized || "active"
}

function normalizeOwnerRegistrationStatus(status?: string | null) {
  return String(status || "").toLowerCase()
}

function getCurrentAdminId() {
  if (typeof window === "undefined") return null

  const rawCurrentUser = localStorage.getItem("currentUser")
  if (!rawCurrentUser) return null

  try {
    const parsed = JSON.parse(rawCurrentUser)
    const id = Number(parsed?.id ?? parsed?.user?.id)

    return Number.isFinite(id) ? id : null
  } catch {
    return null
  }
}

function toAssetUrl(url?: string | null) {
  if (!url) return PLACEHOLDER_IMAGE
  return getImageUrl(url)
}

function mapUserToUi(user: AdminUser): UiUser {
  const role = String(user.role || "").toUpperCase()

  return {
    id: user.id,
    name: user.name || "Chưa cập nhật",
    email: user.email || "-",
    phone: user.phone || "-",
    type: role === "OWNER" ? "owner" : role === "ADMIN" ? "admin" : "customer",
    joinDate: formatDate(user.created_at),
    status: normalizeUserStatus(user.status),
    avatar: toAssetUrl(user.avatar_url),
    businessName: user.owner_profile?.business_name ?? null,
    businessAddress: user.owner_profile?.address ?? null,
  }
}

function mapOwnerRegistrationToUi(item: AdminOwnerRegistration): PendingOwner {
  return {
    id: item.user_id,
    name: item.user?.name || "Chưa cập nhật",
    email: item.user?.email || "-",
    phone: item.user?.phone || "-",
    type: "pending_owner",
    joinDate: formatDate(item.created_at),
    status: "pending",
    businessName: item.business_name || "-",
    taxCode: item.tax_code || "-",
    businessAddress: item.address || "-",
    businessPhone: item.user?.phone || "-",
    documents: {
      businessLicense: toAssetUrl(item.license_url),
      idCardFront: toAssetUrl(item.id_front_url),
      idCardBack: toAssetUrl(item.id_back_url),
    },
    avatar: toAssetUrl(item.user?.avatar_url),
  }
}

function getUserTypeLabel(type: UiUser["type"]) {
  if (type === "customer") return "Khách hàng"
  if (type === "owner") return "Chủ sân"
  return "Quản trị"
}

function getUserTypeClassName(type: UiUser["type"]) {
  if (type === "customer") {
    return "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700"
  }

  if (type === "owner") {
    return "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700"
  }

  return "bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
}

function getStatusLabel(status: string) {
  const normalizedStatus = normalizeUserStatus(status)

  if (normalizedStatus === "active") return "Hoạt động"
  if (normalizedStatus === "locked") return "Tạm khóa"
  if (normalizedStatus === "deleted") return "Đã xóa"

  return status || "Không xác định"
}

function getStatusClassName(status: string) {
  const normalizedStatus = normalizeUserStatus(status)

  if (normalizedStatus === "active") {
    return "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700"
  }

  if (normalizedStatus === "locked") {
    return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700"
  }

  if (normalizedStatus === "deleted") {
    return "bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
  }

  return "bg-slate-50 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UiUser[]>([])
  const [pendingOwners, setPendingOwners] = useState<PendingOwner[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState<TabType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<UiUser | null>(null)
  const [selectedPendingOwner, setSelectedPendingOwner] = useState<PendingOwner | null>(null)
  const [userToDelete, setUserToDelete] = useState<UiUser | null>(null)
  const [showUserDialog, setShowUserDialog] = useState(false)
  const [showPendingDialog, setShowPendingDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null)
  const [currentAdminId, setCurrentAdminId] = useState<number | null>(null)
  const { toast } = useToast()

  const fetchAdminUsers = useCallback(async () => {
    setLoading(true)
    setErrorMessage("")

    try {
      const [usersRes, ownersRes] = await Promise.all([
        apiGet<ApiResponse<ApiListData<AdminUser>>>("/admin/users"),
        apiGet<ApiResponse<ApiListData<AdminOwnerRegistration>>>("/admin/owner-registrations"),
      ])

      const userItems = extractItems(usersRes.data)
      const ownerRegistrationItems = extractItems(ownersRes.data)

      setUsers(userItems.map(mapUserToUi))
      setPendingOwners(
        ownerRegistrationItems
          .filter((item) => normalizeOwnerRegistrationStatus(item.status) === "pending")
          .map(mapOwnerRegistrationToUi),
      )
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Vui lòng kiểm tra lại quyền admin hoặc kết nối server."

      setUsers([])
      setPendingOwners([])
      setErrorMessage(message)

      toast({
        title: "Không thể tải dữ liệu",
        description: message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    setCurrentAdminId(getCurrentAdminId())
    fetchAdminUsers()
  }, [fetchAdminUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const keyword = searchTerm.trim().toLowerCase()
      const matchesSearch =
        !keyword ||
        user.name.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.phone.toLowerCase().includes(keyword)

      const matchesTab =
        activeTab === "all" ||
        (activeTab === "customer" && user.type === "customer") ||
        (activeTab === "owner" && user.type === "owner")

      return matchesSearch && matchesTab
    })
  }, [activeTab, searchTerm, users])

  const filteredPendingOwners = useMemo(() => {
    return pendingOwners.filter((owner) => {
      const keyword = searchTerm.trim().toLowerCase()

      return (
        !keyword ||
        owner.name.toLowerCase().includes(keyword) ||
        owner.email.toLowerCase().includes(keyword) ||
        owner.businessName.toLowerCase().includes(keyword) ||
        owner.taxCode.toLowerCase().includes(keyword)
      )
    })
  }, [pendingOwners, searchTerm])

  const totalItems = activeTab === "pending" ? filteredPendingOwners.length : filteredUsers.length
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE))

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredUsers])

  const paginatedPendingOwners = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredPendingOwners.slice(startIndex, startIndex + ITEMS_PER_PAGE)
  }, [currentPage, filteredPendingOwners])

  const stats = useMemo(
    () => ({
      total: users.length,
      customers: users.filter((u) => u.type === "customer").length,
      owners: users.filter((u) => u.type === "owner").length,
      pending: pendingOwners.length,
    }),
    [pendingOwners.length, users],
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const canManageUser = (user: UiUser) => {
    if (user.status === "deleted") return false
    if (user.id === currentAdminId) return false
    if (user.type === "admin") return false

    return true
  }

  const getManageDisabledReason = (user: UiUser) => {
    if (user.status === "deleted") return "Tài khoản đã xóa"
    if (user.id === currentAdminId) return "Không thể thao tác trên chính tài khoản của bạn"
    if (user.type === "admin") return "Không thao tác trực tiếp trên tài khoản quản trị"

    return ""
  }

  const handleViewUser = (user: UiUser) => {
    setSelectedUser(user)
    setShowUserDialog(true)
  }

  const handleViewPendingOwner = (owner: PendingOwner) => {
    setSelectedPendingOwner(owner)
    setShowPendingDialog(true)
  }

  const openRejectOwnerDialog = (owner: PendingOwner) => {
    setSelectedPendingOwner(owner)
    setRejectReason("")
    setShowRejectDialog(true)
  }

  const openDeleteUserDialog = (user: UiUser) => {
    if (!canManageUser(user)) {
      toast({
        title: "Không thể xóa tài khoản",
        description: getManageDisabledReason(user),
        variant: "destructive",
      })
      return
    }

    setUserToDelete(user)
    setShowDeleteDialog(true)
  }

  const handleDeleteUser = async () => {
    if (!userToDelete) return
    if (!canManageUser(userToDelete)) return

    const actionKey = `delete-user-${userToDelete.id}`
    setActionLoadingKey(actionKey)

    try {
      await apiRequest<ApiResponse<AdminUser>>(`/admin/users/${userToDelete.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "deleted",
        }),
      })

      await fetchAdminUsers()

      setShowDeleteDialog(false)
      setUserToDelete(null)

      toast({
        title: "Đã xóa",
        description: "Người dùng đã được chuyển sang trạng thái đã xóa.",
      })
    } catch (error) {
      toast({
        title: "Không thể xóa người dùng",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra.",
        variant: "destructive",
      })
    } finally {
      setActionLoadingKey(null)
    }
  }

  const handleToggleStatus = async (id: number) => {
    const user = users.find((u) => u.id === id)
    if (!user) return

    if (!canManageUser(user)) {
      toast({
        title: "Không thể cập nhật trạng thái",
        description: getManageDisabledReason(user),
        variant: "destructive",
      })
      return
    }

    const nextStatus = user.status === "active" ? "locked" : "active"
    const actionKey = `toggle-user-${id}`
    setActionLoadingKey(actionKey)

    try {
      await apiRequest<ApiResponse<AdminUser>>(`/admin/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status: nextStatus,
        }),
      })

      await fetchAdminUsers()

      toast({
        title: nextStatus === "locked" ? "Đã khóa" : "Đã mở khóa",
        description: `Tài khoản ${user.name} đã được ${
          nextStatus === "locked" ? "khóa" : "mở khóa"
        }.`,
      })
    } catch (error) {
      toast({
        title: "Không thể cập nhật trạng thái",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra.",
        variant: "destructive",
      })
    } finally {
      setActionLoadingKey(null)
    }
  }

  const handleApproveOwner = async (id: number) => {
    const approvedOwner = pendingOwners.find((o) => o.id === id)
    if (!approvedOwner) return

    const actionKey = `approve-owner-${id}`
    setActionLoadingKey(actionKey)

    try {
      await apiRequest<ApiResponse<AdminOwnerRegistration>>(
        `/admin/owner-registrations/${id}/approve`,
        {
          method: "PATCH",
        },
      )

      await fetchAdminUsers()

      setShowPendingDialog(false)
      setSelectedPendingOwner(null)

      toast({
        title: "Đã Phê Duyệt",
        description: `${approvedOwner.name} đã được phê duyệt thành chủ sân.`,
      })
    } catch (error) {
      toast({
        title: "Không thể phê duyệt",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra.",
        variant: "destructive",
      })
    } finally {
      setActionLoadingKey(null)
    }
  }

  const handleRejectOwner = async () => {
    if (!selectedPendingOwner || !rejectReason.trim()) return

    const rejectedOwner = selectedPendingOwner
    const actionKey = `reject-owner-${rejectedOwner.id}`
    setActionLoadingKey(actionKey)

    try {
      await apiRequest<ApiResponse<AdminOwnerRegistration>>(
        `/admin/owner-registrations/${rejectedOwner.id}/reject`,
        {
          method: "PATCH",
          body: JSON.stringify({
            reject_reason: rejectReason.trim(),
          }),
        },
      )

      await fetchAdminUsers()

      setShowRejectDialog(false)
      setShowPendingDialog(false)
      setSelectedPendingOwner(null)
      setRejectReason("")

      toast({
        title: "Đã Từ Chối",
        description: `Đơn của ${rejectedOwner.name} đã bị từ chối.`,
        variant: "destructive",
      })
    } catch (error) {
      toast({
        title: "Không thể từ chối",
        description: error instanceof Error ? error.message : "Có lỗi xảy ra.",
        variant: "destructive",
      })
    } finally {
      setActionLoadingKey(null)
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

      {errorMessage && (
        <Card className="p-4 mb-6 border-destructive/30 bg-destructive/10">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-destructive">{errorMessage}</p>
            <Button variant="outline" size="sm" onClick={fetchAdminUsers}>
              Thử lại
            </Button>
          </div>
        </Card>
      )}

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
            placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10"
          />
        </div>
      </div>

      {loading ? (
        <Card className="p-6 mb-6 text-center text-muted-foreground">Đang tải dữ liệu...</Card>
      ) : activeTab === "pending" ? (
        // Pending Owners List
        <div className="space-y-4">
          {filteredPendingOwners.length === 0 ? (
            <Card className="p-12 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">Không có đơn chờ duyệt</h2>
              <p className="text-muted-foreground">Tất cả đơn đăng ký chủ sân đã được xử lý</p>
            </Card>
          ) : (
            paginatedPendingOwners.map((owner) => {
              const approveActionKey = `approve-owner-${owner.id}`
              const rejectActionKey = `reject-owner-${owner.id}`
              const isApproving = actionLoadingKey === approveActionKey
              const isRejecting = actionLoadingKey === rejectActionKey

              return (
                <Card key={owner.id} className="p-4 md:p-6">
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <img
                      src={owner.avatar || PLACEHOLDER_IMAGE}
                      alt={owner.name}
                      className="w-16 h-16 rounded-full object-cover"
                      onError={(event) => {
                        event.currentTarget.src = PLACEHOLDER_IMAGE
                      }}
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
                        disabled={Boolean(actionLoadingKey)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        {isApproving ? "Đang duyệt..." : "Duyệt"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
                        onClick={() => openRejectOwnerDialog(owner)}
                        disabled={Boolean(actionLoadingKey)}
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        {isRejecting ? "Đang từ chối..." : "Từ chối"}
                      </Button>
                    </div>
                  </div>
                </Card>
              )
            })
          )}
        </div>
      ) : (
        // Users Table
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px]">
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
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground">Trạng thái</th>
                  <th className="px-4 md:px-6 py-3 text-left text-sm font-medium text-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.map((user) => {
                  const toggleActionKey = `toggle-user-${user.id}`
                  const deleteActionKey = `delete-user-${user.id}`
                  const disabledReason = getManageDisabledReason(user)
                  const canManage = canManageUser(user)
                  const isToggleLoading = actionLoadingKey === toggleActionKey
                  const isDeleteLoading = actionLoadingKey === deleteActionKey

                  return (
                    <tr key={user.id} className="border-b border-border hover:bg-muted/50 transition">
                      <td className="px-4 md:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={user.avatar || PLACEHOLDER_IMAGE}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(event) => {
                              event.currentTarget.src = PLACEHOLDER_IMAGE
                            }}
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
                        <Badge variant="outline" className={getUserTypeClassName(user.type)}>
                          {getUserTypeLabel(user.type)}
                        </Badge>
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm text-muted-foreground hidden lg:table-cell">
                        {user.joinDate}
                      </td>
                      <td className="px-4 md:px-6 py-4 text-sm">
                        <Badge variant="outline" className={getStatusClassName(user.status)}>
                          {getStatusLabel(user.status)}
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
                            title={
                              disabledReason ||
                              (user.status === "active" ? "Khóa tài khoản" : "Mở khóa")
                            }
                            className={user.status === "active" ? "text-amber-600" : "text-green-600"}
                            disabled={!canManage || Boolean(actionLoadingKey)}
                          >
                            {isToggleLoading ? (
                              <span className="text-xs">...</span>
                            ) : user.status === "active" ? (
                              <Ban className="w-4 h-4" />
                            ) : (
                              <ShieldCheck className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive bg-transparent"
                            onClick={() => openDeleteUserDialog(user)}
                            title={disabledReason || "Xóa"}
                            disabled={!canManage || Boolean(actionLoadingKey)}
                          >
                            {isDeleteLoading ? <span className="text-xs">...</span> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {totalItems > 0 && (
            <div className="p-4 border-t border-border">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={ITEMS_PER_PAGE}
                totalItems={totalItems}
              />
            </div>
          )}
        </Card>
      )}

      {!loading && totalItems === 0 && activeTab !== "pending" && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground text-lg">Không tìm thấy người dùng</p>
        </Card>
      )}

      {/* User Detail Dialog */}
      <Dialog
        open={showUserDialog}
        onOpenChange={(open) => {
          setShowUserDialog(open)

          if (!open) {
            setSelectedUser(null)
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi Tiết Người Dùng</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedUser.avatar || PLACEHOLDER_IMAGE}
                  alt={selectedUser.name}
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_IMAGE
                  }}
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedUser.name}</h3>
                  <Badge variant="outline" className={getUserTypeClassName(selectedUser.type)}>
                    {getUserTypeLabel(selectedUser.type)}
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
                      <span className="text-foreground">{selectedUser.businessAddress || "Chưa cập nhật"}</span>
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-border">
                <div className="w-fit rounded-lg bg-muted px-4 py-3">
                  <Badge variant="outline" className={getStatusClassName(selectedUser.status)}>
                    {getStatusLabel(selectedUser.status)}
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
      <Dialog
        open={showPendingDialog}
        onOpenChange={(open) => {
          setShowPendingDialog(open)

          if (!open && !showRejectDialog) {
            setSelectedPendingOwner(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi Tiết Đơn Đăng Ký Chủ Sân</DialogTitle>
          </DialogHeader>
          {selectedPendingOwner && (
            <div className="space-y-6">
              {/* Personal Info */}
              <div className="flex items-center gap-4">
                <img
                  src={selectedPendingOwner.avatar || PLACEHOLDER_IMAGE}
                  alt={selectedPendingOwner.name}
                  className="w-20 h-20 rounded-full object-cover"
                  onError={(event) => {
                    event.currentTarget.src = PLACEHOLDER_IMAGE
                  }}
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
                      src={selectedPendingOwner.documents.businessLicense || PLACEHOLDER_IMAGE}
                      alt="Giấy phép kinh doanh"
                      className="w-full max-w-md rounded border border-border cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(selectedPendingOwner.documents.businessLicense, "_blank")}
                      onError={(event) => {
                        event.currentTarget.src = PLACEHOLDER_IMAGE
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">CMND/CCCD (Trước)</p>
                      <img
                        src={selectedPendingOwner.documents.idCardFront || PLACEHOLDER_IMAGE}
                        alt="CMND/CCCD mặt trước"
                        className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                        onClick={() => window.open(selectedPendingOwner.documents.idCardFront, "_blank")}
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMAGE
                        }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-2">CMND/CCCD (Sau)</p>
                      <img
                        src={selectedPendingOwner.documents.idCardBack || PLACEHOLDER_IMAGE}
                        alt="CMND/CCCD mặt sau"
                        className="w-full rounded border border-border cursor-pointer hover:opacity-80 transition"
                        onClick={() => window.open(selectedPendingOwner.documents.idCardBack, "_blank")}
                        onError={(event) => {
                          event.currentTarget.src = PLACEHOLDER_IMAGE
                        }}
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
              disabled={Boolean(actionLoadingKey)}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Phê Duyệt
            </Button>
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 bg-transparent"
              onClick={() => selectedPendingOwner && openRejectOwnerDialog(selectedPendingOwner)}
              disabled={Boolean(actionLoadingKey)}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={showRejectDialog}
        onOpenChange={(open) => {
          setShowRejectDialog(open)

          if (!open) {
            setRejectReason("")
          }
        }}
      >
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
              disabled={!rejectReason.trim() || Boolean(actionLoadingKey)}
            >
              Xác Nhận Từ Chối
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open)

          if (!open) {
            setUserToDelete(null)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác Nhận Xóa Người Dùng</DialogTitle>
            <DialogDescription>
              {userToDelete ? (
                <>
                  Bạn có chắc muốn chuyển tài khoản <strong>{userToDelete.name}</strong> sang trạng thái đã xóa không?
                  Thao tác này có thể ảnh hưởng đến dữ liệu liên quan của người dùng.
                </>
              ) : (
                "Bạn có chắc muốn xóa người dùng này không?"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Hủy
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleDeleteUser}
              disabled={!userToDelete || Boolean(actionLoadingKey)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Xác Nhận Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
