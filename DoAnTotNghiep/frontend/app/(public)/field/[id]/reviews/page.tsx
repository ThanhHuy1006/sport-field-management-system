"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Star, ThumbsUp, Flag, ImageIcon } from 'lucide-react'
import { Pagination } from "@/components/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

const mockReviews = [
  {
    id: 1,
    author: "Nguyễn Văn A",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "Sân rất đẹp và chất lượng. Cỏ được chăm sóc tốt, đèn chiếu sáng đầy đủ. Chủ sân thân thiện và nhiệt tình.",
    date: "2025-01-12",
    helpful: 12,
    verified: true,
    images: ["/placeholder.svg", "/placeholder.svg"],
    ownerReply: {
      text: "Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ! Rất mong được phục vụ bạn lần sau.",
      date: "2025-01-13",
    },
  },
  {
    id: 2,
    author: "Trần Thị B",
    avatar: "/placeholder.svg",
    rating: 4,
    text: "Sân ổn, giá hợp lý. Tuy nhiên parking hơi chật vào giờ cao điểm.",
    date: "2025-01-10",
    helpful: 8,
    verified: true,
    images: [],
  },
  {
    id: 3,
    author: "Lê Văn C",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "Sân tuyệt vời! Đã đặt nhiều lần và luôn hài lòng. Phòng thay đồ sạch sẽ, có vòi sen nước nóng.",
    date: "2025-01-08",
    helpful: 15,
    verified: true,
    images: ["/placeholder.svg"],
    ownerReply: {
      text: "Cảm ơn bạn đã ủng hộ! Chúng tôi rất vui khi bạn hài lòng với dịch vụ.",
      date: "2025-01-09",
    },
  },
  {
    id: 4,
    author: "Phạm Thị D",
    avatar: "/placeholder.svg",
    rating: 3,
    text: "Sân khá tốt nhưng cần bảo trì thêm. Có một số khu vực cỏ bị hư.",
    date: "2025-01-05",
    helpful: 5,
    verified: false,
    images: [],
  },
  {
    id: 5,
    author: "Hoàng Văn E",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "Perfect! Sân đẹp nhất khu vực. Booking dễ dàng, chủ sân confirm nhanh.",
    date: "2025-01-03",
    helpful: 20,
    verified: true,
    images: [],
  },
]

const mockFieldData = {
  name: "Green Valley Soccer Field",
  averageRating: 4.8,
  totalReviews: 124,
  ratingBreakdown: {
    5: 89,
    4: 25,
    3: 7,
    2: 2,
    1: 1,
  },
}

export default function FieldReviewsPage({ params }: { params: { id: string } }) {
  const [currentPage, setCurrentPage] = useState(1)
  const [sortBy, setSortBy] = useState("recent")
  const [filterRating, setFilterRating] = useState("all")
  const [showReportDialog, setShowReportDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<number | null>(null)
  const [reportReason, setReportReason] = useState("")

  const itemsPerPage = 10

  // Filter and sort reviews
  let filteredReviews = mockReviews.filter((review) => {
    if (filterRating === "all") return true
    return review.rating === parseInt(filterRating)
  })

  if (sortBy === "recent") {
    filteredReviews.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (sortBy === "helpful") {
    filteredReviews.sort((a, b) => b.helpful - a.helpful)
  } else if (sortBy === "highest") {
    filteredReviews.sort((a, b) => b.rating - a.rating)
  } else if (sortBy === "lowest") {
    filteredReviews.sort((a, b) => a.rating - b.rating)
  }

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const handleHelpful = (reviewId: number) => {
    console.log("[v0] Marking review as helpful:", reviewId)
  }

  const handleReport = () => {
    console.log("[v0] Reporting review:", selectedReview, reportReason)
    setShowReportDialog(false)
    setReportReason("")
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/field/${params.id}`} className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Đánh giá khách hàng</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Rating Summary */}
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">{mockFieldData.name}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Overall Rating */}
            <div className="flex flex-col items-center justify-center text-center border-r border-border">
              <div className="text-6xl font-bold text-primary mb-2">{mockFieldData.averageRating}</div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(mockFieldData.averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">Dựa trên {mockFieldData.totalReviews} đánh giá</p>
            </div>

            {/* Rating Breakdown */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((rating) => {
                const count = mockFieldData.ratingBreakdown[rating as keyof typeof mockFieldData.ratingBreakdown]
                const percentage = (count / mockFieldData.totalReviews) * 100
                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="text-sm font-medium w-12">{rating} sao</span>
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div className="bg-yellow-400 h-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-12 text-right">{count}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* Filters and Sort */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filterRating} onValueChange={setFilterRating}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Lọc theo số sao" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="5">5 sao</SelectItem>
              <SelectItem value="4">4 sao</SelectItem>
              <SelectItem value="3">3 sao</SelectItem>
              <SelectItem value="2">2 sao</SelectItem>
              <SelectItem value="1">1 sao</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sắp xếp" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Mới nhất</SelectItem>
              <SelectItem value="helpful">Hữu ích nhất</SelectItem>
              <SelectItem value="highest">Đánh giá cao nhất</SelectItem>
              <SelectItem value="lowest">Đánh giá thấp nhất</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-6 mb-8">
          {paginatedReviews.map((review) => (
            <Card key={review.id} className="p-6">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <img
                    src={review.avatar || "/placeholder.svg"}
                    alt={review.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-foreground">{review.author}</h4>
                      {review.verified && (
                        <Badge variant="secondary" className="text-xs">
                          Đã xác minh
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
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
                      <span className="text-sm text-muted-foreground">{review.date}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedReview(review.id)
                    setShowReportDialog(true)
                  }}
                >
                  <Flag className="w-4 h-4" />
                </Button>
              </div>

              {/* Review Content */}
              <p className="text-foreground mb-4">{review.text}</p>

              {/* Review Images */}
              {review.images.length > 0 && (
                <div className="flex gap-2 mb-4">
                  {review.images.map((img, idx) => (
                    <img
                      key={idx}
                      src={img || "/placeholder.svg"}
                      alt={`Review ${idx + 1}`}
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                    />
                  ))}
                </div>
              )}

              {/* Review Actions */}
              <div className="flex items-center gap-4 pt-4 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => handleHelpful(review.id)}>
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Hữu ích ({review.helpful})
                </Button>
              </div>

              {/* Owner Reply */}
              {review.ownerReply && (
                <div className="mt-4 ml-12 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Phản hồi từ chủ sân</Badge>
                    <span className="text-sm text-muted-foreground">{review.ownerReply.date}</span>
                  </div>
                  <p className="text-foreground">{review.ownerReply.text}</p>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {filteredReviews.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredReviews.length}
          />
        )}

        {filteredReviews.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground text-lg">Chưa có đánh giá nào</p>
          </Card>
        )}
      </div>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onOpenChange={setShowReportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Báo cáo đánh giá</DialogTitle>
            <DialogDescription>Vui lòng cho chúng tôi biết vấn đề với đánh giá này</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              placeholder="Mô tả vấn đề..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReportDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleReport} disabled={!reportReason.trim()}>
              Gửi báo cáo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
