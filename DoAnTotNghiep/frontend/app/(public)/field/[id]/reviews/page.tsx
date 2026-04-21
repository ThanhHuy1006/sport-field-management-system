"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Star, ThumbsUp, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getFieldDetail } from "@/features/fields/services/get-field-detail";
import { getFieldReviews } from "@/features/fields/services/get-field-reviews";

type ReviewUi = {
  id: number;
  author: string;
  avatar: string | null;
  rating: number;
  text: string;
  date: string;
  helpful: number;
  verified: boolean;
  images: string[];
  ownerReply?: {
    text: string;
    date: string;
  };
};

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

function mapApiSort(sortBy: string) {
  switch (sortBy) {
    case "highest":
      return "rating_desc";
    case "lowest":
      return "rating_asc";
    case "oldest":
      return "oldest";
    case "recent":
    default:
      return "newest";
  }
}

export default function FieldReviewsPage() {
  const params = useParams<{ id: string }>();
  const fieldId = params?.id;

  const [fieldName, setFieldName] = useState("Sân thể thao");
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [ratingBreakdown, setRatingBreakdown] = useState<Record<string, number>>({});
  const [reviews, setReviews] = useState<ReviewUi[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recent");
  const [filterRating, setFilterRating] = useState("all");
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [totalPages, setTotalPages] = useState(1);

  const itemsPerPage = 10;

  useEffect(() => {
    if (!fieldId) return;

    let cancelled = false;

    async function fetchPageData() {
      try {
        setIsLoading(true);
        setError("");

        const [detailRes, reviewsRes] = await Promise.all([
          getFieldDetail(fieldId),
          getFieldReviews(fieldId, {
            page: currentPage,
            limit: itemsPerPage,
            sort: mapApiSort(sortBy),
            rating: filterRating === "all" ? undefined : Number(filterRating),
          }),
        ]);

        if (cancelled) return;

        setFieldName(detailRes.data.field_name ?? "Sân thể thao");

        setAverageRating(reviewsRes.data.summary?.averageRating ?? 0);
        setTotalReviews(reviewsRes.data.summary?.totalReviews ?? 0);
        setRatingBreakdown(reviewsRes.data.summary?.ratingBreakdown ?? {});
        setTotalPages(reviewsRes.data.pagination?.totalPages ?? 1);

        const mappedReviews: ReviewUi[] = (reviewsRes.data.items ?? []).map((review) => ({
          id: review.id,
          author: review.user?.name ?? "Người dùng",
          avatar: review.user?.avatar_url ?? "/placeholder.svg",
          rating: review.rating ?? 0,
          text: review.comment ?? "Không có nội dung đánh giá",
          date: formatDate(review.created_at),
          helpful: 0,
          verified: true,
          images: [],
          ownerReply: review.reply_text
            ? {
                text: review.reply_text,
                date: formatDate(review.reply_at),
              }
            : undefined,
        }));

        setReviews(mappedReviews);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Không thể tải đánh giá");
        setReviews([]);
        setAverageRating(0);
        setTotalReviews(0);
        setRatingBreakdown({});
        setTotalPages(1);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchPageData();

    return () => {
      cancelled = true;
    };
  }, [fieldId, currentPage, sortBy, filterRating]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, filterRating]);

  const ratingRows = useMemo(() => [5, 4, 3, 2, 1], []);

  const handleHelpful = (reviewId: number) => {
    console.log("Mark helpful:", reviewId);
  };

  const handleReport = () => {
    console.log("Report review:", selectedReview, reportReason);
    setShowReportDialog(false);
    setReportReason("");
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Đang tải đánh giá...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không thể tải đánh giá</h1>
          <p className="text-muted-foreground mt-2">{error}</p>
          <Link href={`/field/${fieldId}`}>
            <Button className="mt-4">Quay lại chi tiết sân</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/field/${fieldId}`} className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Đánh giá khách hàng</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">{fieldName}</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center text-center border-r border-border">
              <div className="text-6xl font-bold text-primary mb-2">{averageRating}</div>
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-6 h-6 ${
                      i < Math.round(averageRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <p className="text-muted-foreground">Dựa trên {totalReviews} đánh giá</p>
            </div>

            <div className="space-y-3">
              {ratingRows.map((rating) => {
                const count = ratingBreakdown[String(rating)] ?? 0;
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;

                return (
                  <div key={rating} className="flex items-center gap-3">
                    <span className="w-3 text-sm">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm text-muted-foreground w-10">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filterRating === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterRating("all")}
              >
                Tất cả
              </Button>
              {[5, 4, 3, 2, 1].map((rating) => (
                <Button
                  key={rating}
                  variant={filterRating === String(rating) ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterRating(String(rating))}
                >
                  {rating} sao
                </Button>
              ))}
            </div>

            <select
              className="border border-border rounded-md px-3 py-2 bg-background"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="recent">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="highest">Điểm cao nhất</option>
              <option value="lowest">Điểm thấp nhất</option>
            </select>
          </div>
        </Card>

        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex items-start gap-4">
                  <img
                    src={review.avatar || "/placeholder.svg"}
                    alt={review.author}
                    className="w-12 h-12 rounded-full object-cover"
                  />

                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold">{review.author}</h3>
                          {review.verified && (
                            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                              Đã xác thực
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground"
                              }`}
                            />
                          ))}
                          <span className="text-sm text-muted-foreground ml-2">{review.date}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-4">{review.text}</p>

                    {review.ownerReply && (
                      <div className="bg-muted rounded-lg p-4 mb-4">
                        <p className="font-medium mb-1">Phản hồi từ chủ sân</p>
                        <p className="text-muted-foreground">{review.ownerReply.text}</p>
                        <p className="text-xs text-muted-foreground mt-2">{review.ownerReply.date}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleHelpful(review.id)}
                        className="gap-2"
                      >
                        <ThumbsUp className="w-4 h-4" />
                        Hữu ích ({review.helpful})
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedReview(review.id);
                          setShowReportDialog(true);
                        }}
                        className="gap-2"
                      >
                        <Flag className="w-4 h-4" />
                        Báo cáo
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <Card className="p-6 text-center">
              <p className="text-muted-foreground">Chưa có đánh giá nào phù hợp</p>
            </Card>
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
        )}

        {showReportDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
            <Card className="w-full max-w-md p-6">
              <h3 className="text-lg font-bold mb-4">Báo cáo đánh giá</h3>
              <textarea
                className="w-full min-h-[120px] border border-border rounded-md px-3 py-2 bg-background"
                placeholder="Nhập lý do báo cáo..."
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setShowReportDialog(false)}>
                  Hủy
                </Button>
                <Button onClick={handleReport}>Gửi báo cáo</Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}