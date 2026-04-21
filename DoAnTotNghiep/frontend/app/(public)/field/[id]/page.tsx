"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  MapPin,
  Star,
  Clock,
  Phone,
  Mail,
  ArrowLeft,
  Heart,
  Share2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getFieldDetail,
  type FieldDetailResponse,
} from "@/features/fields/services/get-field-detail";
import { getFieldOwnerInfo } from "@/features/fields/services/get-field-owner-info";
import { getFieldReviews } from "@/features/fields/services/get-field-reviews";

type DetailFieldUi = {
  id: number;
  name: string;
  type: string;
  location: string;
  address: string;
  district: string | null;
  ward: string | null;
  province: string | null;
  price: number;
  rating: number;
  reviewCount: number;
  images: string[];
  description: string;
  amenities: string[];
  hours: string;
  owner: {
    name: string;
    phone: string;
    email: string;
    rating: number;
    reviews: number;
  };
  availability: Record<string, string[]>;
  reviewsPreview: Array<{
    id: number;
    author: string;
    rating: number;
    text: string;
    date: string;
  }>;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN");
}

function mapFieldDetailToUi(
  detail: FieldDetailResponse["data"],
  ownerData?: {
    display_name: string;
    phone: string | null;
    email: string | null;
  } | null,
  reviewsPreviewData?: Array<{
    id: number;
    rating: number | null;
    comment: string | null;
    created_at: string | null;
    user: { name: string };
  }>
): DetailFieldUi {
  const openTime = detail.openTime ?? "--:--";
  const closeTime = detail.closeTime ?? "--:--";

  return {
    id: detail.id,
    name: detail.field_name ?? "Chưa có tên sân",
    type: detail.sport_type ?? "Khác",
    location: detail.address ?? "Chưa cập nhật địa chỉ",
    address: detail.address ?? "Chưa cập nhật địa chỉ",
    district: detail.district ?? null,
    ward: detail.ward ?? null,
    province: detail.province ?? null,
    price: Number(detail.base_price_per_hour ?? 0),
    rating: Number(detail.rating ?? 0),
    reviewCount: Number(detail.reviews ?? 0),
    images: (detail.images ?? []).map((img) => img.url).filter(Boolean),
    description: detail.description ?? "Chưa có mô tả",
    amenities: (detail.facilities ?? []).map((item) => item.name).filter(Boolean),
    hours: `${openTime} - ${closeTime}`,

    owner: {
      name: ownerData?.display_name ?? "Chủ sân đang cập nhật",
      phone: ownerData?.phone ?? "Đang cập nhật",
      email: ownerData?.email ?? "Đang cập nhật",
      rating: Number(detail.rating ?? 0),
      reviews: Number(detail.reviews ?? 0),
    },

    // TODO: thay bằng API thật sau
    availability: {
      "2025-01-15": ["08:00", "09:00", "10:00", "14:00", "15:00"],
      "2025-01-16": ["08:00", "09:00", "10:00", "11:00", "14:00"],
    },

    reviewsPreview:
      reviewsPreviewData?.map((review) => ({
        id: review.id,
        author: review.user?.name ?? "Người dùng",
        rating: review.rating ?? 0,
        text: review.comment ?? "Không có nội dung đánh giá",
        date: formatDate(review.created_at),
      })) ?? [],
  };
}

