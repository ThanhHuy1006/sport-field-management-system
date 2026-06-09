"use client";

import { useEffect, useMemo, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
  Flag,
} from "lucide-react";
import {
  getFieldDetail,
  type FieldDetailResponse,
} from "@/features/fields/services/get-field-detail";
import { getFieldOwnerInfo } from "@/features/fields/services/get-field-owner-info";
import { getFieldReviews } from "@/features/fields/services/get-field-reviews";
import {
  getBookingAvailabilitySlots,
  type BookingAvailabilitySlotsResponse,
} from "@/features/bookings/services/get-booking-availability-slots";
import { ReportFieldDialog } from "@/components/report-field-dialog";
import { getImageUrl } from "@/lib/image-url";
import { getStoredUser } from "@/features/auth/lib/auth-storage";
import {
  addFavoriteField,
  checkFavoriteField,
  removeFavoriteField,
} from "@/features/favorites/services/favorites.service";

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

type QuickAvailabilitySlot =
  BookingAvailabilitySlotsResponse["data"]["slots"][number];

type QuickAvailabilitySlotMeta = QuickAvailabilitySlot & {
  status?: string | null;
  booking_status?: string | null;
  is_past?: boolean | null;
  reason?: string | null;
  price_per_hour?: number | string | null;
  currency?: string | null;
};

type QuickAvailabilityWindow = {
  id: number | string;
  start_time: string;
  end_time: string;
};

function getQuickSlotMeta(slot: QuickAvailabilitySlot) {
  return slot as QuickAvailabilitySlotMeta;
}

function getTodayLocalDate() {
  const now = new Date();

  return (
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0")
  );
}

function addDaysToLocalDate(dateStr: string, days: number) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);

  date.setDate(date.getDate() + days);

  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
}

function formatQuickDateLabel(dateStr: string) {
  const today = getTodayLocalDate();
  const tomorrow = addDaysToLocalDate(today, 1);

  if (dateStr === today) return "Hôm nay";
  if (dateStr === tomorrow) return "Ngày mai";

  const [year, month, day] = dateStr.split("-").map(Number);

  return new Date(year, month - 1, day).toLocaleDateString("vi-VN");
}

function isBookedQuickSlot(slot: QuickAvailabilitySlot) {
  const slotMeta = getQuickSlotMeta(slot);
  const status = String(slotMeta.status ?? "").toLowerCase();
  const bookingStatus = String(slotMeta.booking_status ?? "").toUpperCase();
  const reason = String(slotMeta.reason ?? "").toLowerCase();

  return (
    status === "booked" ||
    [
      "PENDING_CONFIRM",
      "APPROVED",
      "AWAITING_PAYMENT",
      "PAID",
      "CHECKED_IN",
    ].includes(bookingStatus) ||
    reason.includes("đã được đặt") ||
    reason.includes("da duoc dat")
  );
}

function isPastQuickSlot(slot: QuickAvailabilitySlot) {
  const slotMeta = getQuickSlotMeta(slot);
  const status = String(slotMeta.status ?? "").toLowerCase();
  const reason = String(slotMeta.reason ?? "").toLowerCase();

  return (
    status === "past" ||
    Boolean(slotMeta.is_past) ||
    reason.includes("đã qua") ||
    reason.includes("da qua")
  );
}

function getQuickSlotLabel(slot: QuickAvailabilitySlot) {
  const slotMeta = getQuickSlotMeta(slot);

  if (slot.available) return "Còn trống";

  if (isBookedQuickSlot(slot)) return "Đã đặt";

  if (isPastQuickSlot(slot)) return "Đã qua";

  if (slotMeta.reason) return slotMeta.reason;

  return "Không khả dụng";
}

function getQuickSlotClassName(slot: QuickAvailabilitySlot) {
  if (slot.available) {
    return "border-primary/60 bg-primary/10 text-foreground hover:border-primary";
  }

  if (isBookedQuickSlot(slot)) {
    return "border-yellow-500/70 bg-yellow-500/10 text-yellow-100";
  }

  if (isPastQuickSlot(slot)) {
    return "border-border bg-muted/70 text-muted-foreground opacity-60";
  }

  return "border-border bg-muted text-muted-foreground";
}

