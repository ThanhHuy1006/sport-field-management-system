"use client";

import type React from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Clock,
  DollarSign,
  MapPin,
  Info,
  ImageIcon,
  Dumbbell,
  Star,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  createOwnerField,
  uploadOwnerFieldImages,
  type CreateOwnerFieldPayload,
} from "@/features/fields/services/owner-fields.service";

type SelectedImage = {
  file: File;
  previewUrl: string;
};

type OperatingHourItem = {
  day_of_week: number;
  label: string;
  short: string;
  open_time: string;
  close_time: string;
  is_closed: boolean;
};

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const DEFAULT_OPERATING_HOURS: OperatingHourItem[] = [
  {
    day_of_week: 1,
    label: "Thứ 2",
    short: "T2",
    open_time: "06:00",
    close_time: "22:00",
    is_closed: false,
  },
  {
    day_of_week: 2,
    label: "Thứ 3",
    short: "T3",
    open_time: "06:00",
    close_time: "22:00",
    is_closed: false,
  },
  {
    day_of_week: 3,
    label: "Thứ 4",
    short: "T4",
    open_time: "06:00",
    close_time: "22:00",
    is_closed: false,
  },
  {
    day_of_week: 4,
    label: "Thứ 5",
    short: "T5",
    open_time: "06:00",
    close_time: "22:00",
    is_closed: false,
  },
  {
    day_of_week: 5,
    label: "Thứ 6",
    short: "T6",
    open_time: "06:00",
    close_time: "22:00",
    is_closed: false,
  },
  {
    day_of_week: 6,
    label: "Thứ 7",
    short: "T7",
    open_time: "06:00",
    close_time: "23:00",
    is_closed: false,
  },
  {
    day_of_week: 7,
    label: "Chủ nhật",
    short: "CN",
    open_time: "06:00",
    close_time: "23:00",
    is_closed: false,
  },
];

const SPORT_OPTIONS = [
  { value: "Bóng đá", label: "Bóng đá" },
  { value: "Bóng rổ", label: "Bóng rổ" },
  { value: "Tennis", label: "Tennis" },
  { value: "Cầu lông", label: "Cầu lông" },
  { value: "Bóng chuyền", label: "Bóng chuyền" },
  { value: "Pickleball", label: "Pickleball" },
];

const SUGGESTED_AMENITIES = [
  "Bãi đỗ xe",
  "Phòng thay đồ",
  "Nhà vệ sinh",
  "Căng tin",
  "Đèn chiếu sáng",
  "WiFi",
];

