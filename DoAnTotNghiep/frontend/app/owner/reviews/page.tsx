"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Star, MessageSquare } from "lucide-react"
import { Pagination } from "@/components/pagination"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

const mockReviews = [
  {
    id: 1,
    fieldName: "Green Valley Soccer Field",
    author: "Nguyễn Văn A",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "Sân rất đẹp và chất lượng. Cỏ được chăm sóc tốt, đèn chiếu sáng đầy đủ. Chủ sân thân thiện và nhiệt tình.",
    date: "2025-01-12",
    replied: true,
    reply: "Cảm ơn bạn đã tin tưởng và sử dụng dịch vụ! Rất mong được phục vụ bạn lần sau.",
    replyDate: "2025-01-13",
  },
  {
    id: 2,
    fieldName: "Green Valley Soccer Field",
    author: "Trần Thị B",
    avatar: "/placeholder.svg",
    rating: 4,
    text: "Sân ổn, giá hợp lý. Tuy nhiên parking hơi chật vào giờ cao điểm.",
    date: "2025-01-10",
    replied: false,
  },
  {
    id: 3,
    fieldName: "Basketball Arena",
    author: "Lê Văn C",
    avatar: "/placeholder.svg",
    rating: 5,
    text: "Sân tuyệt vời! Đã đặt nhiều lần và luôn hài lòng.",
    date: "2025-01-08",
    replied: true,
    reply: "Cảm ơn bạn đã ủng hộ! Chúng tôi rất vui khi bạn hài lòng với dịch vụ.",
    replyDate: "2025-01-09",
  },
  {
    id: 4,
    fieldName: "Green Valley Soccer Field",
    author: "Phạm Thị D",
    avatar: "/placeholder.svg",
    rating: 3,
    text: "Sân khá tốt nhưng cần bảo trì thêm. Có một số khu vực cỏ bị hư.",
    date: "2025-01-05",
    replied: false,
  },
]

export default function OwnerReviewsPage() {
  const { toast } = useToast()
  const [currentPage, setCurrentPage] = useState(1)
  const [showReplyDialog, setShowReplyDialog] = useState(false)
  const [selectedReview, setSelectedReview] = useState<(typeof mockReviews)[0] | null>(null)
  const [reply, setReply] = useState("")
  const [filterField, setFilterField] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const itemsPerPage = 10

  const filteredReviews = mockReviews.filter((review) => {
    if (filterField !== "all" && review.fieldName !== filterField) return false
    if (filterStatus === "replied" && !review.replied) return false
    if (filterStatus === "unreplied" && review.replied) return false
    return true
  })

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage)
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const unrepliedCount = mockReviews.filter((r) => !r.replied).length

  const handleSubmitReply = () => {
    toast({
      title: "Đã gửi phản hồi",
      description: "Phản hồi của bạn đã được gửi thành công.",
    })
    setShowReplyDialog(false)
    setReply("")
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Link href="/" className="hover:text-primary">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/owner/dashboard" className="hover:text-primary">
              Dashboard
            </Link>
            <span>/</span>
            <span className="text-foreground">Quản lý đánh giá</span>
          </div>
          <h1 className="text-2xl font-bold">Quản lý đánh giá</h1>
        </div>

        {/* Alert for unreplied reviews */}
        {unrepliedCount > 0 && (
          <Card className="p-4 mb-6 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900">
            <div className="flex items-center justify-between">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                Bạn có {unrepliedCount} đánh giá chưa phản hồi
              </p>
              <Button variant="outline" size="sm" onClick={() => setFilterStatus("unreplied")}>
                Xem
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Tổng đánh giá</h3>
            <p className="text-3xl font-bold text-foreground">{mockReviews.length}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Đánh giá trung bình</h3>
            <div className="flex items-center gap-2">
              <p className="text-3xl font-bold text-foreground">4.6</p>
              <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            </div>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Chưa phản hồi</h3>
            <p className="text-3xl font-bold text-yellow-600">{unrepliedCount}</p>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={filterField} onValueChange={setFilterField}>
            <SelectTrigger className="w-full sm:w-64">
              <SelectValue placeholder="Lọc theo sân" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả sân</SelectItem>
              <SelectItem value="Green Valley Soccer Field">Green Valley Soccer Field</SelectItem>
              <SelectItem value="Basketball Arena">Basketball Arena</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="unreplied">Chưa phản hồi</SelectItem>
              <SelectItem value="replied">Đã phản hồi</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List */}
        <div className="space-y-4 mb-8">
          {paginatedReviews.map((review) => (
            <Card key={review.id} className="p-6">
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
                      {!review.replied && <Badge variant="destructive">Chưa phản hồi</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.fieldName}</p>
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
              </div>

              <p className="text-foreground mb-4">{review.text}</p>

              {review.replied ? (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>Phản hồi của bạn</Badge>
                    <span className="text-sm text-muted-foreground">{review.replyDate}</span>
                  </div>
                  <p className="text-foreground">{review.reply}</p>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedReview(review)
                    setShowReplyDialog(true)
                  }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Phản hồi
                </Button>
              )}
            </Card>
          ))}
        </div>

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

      {/* Reply Dialog */}
      <Dialog open={showReplyDialog} onOpenChange={setShowReplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Phản hồi đánh giá</DialogTitle>
            <DialogDescription>Trả lời đánh giá từ {selectedReview?.author}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < (selectedReview?.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-foreground">{selectedReview?.text}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phản hồi của bạn</label>
              <Textarea
                placeholder="Nhập phản hồi của bạn..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowReplyDialog(false)}>
              Hủy
            </Button>
            <Button onClick={handleSubmitReply} disabled={!reply.trim()}>
              Gửi phản hồi
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}