function getQuickSlotPricePerHour(slot: QuickAvailabilitySlot) {
  const slotMeta = getQuickSlotMeta(slot);
  const rawPrice = slotMeta.price_per_hour;

  if (rawPrice === undefined || rawPrice === null || rawPrice === "") {
    return null;
  }

  const price = Number(rawPrice);

  return Number.isFinite(price) ? price : null;
}

function getQuickSlotCurrency(slot: QuickAvailabilitySlot) {
  const slotMeta = getQuickSlotMeta(slot);

  return slotMeta.currency || "VND";
}

function normalizeTime(value: string | null | undefined) {
  return String(value || "").slice(0, 5);
}

function createGroupsFromContinuousSlots(slots: QuickAvailabilitySlot[]) {
  if (slots.length === 0) return [];

  const sortedSlots = [...slots].sort((a, b) =>
    normalizeTime(a.start_time).localeCompare(normalizeTime(b.start_time))
  );

  const groups: Array<{
    id: number;
    label: string;
    time: string;
    slots: QuickAvailabilitySlot[];
  }> = [];

  let currentGroup: QuickAvailabilitySlot[] = [];

  for (const slot of sortedSlots) {
    const previousSlot = currentGroup[currentGroup.length - 1];

    if (
      previousSlot &&
      normalizeTime(previousSlot.end_time) !== normalizeTime(slot.start_time)
    ) {
      const firstSlot = currentGroup[0];
      const lastSlot = currentGroup[currentGroup.length - 1];

      groups.push({
        id: groups.length + 1,
        label: `Ca ${groups.length + 1}`,
        time: `${normalizeTime(firstSlot.start_time)} - ${normalizeTime(
          lastSlot.end_time
        )}`,
        slots: currentGroup,
      });

      currentGroup = [];
    }

    currentGroup.push(slot);
  }

  if (currentGroup.length > 0) {
    const firstSlot = currentGroup[0];
    const lastSlot = currentGroup[currentGroup.length - 1];

    groups.push({
      id: groups.length + 1,
      label: `Ca ${groups.length + 1}`,
      time: `${normalizeTime(firstSlot.start_time)} - ${normalizeTime(
        lastSlot.end_time
      )}`,
      slots: currentGroup,
    });
  }

  return groups;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("vi-VN");
}