function SectionHeader({
  step,
  icon: Icon,
  title,
  description,
}: {
  step: number;
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-4 mb-6">
      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">
            Bước {step}
          </span>
        </div>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}

export default function NewFieldPage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedImagesRef = useRef<SelectedImage[]>([]);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    province: "TP. Hồ Chí Minh",
    district: "",
    ward: "",
    addressLine: "",
    capacity: "",
    description: "",
  });
  const [pricing, setPricing] = useState({
    weekdayPrice: "",
    weekendPrice: "",
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [operatingHours, setOperatingHours] = useState<OperatingHourItem[]>(
    DEFAULT_OPERATING_HOURS,
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current.forEach((img) =>
        URL.revokeObjectURL(img.previewUrl),
      );
    };
  }, []);

  const clearError = (key: string) => {
    if (!errors[key]) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateOperatingHour = (
    dayOfWeek: number,
    key: "open_time" | "close_time" | "is_closed",
    value: string | boolean,
  ) => {
    setOperatingHours((prev) =>
      prev.map((item) =>
        item.day_of_week === dayOfWeek ? { ...item, [key]: value } : item,
      ),
    );
    clearError("operatingHours");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sân";
    if (!formData.type) newErrors.type = "Vui lòng chọn loại thể thao";
    if (!formData.district.trim())
      newErrors.district = "Vui lòng nhập quận/huyện";
    if (!formData.addressLine.trim())
      newErrors.addressLine = "Vui lòng nhập địa chỉ chi tiết";

    const weekdayPrice = Number.parseInt(pricing.weekdayPrice, 10);
    if (!pricing.weekdayPrice)
      newErrors.weekdayPrice = "Vui lòng nhập giá ngày thường";
    else if (Number.isNaN(weekdayPrice) || weekdayPrice <= 0)
      newErrors.weekdayPrice = "Giá phải là số dương";
    else if (weekdayPrice < 50000)
      newErrors.weekdayPrice = "Giá tối thiểu 50,000 VND";

    const weekendPrice = Number.parseInt(pricing.weekendPrice, 10);
    if (!pricing.weekendPrice)
      newErrors.weekendPrice = "Vui lòng nhập giá cuối tuần";
    else if (Number.isNaN(weekendPrice) || weekendPrice <= 0)
      newErrors.weekendPrice = "Giá phải là số dương";
    else if (weekendPrice < 50000)
      newErrors.weekendPrice = "Giá tối thiểu 50,000 VND";

    const capacity = Number.parseInt(formData.capacity, 10);
    if (!formData.capacity) newErrors.capacity = "Vui lòng nhập sức chứa";
    else if (Number.isNaN(capacity) || capacity <= 0)
      newErrors.capacity = "Sức chứa phải là số dương";
    else if (capacity > 100) newErrors.capacity = "Sức chứa tối đa 100 người";

    // for (const item of operatingHours) {
    //   if (!item.is_closed) {
    //     if (!item.open_time || !item.close_time) {
    //       newErrors.operatingHours = "Ngày mở cửa phải có giờ mở và đóng cửa"
    //       break
    //     }
    //     if (item.open_time >= item.close_time) {
    //       newErrors.operatingHours = `${item.label}: giờ mở cửa phải trước giờ đóng cửa`
    //       break
    //     }
    //   }
    // }
    const openDaysCount = operatingHours.filter(
      (item) => !item.is_closed,
    ).length;

    if (openDaysCount === 0) {
      newErrors.operatingHours = "Sân phải mở cửa ít nhất 1 ngày trong tuần";
    } else {
      for (const item of operatingHours) {
        if (!item.is_closed) {
          if (!item.open_time || !item.close_time) {
            newErrors.operatingHours = "Ngày mở cửa phải có giờ mở và đóng cửa";
            break;
          }

          if (item.open_time >= item.close_time) {
            newErrors.operatingHours = `${item.label}: giờ mở cửa phải trước giờ đóng cửa`;
            break;
          }
        }
      }
    }

    if (selectedImages.length === 0)
      newErrors.images = "Vui lòng chọn ít nhất 1 ảnh sân";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const processFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const remainingSlots = MAX_IMAGES - selectedImages.length;
    if (remainingSlots <= 0) {
      toast({
        title: "Đã đạt giới hạn ảnh",
        description: `Tối đa ${MAX_IMAGES} ảnh.`,
        variant: "destructive",
      });
      return;
    }
    const accepted: SelectedImage[] = [];
    for (const file of fileArray.slice(0, remainingSlots)) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        toast({
          title: "Định dạng không hỗ trợ",
          description: "Chỉ hỗ trợ JPG, PNG, WEBP.",
          variant: "destructive",
        });
        continue;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        toast({
          title: "Ảnh quá lớn",
          description: "Mỗi ảnh tối đa 5MB.",
          variant: "destructive",
        });
        continue;
      }
      accepted.push({ file, previewUrl: URL.createObjectURL(file) });
    }
    if (accepted.length > 0) {
      setSelectedImages((prev) => [...prev, ...accepted]);
      clearError("images");
    }
  };

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => {
      const img = prev[index];
      if (img) URL.revokeObjectURL(img.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const addAmenity = (value?: string) => {
    const v = (value ?? newAmenity).trim();
    if (!v) return;
    if (amenities.some((a) => a.toLowerCase() === v.toLowerCase())) {
      setNewAmenity("");
      return;
    }
    setAmenities([...amenities, v]);
    setNewAmenity("");
  };

  const removeAmenity = (index: number) =>
    setAmenities(amenities.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng kiểm tra lại các trường bắt buộc.",
        variant: "destructive",
      });
      return;
    }
    try {
      setIsSubmitting(true);
      const addressLine = formData.addressLine.trim();
      const ward = formData.ward.trim() || null;
      const district = formData.district.trim();
      const province = formData.province.trim();
      const fullAddress = [addressLine, ward, district, province]
        .filter(Boolean)
        .join(", ");
      const weekdayPrice = Number.parseInt(pricing.weekdayPrice, 10);
      const weekendPrice = Number.parseInt(pricing.weekendPrice, 10);

      const payload: CreateOwnerFieldPayload = {
        field_name: formData.name.trim(),
        sport_type: formData.type,
        description: formData.description.trim() || null,
        address: fullAddress,
        address_line: addressLine,
        ward,
        district,
        province,
        base_price_per_hour: weekdayPrice,
        weekday_price: weekdayPrice,
        weekend_price: weekendPrice,
        currency: "VND",
        min_duration_minutes: 60,
        max_players: Number.parseInt(formData.capacity, 10),
        amenities,
        operating_hours: operatingHours.map((item) => ({
          day_of_week: item.day_of_week,
          open_time: item.is_closed ? null : item.open_time,
          close_time: item.is_closed ? null : item.close_time,
          is_closed: item.is_closed,
        })),
      };

      const createdField = await createOwnerField(payload);
      const fieldId = createdField.data.id;
      await uploadOwnerFieldImages(
        fieldId,
        selectedImages.map((img) => img.file),
      );

      toast({
        title: "Gửi duyệt thành công!",
        description: `Sân "${formData.name}" đang chờ admin duyệt.`,
      });
      router.push("/owner/fields");
      router.refresh();
    } catch (error) {
      toast({
        title: "Không thể tạo sân",
        description:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (val: string) => {
    const n = Number.parseInt(val, 10);
    if (Number.isNaN(n)) return "";
    return n.toLocaleString("vi-VN") + " ₫/giờ";
  };

  const openDays = operatingHours.filter((h) => !h.is_closed).length;

  return (
    <main className="min-h-screen bg-muted/30">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/owner/fields"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Link>
          <h1 className="text-base font-semibold text-foreground">
            Thêm sân mới
          </h1>
          <Badge variant="outline" className="text-xs">
            Chờ duyệt
          </Badge>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form - Left */}
            <div className="lg:col-span-2 space-y-4">
              {/* Section 1: Thông tin cơ bản */}
              <Card className="p-6">
                <SectionHeader
                  step={1}
                  icon={Dumbbell}
                  title="Thông tin cơ bản"
                  description="Tên, loại thể thao và mô tả sân"
                />
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium">
                      Tên sân <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="name"
                      placeholder="Ví dụ: Sân Bóng Đá Green Valley"
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        clearError("name");
                      }}
                      className={`mt-1.5 ${errors.name ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">
                        Loại thể thao <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={formData.type}
                        onValueChange={(v) => {
                          setFormData({ ...formData, type: v });
                          clearError("type");
                        }}
                      >
                        <SelectTrigger
                          className={`mt-1.5 ${errors.type ? "border-red-500" : ""}`}
                        >
                          <SelectValue placeholder="Chọn loại thể thao" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPORT_OPTIONS.map((s) => (
                            <SelectItem key={s.value} value={s.value}>
                              {s.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.type}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="capacity" className="text-sm font-medium">
                        Sức chứa <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="capacity"
                          type="number"
                          placeholder="22"
                          min={1}
                          max={100}
                          value={formData.capacity}
                          onChange={(e) => {
                            setFormData({
                              ...formData,
                              capacity: e.target.value,
                            });
                            clearError("capacity");
                          }}
                          className={`pr-12 ${errors.capacity ? "border-red-500" : ""}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          người
                        </span>
                      </div>
                      {errors.capacity && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.capacity}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium"
                    >
                      Mô tả
                    </Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chi tiết về sân, tiêu chuẩn mặt sân, thiết bị hỗ trợ..."
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      className="mt-1.5 resize-none"
                    />
                  </div>
                </div>
              </Card>

              {/* Section 2: Vị trí */}
              <Card className="p-6">
                <SectionHeader
                  step={2}
                  icon={MapPin}
                  title="Vị trí sân"
                  description="Địa chỉ chính xác để khách tìm đến sân"
                />
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="province" className="text-sm font-medium">
                        Tỉnh/Thành phố
                      </Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) =>
                          setFormData({ ...formData, province: e.target.value })
                        }
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="district" className="text-sm font-medium">
                        Quận/Huyện <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="district"
                        placeholder="Ví dụ: Quận 7"
                        value={formData.district}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            district: e.target.value,
                          });
                          clearError("district");
                        }}
                        className={`mt-1.5 ${errors.district ? "border-red-500" : ""}`}
                      />
                      {errors.district && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.district}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ward" className="text-sm font-medium">
                      Phường/Xã
                    </Label>
                    <Input
                      id="ward"
                      placeholder="Ví dụ: Phường Tân Quy"
                      value={formData.ward}
                      onChange={(e) =>
                        setFormData({ ...formData, ward: e.target.value })
                      }
                      className="mt-1.5"
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="addressLine"
                      className="text-sm font-medium"
                    >
                      Địa chỉ chi tiết <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="addressLine"
                      placeholder="Số nhà, tên đường..."
                      value={formData.addressLine}
                      onChange={(e) => {
                        setFormData({
                          ...formData,
                          addressLine: e.target.value,
                        });
                        clearError("addressLine");
                      }}
                      className={`mt-1.5 ${errors.addressLine ? "border-red-500" : ""}`}
                    />
                    {errors.addressLine && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.addressLine}
                      </p>
                    )}
                  </div>
                </div>
              </Card>

              {/* Section 3: Giá & Giờ hoạt động */}
              <Card className="p-6">
                <SectionHeader
                  step={3}
                  icon={DollarSign}
                  title="Giá thuê & Giờ hoạt động"
                  description="Cấu hình giá và lịch mở cửa cho từng ngày"
                />

                {/* Pricing */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Ngày thường (T2–T6)
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="500000"
                        value={pricing.weekdayPrice}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            weekdayPrice: e.target.value,
                          });
                          clearError("weekdayPrice");
                        }}
                        className={`h-9 ${errors.weekdayPrice ? "border-red-500" : "border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg font-semibold"}`}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        ₫/giờ
                      </span>
                    </div>
                    {errors.weekdayPrice && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.weekdayPrice}
                      </p>
                    )}
                    {pricing.weekdayPrice && !errors.weekdayPrice && (
                      <p className="text-xs text-green-600 mt-1">
                        {formatPrice(pricing.weekdayPrice)}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl border border-border bg-muted/30">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Cuối tuần (T7–CN)
                    </Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Input
                        type="number"
                        placeholder="700000"
                        value={pricing.weekendPrice}
                        onChange={(e) => {
                          setPricing({
                            ...pricing,
                            weekendPrice: e.target.value,
                          });
                          clearError("weekendPrice");
                        }}
                        className={`h-9 ${errors.weekendPrice ? "border-red-500" : "border-0 bg-transparent shadow-none focus-visible:ring-0 text-lg font-semibold"}`}
                      />
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        ₫/giờ
                      </span>
                    </div>
                    {errors.weekendPrice && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.weekendPrice}
                      </p>
                    )}
                    {pricing.weekendPrice && !errors.weekendPrice && (
                      <p className="text-xs text-green-600 mt-1">
                        {formatPrice(pricing.weekendPrice)}
                      </p>
                    )}
                  </div>
                </div>

                {/* Operating Hours */}
                <div className="border-t border-border pt-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Giờ hoạt động
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {openDays}/7 ngày mở cửa
                    </span>
                  </div>

                  <div className="space-y-2">
                    {operatingHours.map((item) => (
                      <div
                        key={item.day_of_week}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                          item.is_closed
                            ? "border-border bg-muted/20 opacity-60"
                            : "border-border bg-background"
                        }`}
                      >
                        {/* Day Label */}
                        <div className="w-8 text-center">
                          <span
                            className={`text-xs font-semibold ${item.is_closed ? "text-muted-foreground" : "text-foreground"}`}
                          >
                            {item.short}
                          </span>
                        </div>

                        {/* Toggle */}
                        <Switch
                          checked={!item.is_closed}
                          onCheckedChange={(checked) =>
                            updateOperatingHour(
                              item.day_of_week,
                              "is_closed",
                              !checked,
                            )
                          }
                          className="flex-shrink-0"
                        />

                        {/* Time Inputs */}
                        {!item.is_closed ? (
                          <div className="flex items-center gap-2 flex-1">
                            <Input
                              type="time"
                              value={item.open_time}
                              onChange={(e) =>
                                updateOperatingHour(
                                  item.day_of_week,
                                  "open_time",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-sm flex-1"
                            />
                            <span className="text-muted-foreground text-xs">
                              –
                            </span>
                            <Input
                              type="time"
                              value={item.close_time}
                              onChange={(e) =>
                                updateOperatingHour(
                                  item.day_of_week,
                                  "close_time",
                                  e.target.value,
                                )
                              }
                              className="h-8 text-sm flex-1"
                            />
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground flex-1">
                            Đóng cửa
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {errors.operatingHours && (
                    <p className="text-xs text-red-500 mt-2">
                      {errors.operatingHours}
                    </p>
                  )}
                </div>
              </Card>

              {/* Section 4: Tiện ích */}
              <Card className="p-6">
                <SectionHeader
                  step={4}
                  icon={Star}
                  title="Tiện ích"
                  description="Các tiện nghi và dịch vụ đi kèm tại sân"
                />
                <div className="space-y-4">
                  {/* Suggested amenities */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">
                      Chọn nhanh:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_AMENITIES.map((s) => {
                        const isSelected = amenities.includes(s);
                        return (
                          <button
                            key={s}
                            type="button"
                            onClick={() =>
                              isSelected
                                ? removeAmenity(amenities.indexOf(s))
                                : addAmenity(s)
                            }
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                              isSelected
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-foreground hover:border-primary hover:text-primary"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle2 className="w-3 h-3 inline mr-1" />
                            )}
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom amenity input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Thêm tiện ích khác..."
                      value={newAmenity}
                      onChange={(e) => setNewAmenity(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addAmenity();
                        }
                      }}
                      className="h-9"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addAmenity()}
                      className="h-9 px-3"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Custom amenity tags */}
                  {amenities.filter((a) => !SUGGESTED_AMENITIES.includes(a))
                    .length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {amenities
                        .filter((a) => !SUGGESTED_AMENITIES.includes(a))
                        .map((amenity) => (
                          <div
                            key={amenity}
                            className="flex items-center gap-1.5 bg-muted px-3 py-1 rounded-full"
                          >
                            <span className="text-xs">{amenity}</span>
                            <button
                              type="button"
                              onClick={() =>
                                removeAmenity(amenities.indexOf(amenity))
                              }
                              className="text-muted-foreground hover:text-foreground"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </Card>

              {/* Section 5: Hình ảnh */}
              <Card className="p-6">
                <SectionHeader
                  step={5}
                  icon={ImageIcon}
                  title="Hình ảnh sân"
                  description={`Tối đa ${MAX_IMAGES} ảnh. Ảnh đầu tiên sẽ là ảnh đại diện.`}
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleSelectImages}
                />

                {/* Drop Zone */}
                <div
                  ref={dropZoneRef}
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                    isDragging
                      ? "border-primary bg-primary/5"
                      : errors.images
                        ? "border-red-400 bg-red-50/50 dark:bg-red-950/10"
                        : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">
                    Kéo thả ảnh vào đây
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    hoặc click để chọn từ máy tính
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    JPG, PNG, WEBP — tối đa 5MB/ảnh
                  </p>
                </div>

                {errors.images && (
                  <p className="text-xs text-red-500 mt-2">{errors.images}</p>
                )}

                {/* Image Previews */}
                {selectedImages.length > 0 && (
                  <div className="grid grid-cols-5 gap-2 mt-4">
                    {selectedImages.map((image, index) => (
                      <div
                        key={image.previewUrl}
                        className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                      >
                        <img
                          src={image.previewUrl}
                          alt={`Ảnh sân ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {index === 0 && (
                          <div className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-center py-0.5">
                            <span className="text-xs font-medium">
                              Ảnh chính
                            </span>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {selectedImages.length < MAX_IMAGES && (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-border flex items-center justify-center text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar Summary - Right */}
            <div className="space-y-4">
              {/* Summary Card */}
              <Card className="p-5 sticky top-20">
                <h3 className="text-sm font-semibold text-foreground mb-4">
                  Tóm tắt thông tin
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tên sân</span>
                    <span className="font-medium text-right max-w-[60%] text-foreground">
                      {formData.name || (
                        <span className="text-muted-foreground/50 italic">
                          Chưa nhập
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loại sân</span>
                    <span className="font-medium text-foreground">
                      {formData.type || (
                        <span className="text-muted-foreground/50 italic">
                          Chưa chọn
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Khu vực</span>
                    <span className="font-medium text-foreground text-right max-w-[60%]">
                      {formData.district ? (
                        `${formData.district}, ${formData.province}`
                      ) : (
                        <span className="text-muted-foreground/50 italic">
                          Chưa nhập
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Giá ngày thường
                    </span>
                    <span className="font-medium text-foreground">
                      {pricing.weekdayPrice ? (
                        Number(pricing.weekdayPrice).toLocaleString("vi-VN") +
                        " ₫"
                      ) : (
                        <span className="text-muted-foreground/50 italic">
                          Chưa nhập
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Giá cuối tuần</span>
                    <span className="font-medium text-foreground">
                      {pricing.weekendPrice ? (
                        Number(pricing.weekendPrice).toLocaleString("vi-VN") +
                        " ₫"
                      ) : (
                        <span className="text-muted-foreground/50 italic">
                          Chưa nhập
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Ngày hoạt động
                    </span>
                    <span className="font-medium text-foreground">
                      {openDays}/7 ngày
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Hình ảnh</span>
                    <span className="font-medium text-foreground">
                      {selectedImages.length}/{MAX_IMAGES} ảnh
                    </span>
                  </div>

                  {amenities.length > 0 && (
                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground mb-2">
                        Tiện ích:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {amenities.slice(0, 4).map((a) => (
                          <Badge
                            key={a}
                            variant="secondary"
                            className="text-xs"
                          >
                            {a}
                          </Badge>
                        ))}
                        {amenities.length > 4 && (
                          <Badge variant="secondary" className="text-xs">
                            +{amenities.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notice */}
                <div className="mt-5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Sân sẽ được gửi đến admin để kiểm duyệt trước khi hiển thị
                      cho khách hàng.
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-2 mt-5">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    {isSubmitting ? "Đang gửi duyệt..." : "Gửi duyệt sân"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/owner/fields")}
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    Hủy
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