export default function FieldDetailsPage() {
  const params = useParams<{ id: string }>();
  const fieldId = params?.id;

  const [field, setField] = useState<DetailFieldUi | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!fieldId) return;

    let cancelled = false;

    async function fetchFieldData() {
      try {
        setIsLoading(true);
        setError("");

        const [detailRes, ownerRes, reviewsRes] = await Promise.allSettled([
          getFieldDetail(fieldId),
          getFieldOwnerInfo(fieldId),
          getFieldReviews(fieldId, { page: 1, limit: 3, sort: "newest" }),
        ]);

        if (cancelled) return;

        if (detailRes.status !== "fulfilled") {
          throw new Error("Không thể tải chi tiết sân");
        }

        const detailData = detailRes.value.data;
        const ownerData =
          ownerRes.status === "fulfilled" ? ownerRes.value.data : null;
        const reviewsPreviewData =
          reviewsRes.status === "fulfilled" ? reviewsRes.value.data.items : [];

        setField(mapFieldDetailToUi(detailData, ownerData, reviewsPreviewData));
        setCurrentImageIndex(0);
      } catch (err) {
        if (cancelled) return;
        setField(null);
        setError(err instanceof Error ? err.message : "Không thể tải chi tiết sân");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchFieldData();

    return () => {
      cancelled = true;
    };
  }, [fieldId]);

  const displayImages = useMemo(() => {
    if (!field?.images?.length) return ["/placeholder.svg"];
    return field.images;
  }, [field]);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share && field) {
      try {
        await navigator.share({
          title: field.name,
          text: `Check out ${field.name} on HCMUT Sport`,
          url,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert("Link đã được copy!");
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % displayImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <p className="text-lg text-muted-foreground">Đang tải chi tiết sân...</p>
        </div>
      </main>
    );
  }

  if (error || !field) {
    return (
      <main className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Không tìm thấy sân</h1>
          <p className="text-muted-foreground mt-2">
            {error || "Dữ liệu sân không tồn tại"}
          </p>
          <Link href="/browse">
            <Button className="mt-4">Về danh sách sân</Button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <div className="flex items-center gap-4">
            <button onClick={handleShare} className="p-2 hover:bg-muted rounded-lg transition">
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsWishlisted(!isWishlisted)}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative bg-muted rounded-lg overflow-hidden mb-8">
              <img
                src={displayImages[currentImageIndex] || "/placeholder.svg"}
                alt={field.name}
                className="w-full h-96 object-cover"
              />
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`w-2 h-2 rounded-full transition ${
                      idx === currentImageIndex ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold text-foreground mb-2">{field.name}</h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {field.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {field.rating} ({field.reviewCount} đánh giá)
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">
                    {field.price.toLocaleString()} VND
                  </div>
                  <div className="text-sm text-muted-foreground">mỗi giờ</div>
                </div>
              </div>
            </div>

            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Về sân này</h2>
              <p className="text-muted-foreground mb-6">{field.description}</p>

              <h3 className="text-lg font-bold mb-3">Tiện nghi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {field.amenities.length > 0 ? (
                  field.amenities.map((amenity, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-foreground">
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Chưa có thông tin tiện ích</p>
                )}
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Giờ hoạt động</h3>
              </div>
              <p className="text-foreground">{field.hours}</p>
            </Card>

            <Card className="p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Chủ sân</h3>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground mb-2">{field.owner.name}</h4>
                  <div className="flex items-center gap-1 mb-3">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm">
                      {field.owner.rating} ({field.owner.reviews} đánh giá)
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {field.owner.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      {field.owner.email}
                    </div>
                  </div>
                </div>
                <Button variant="outline">Liên hệ chủ sân</Button>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold">Đánh giá khách hàng</h3>
                <Link href={`/field/${field.id}/reviews`}>
                  <Button variant="outline" size="sm">
                    Xem tất cả ({field.reviewCount})
                  </Button>
                </Link>
              </div>

              <div className="space-y-6">
                {field.reviewsPreview.length > 0 ? (
                  field.reviewsPreview.map((review) => (
                    <div key={review.id} className="pb-6 border-b border-border last:border-b-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-foreground">{review.author}</h4>
                          <div className="flex items-center gap-1">
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
                          </div>
                        </div>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      <p className="text-muted-foreground">{review.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">Chưa có đánh giá nào</p>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Thông tin đặt sân</h3>

              <div className="bg-muted p-4 rounded-lg mb-6">
                <div className="flex justify-between mb-2">
                  <span className="text-muted-foreground">Giá mỗi giờ</span>
                  <span className="font-bold text-primary">
                    {field.price.toLocaleString()} VND
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-3">
                  <p>• Đặt tối thiểu 1 giờ</p>
                  <p>• Phí dịch vụ: 50,000 VND</p>
                  <p>• Xác nhận trong 24h</p>
                </div>
              </div>

              <Link href={`/booking/${field.id}`}>
                <Button className="w-full mb-3">Đặt sân ngay</Button>
              </Link>
              <Button
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => setIsWishlisted(!isWishlisted)}
              >
                {isWishlisted ? "Đã thêm vào yêu thích" : "Thêm vào yêu thích"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}