function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
  const img = event.currentTarget;

  if (img.src.includes("/placeholder.svg")) return;

  img.src = "/placeholder.svg";
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

  const images = [...(detail.images ?? [])]
    .sort((a, b) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;

      return Number(a.order_no ?? 0) - Number(b.order_no ?? 0);
    })
    .map((img) => img.url)
    .filter(Boolean);

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
    images,
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
  const router = useRouter();
  const fieldId = params?.id;

  const [field, setField] = useState<DetailFieldUi | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isFavoriteLoading, setIsFavoriteLoading] = useState(false);
  const [favoriteError, setFavoriteError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isReportOpen, setIsReportOpen] = useState(false);

  const [quickDate, setQuickDate] = useState(getTodayLocalDate());
  const [quickSlots, setQuickSlots] = useState<QuickAvailabilitySlot[]>([]);
  const [quickWindows, setQuickWindows] = useState<QuickAvailabilityWindow[]>([]);
  const [isQuickAvailabilityLoading, setIsQuickAvailabilityLoading] =
    useState(false);
  const [quickAvailabilityError, setQuickAvailabilityError] = useState("");

  const storedUser = getStoredUser();
  const currentRole = String(storedUser?.role ?? "").toUpperCase();
  const canBookField = !storedUser || currentRole === "USER";
  const canUseFavorite = Boolean(storedUser) && currentRole === "USER";

  useEffect(() => {
    if (!fieldId) return;

    if (!canUseFavorite) {
      setIsWishlisted(false);
      setFavoriteError("");
      return;
    }

    const numericFieldId = Number(fieldId);

    if (Number.isNaN(numericFieldId)) return;

    let cancelled = false;

    async function fetchFavoriteStatus() {
      try {
        setFavoriteError("");

        const result = await checkFavoriteField(numericFieldId);

        if (cancelled) return;

        setIsWishlisted(Boolean(result.data.is_favorite));
      } catch (err) {
        if (cancelled) return;

        setIsWishlisted(false);
        console.error("Không thể kiểm tra trạng thái yêu thích:", err);
      }
    }

    fetchFavoriteStatus();

    return () => {
      cancelled = true;
    };
  }, [fieldId, canUseFavorite]);

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
        setError(
          err instanceof Error ? err.message : "Không thể tải chi tiết sân"
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchFieldData();

    return () => {
      cancelled = true;
    };
  }, [fieldId]);

  useEffect(() => {
    if (!fieldId || !quickDate) return;

    const numericFieldId = Number(fieldId);

    if (Number.isNaN(numericFieldId)) return;

    let cancelled = false;

    async function fetchQuickAvailability() {
      try {
        setIsQuickAvailabilityLoading(true);
        setQuickAvailabilityError("");

        const result = await getBookingAvailabilitySlots({
          field_id: numericFieldId,
          date: quickDate,
          duration_minutes: 60,
        });

        if (cancelled) return;

        const responseData = result.data as BookingAvailabilitySlotsResponse["data"] & {
          windows?: QuickAvailabilityWindow[];
        };

        setQuickSlots(responseData.slots ?? []);
        setQuickWindows(responseData.windows ?? []);
      } catch (err) {
        if (cancelled) return;

        setQuickSlots([]);
        setQuickWindows([]);
        setQuickAvailabilityError(
          err instanceof Error ? err.message : "Không thể tải lịch trống nhanh"
        );
      } finally {
        if (!cancelled) setIsQuickAvailabilityLoading(false);
      }
    }

    fetchQuickAvailability();

    return () => {
      cancelled = true;
    };
  }, [fieldId, quickDate]);

  const displayImages = useMemo(() => {
    if (!field?.images?.length) return ["/placeholder.svg"];

    return field.images.map((image) => getImageUrl(image));
  }, [field]);

  const quickSlotGroups = useMemo(() => {
    const futureOrAvailableSlots = quickSlots.filter(
      (slot) => slot.available || !isPastQuickSlot(slot)
    );

    const source =
      futureOrAvailableSlots.length > 0 ? futureOrAvailableSlots : quickSlots;

    if (source.length === 0) return [];

    if (quickWindows.length > 0) {
      return quickWindows
        .map((windowItem, index) => {
          const windowStart = normalizeTime(windowItem.start_time);
          const windowEnd = normalizeTime(windowItem.end_time);

          const slots = source.filter((slot) => {
            const slotStart = normalizeTime(slot.start_time);
            const slotEnd = normalizeTime(slot.end_time);

            return slotStart >= windowStart && slotEnd <= windowEnd;
          });

          return {
            id: windowItem.id,
            label: `Ca ${index + 1}`,
            time: `${windowStart} - ${windowEnd}`,
            slots,
          };
        })
        .filter((group) => group.slots.length > 0);
    }

    return createGroupsFromContinuousSlots(source);
  }, [quickSlots, quickWindows]);

  const handleToggleWishlist = async () => {
    if (!field || isFavoriteLoading) return;

    const user = getStoredUser();
    const role = String(user?.role ?? "").toUpperCase();

    if (!user) {
      router.push(`/login?redirect=/field/${field.id}`);
      return;
    }

    if (role !== "USER") {
      setFavoriteError("Chỉ khách hàng mới được sử dụng chức năng yêu thích");
      return;
    }

    try {
      setIsFavoriteLoading(true);
      setFavoriteError("");

      if (isWishlisted) {
        await removeFavoriteField(field.id);
        setIsWishlisted(false);
      } else {
        await addFavoriteField(field.id);
        setIsWishlisted(true);
      }
    } catch (err) {
      setFavoriteError(
        err instanceof Error ? err.message : "Không thể cập nhật yêu thích",
      );
    } finally {
      setIsFavoriteLoading(false);
    }
  };

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
    setCurrentImageIndex(
      (prev) => (prev - 1 + displayImages.length) % displayImages.length
    );
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div
          data-cy="field-detail-loading"
          className="max-w-7xl mx-auto px-4 py-12 text-center"
        >
          <p className="text-lg text-muted-foreground">
            Đang tải chi tiết sân...
          </p>
        </div>
      </main>
    );
  }

  if (error || !field) {
    return (
      <main className="min-h-screen bg-background">
        <div
          data-cy="field-detail-error"
          className="max-w-7xl mx-auto px-4 py-12 text-center"
        >
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
          <Link
            data-cy="field-back-link"
            href="/browse"
            className="flex items-center gap-2 text-primary hover:text-primary/80"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>

          <div className="flex items-center gap-4">
            <button
              data-cy="field-share-button"
              onClick={handleShare}
              className="p-2 hover:bg-muted rounded-lg transition"
            >
              <Share2 className="w-5 h-5" />
            </button>

            <button
              data-cy="field-header-wishlist-button"
              type="button"
              onClick={handleToggleWishlist}
              disabled={isFavoriteLoading}
              title={isWishlisted ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
              className="p-2 hover:bg-muted rounded-lg transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Heart
                className={`w-5 h-5 ${
                  isWishlisted ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
              <img
                data-cy="field-main-image"
                src={displayImages[currentImageIndex] || "/placeholder.svg"}
                alt={field.name}
                onError={handleImageError}
                className="w-full h-96 object-cover"
              />

              <div className="absolute top-4 right-4 rounded-full bg-black/60 px-3 py-1 text-sm text-white">
                {currentImageIndex + 1} / {displayImages.length}
              </div>

              {displayImages.length > 1 && (
                <>
                  <button
                    data-cy="field-image-prev"
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>

                  <button
                    data-cy="field-image-next"
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full transition"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {displayImages.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2 h-2 rounded-full transition ${
                          idx === currentImageIndex ? "bg-white" : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-5 gap-3 mb-8">
              {displayImages.map((image, idx) => (
                <button
                  data-cy="field-image-thumbnail"
                  key={`${image}-${idx}`}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`h-20 sm:h-24 overflow-hidden rounded-lg border transition ${
                    idx === currentImageIndex
                      ? "border-primary ring-2 ring-primary/30"
                      : "border-border hover:border-primary/60"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${field.name} ảnh ${idx + 1}`}
                    onError={handleImageError}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            <div className="mb-8">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1
                    data-cy="field-detail-name"
                    className="text-4xl font-bold text-foreground mb-2"
                  >
                    {field.name}
                  </h1>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-muted-foreground">
                    <div
                      data-cy="field-detail-location"
                      className="flex items-center gap-1"
                    >
                      <MapPin className="w-4 h-4" />
                      {field.location}
                    </div>

                    <div
                      data-cy="field-detail-rating"
                      className="flex items-center gap-1"
                    >
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      {field.rating} ({field.reviewCount} đánh giá)
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div
                    data-cy="field-detail-price"
                    className="text-3xl font-bold text-primary"
                  >
                    {field.price.toLocaleString()} VND
                  </div>
                  <div className="text-sm text-muted-foreground">mỗi giờ</div>
                </div>
              </div>
            </div>

            <Card className="p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Về sân này</h2>
              <p
                data-cy="field-detail-description"
                className="text-muted-foreground mb-6"
              >
                {field.description}
              </p>

              <h3 className="text-lg font-bold mb-3">Tiện nghi</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {field.amenities.length > 0 ? (
                  field.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 text-foreground"
                    >
                      <div className="w-2 h-2 bg-primary rounded-full" />
                      {amenity}
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">
                    Chưa có thông tin tiện ích
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">Giờ hoạt động</h3>
              </div>

              <div data-cy="field-detail-hours" className="mb-6">
                {quickWindows.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">
                      Theo ngày đang xem:{" "}
                      <span className="font-medium text-foreground">
                        {formatQuickDateLabel(quickDate)}
                      </span>
                    </p>

                    <div className="space-y-2">
                      {quickWindows.map((windowItem, index) => (
                        <div
                          key={
                            windowItem.id ??
                            `${windowItem.start_time}-${windowItem.end_time}`
                          }
                          className="flex items-center justify-between rounded-lg border border-border bg-muted/30 px-4 py-3"
                        >
                          <span className="font-semibold text-foreground">
                            Ca {index + 1}
                          </span>

                          <span className="font-medium text-foreground">
                            {normalizeTime(windowItem.start_time)} -{" "}
                            {normalizeTime(windowItem.end_time)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-foreground">{field.hours}</p>
                )}
              </div>

              <div className="border-t border-border pt-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-foreground">
                      Lịch trống nhanh
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Xem nhanh khung giờ theo từng ca hoạt động của sân.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickDate(getTodayLocalDate())}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        quickDate === getTodayLocalDate()
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      Hôm nay
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setQuickDate(addDaysToLocalDate(getTodayLocalDate(), 1))
                      }
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        quickDate === addDaysToLocalDate(getTodayLocalDate(), 1)
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:border-primary/60"
                      }`}
                    >
                      Ngày mai
                    </button>

                    <input
                      type="date"
                      min={getTodayLocalDate()}
                      value={quickDate}
                      onChange={(event) => setQuickDate(event.target.value)}
                      className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div className="mb-3 text-sm text-muted-foreground">
                  Đang xem:{" "}
                  <span className="font-medium text-foreground">
                    {formatQuickDateLabel(quickDate)}
                  </span>
                </div>

                {isQuickAvailabilityLoading ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Đang tải lịch trống nhanh...
                  </div>
                ) : quickAvailabilityError ? (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                    {quickAvailabilityError}
                  </div>
                ) : quickSlotGroups.length === 0 ? (
                  <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    Không có khung giờ khả dụng trong ngày này.
                  </div>
                ) : (
                  <>
                    <div className="space-y-5">
                      {quickSlotGroups.map((group) => (
                        <div
                          key={group.id}
                          className="rounded-xl border border-border bg-background p-4"
                        >
                          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <h5 className="font-semibold text-foreground">
                                {group.label}
                              </h5>
                              <p className="text-sm text-muted-foreground">
                                {group.time}
                              </p>
                            </div>

                            <span className="text-xs text-muted-foreground">
                              {group.slots.filter((slot) => slot.available).length} slot trống
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                            {group.slots.map((slot) => {
                              const slotPrice = getQuickSlotPricePerHour(slot);
                              const slotCurrency = getQuickSlotCurrency(slot);

                              return (
                                <div
                                  key={`${slot.start_datetime}-${slot.end_datetime}`}
                                  className={`rounded-lg border px-3 py-3 text-center text-sm transition ${getQuickSlotClassName(
                                    slot
                                  )}`}
                                >
                                  <div className="font-bold">
                                    {slot.start_time} - {slot.end_time}
                                  </div>

                                  <div className="mt-1 text-[11px]">
                                    {getQuickSlotLabel(slot)}
                                  </div>

                                  {slotPrice !== null && (
                                    <div className="mt-1 text-[11px] font-semibold">
                                      {slotPrice.toLocaleString("vi-VN")} {slotCurrency}/giờ
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                          Còn trống
                        </span>

                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                          Đã đặt
                        </span>

                        <span className="flex items-center gap-1.5">
                          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/60" />
                          Đã qua
                        </span>
                      </div>

                      <Link href={`/booking/${field.id}`}>
                        <Button size="sm" variant="outline">
                          Xem tất cả khung giờ
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6 mb-8">
              <h3 className="text-lg font-bold mb-4">Chủ sân</h3>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-foreground mb-2">
                    {field.owner.name}
                  </h4>

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
                    <div
                      key={review.id}
                      className="pb-6 border-b border-border last:border-b-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-foreground">
                            {review.author}
                          </h4>

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

                        <span className="text-sm text-muted-foreground">
                          {review.date}
                        </span>
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
            <Card data-cy="field-booking-card" className="p-6 sticky top-24">
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

              {canBookField ? (
                <Link
                  data-cy="go-to-booking-link"
                  href={`/booking/${field.id}`}
                >
                  <Button data-cy="go-to-booking-button" className="w-full mb-3">
                    Đặt sân ngay
                  </Button>
                </Link>
              ) : (
                <Button
                  data-cy="booking-disabled-button"
                  className="w-full mb-3"
                  disabled
                >
                  Chỉ khách hàng mới được đặt sân
                </Button>
              )}

              <Button
                data-cy="field-wishlist-button"
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={handleToggleWishlist}
                disabled={isFavoriteLoading}
              >
                {isFavoriteLoading
                  ? "Đang xử lý..."
                  : isWishlisted
                    ? "Đã thêm vào yêu thích"
                    : "Thêm vào yêu thích"}
              </Button>

              {favoriteError && (
                <p className="mt-2 text-sm text-destructive">
                  {favoriteError}
                </p>
              )}

              <Button
                data-cy="report-field-button"
                variant="ghost"
                className="mt-3 w-full text-muted-foreground hover:text-destructive"
                onClick={() => setIsReportOpen(true)}
              >
                <Flag className="mr-2 h-4 w-4" />
                Báo cáo sân
              </Button>
            </Card>
          </div>
        </div>
      </div>

      <ReportFieldDialog
        open={isReportOpen}
        onOpenChange={setIsReportOpen}
        fieldId={field.id}
        fieldName={field.name}
      />
    </main>
  );
}