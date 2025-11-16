"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Star, Eye, Trash2, Flag } from 'lucide-react'
import { Pagination } from "@/components/pagination"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"

const mockReviews = [
  {
    id: 1,
    fieldName: "Green Valley Soccer Field",
    fieldId: 1,
    author: "Nguyễn Văn A",
    rating: 5,
    text: "Sân rất đẹp và chất lượng. Cỏ được chăm sóc tốt.",
    date: "2025-01-12",
    status: "approved",
    reports: 0,
  },
  {
    id: 2,
    fieldName: "Basketball Arena",
    fieldId: 2,
    author: "Trần Thị B",
    rating: 4,
    text: "Sân ổn, giá hợp lý.",
    date: "2025-01-10",
    status: "approved",
    reports: 0,
  },
  {
    id: 3,
    fieldName: "Green Valley Soccer Field",
    fieldId: 1,
    author: "Lê Văn C",
    rating: 1,
    text: "Spam content here. Very bad review with inappropriate content.",
    date: "2025-01-08",
    status: "flagged",
    reports: 3,
  },
  {
    id: 4,
    fieldName: "Tennis Court Elite",
    fieldId: 3,
    author: "Phạm Thị D",
    rating: 3,
    text: "Sân cần bảo trì thêm.",
    date: "2025-01-05",
    status: "approved",
    reports: 0,
  },
]

export default function AdminReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  const itemsPerPage = 15

  // Filter reviews
  let filteredReviews = mockReviews.filter((review) => {
    if (searchTerm && !review.fieldName.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !review.author.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (filterStatus !== "all" && review.status !== filterStatus) return false
    return true
  })

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const flaggedCount = mockReviews.filter((r) => r.status === "flagged").length

  const handleDeleteReview = (reviewId: number) => {
    console.log("[v0] Deleting review:", reviewId)
  }

  const handleApproveReview = (reviewId: number) => {
    console.log("[v0] Approving review:", reviewId)
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
          <h1 className="text-xl font-bold">Quản lý đánh giá</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Alert for flagged reviews */}
        {flaggedCount > 0 && (
          <Card className="p-4 mb-6 bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-red-800 dark:text-red-200">
                Có {flaggedCount} đánh giá bị báo cáo cần xem xét
              </p>
              <Button variant="outline" size="sm" onClick={() => setFilterStatus("flagged")}>
                Xem ngay
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tổng đánh giá</h3>
            <p className="text-3xl font-bold text-foreground">{mockReviews.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Đã duyệt</h3>
            <p className="text-3xl font-bold text-green-600">
              {mockReviews.filter((r) => r.status === "approved").length}
            </p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Bị báo cáo</h3>
            <p className="text-3xl font-bold text-red-600">{flaggedCount}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Đánh giá TB</h3>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">4.3</p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Input
            placeholder="Tìm theo sân hoặc người đánh giá..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-96"
          />

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="approved">Đã duyệt</SelectItem>
              <SelectItem value="flagged">Bị báo cáo</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border">
                <tr>
                  <th className="text-left p-4 font-medium text-muted-foreground">Sân</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Người đánh giá</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Đánh giá</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Nội dung</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Ngày</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Trạng thái</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReviews.map((review) => (
                  <tr key={review.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <Link href={`/field/${review.fieldId}`} className="text-primary hover:underline">
                        {review.fieldName}
                      </Link>
                    </td>
                    <td className="p-4 text-foreground">{review.author}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="p-4 max-w-md">
                      <p className="truncate text-foreground">{review.text}</p>
                    </td>
                    <td className="p-4 text-muted-foreground">{review.date}</td>
                    <td className="p-4">
                      {review.status === "flagged" ? (
                        <Badge variant="destructive" className="flex items-center gap-1 w-fit">
                          <Flag className="w-3 h-3" />
                          {review.reports} báo cáo
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Đã duyệt</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/field/${review.fieldId}/reviews`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                        {review.status === "flagged" && (
                          <Button variant="ghost" size="sm" onClick={() => handleApproveReview(review.id)}>
                            Duyệt
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-destructive">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Xác nhận xóa đánh giá</AlertDialogTitle>
                              <AlertDialogDescription>
                                Bạn có chắc muốn xóa đánh giá này? Hành động này không thể hoàn tác.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Hủy</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteReview(review.id)}>
                                Xóa
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              totalItems={filteredReviews.length}
            />
          </div>
        )}

        {filteredReviews.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <p className="text-muted-foreground text-lg">Không tìm thấy đánh giá nào</p>
          </Card>
        )}
      </div>
    </main>
  )
}
