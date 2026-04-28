"use client";

import type React from "react";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Upload,
  Plus,
  X,
  Save,
  Eye,
  EyeOff,
  Trash2,
  ImageIcon,
  Info,
  ClipboardCheck,
  Zap,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  updateOwnerField,
  updateOwnerFieldStatus,
  uploadOwnerFieldImages,
  setOwnerFieldPrimaryImage,
  deleteOwnerFieldImage,
  type OwnerApprovalMode,
  type UpdateOwnerFieldPayload,
} from "@/features/fields/services/owner-fields.service";

type SelectedImage = {
  id?: number;
  file: File | null;
  previewUrl: string;
  isExisting?: boolean;
  isPrimary?: boolean;
};

type ExistingImage = {
  id: number;
  url: string;
  isPrimary?: boolean;
};

type ExistingOperatingHour = {
  day_of_week: number;
  open_time: string | null;
  close_time: string | null;
  is_closed?: boolean | null;
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

export interface FieldData {
  id?: number;
  name: string;
  type: string;
  location?: string;
  address?: string;
  addressLine?: string;
  ward?: string;
  district?: string;
  province?: string;
  capacity: string;
  price: string;
  weekendPrice?: string;
  description: string;
  status: string;
  amenities: string[];
  openTime: string;
  closeTime: string;
  approvalMode?: OwnerApprovalMode | string | null;
  image?: string;
  existingImages?: ExistingImage[];
  operating_hours?: ExistingOperatingHour[];
}

function getSafeFieldData(existingData?: FieldData): FieldData {
  return {
    id: existingData?.id,
    name: existingData?.name || "",
    type: existingData?.type || "",
    location: existingData?.location || "",
    address: existingData?.address || "",
    addressLine: existingData?.addressLine || "",
    ward: existingData?.ward || "",
    district: existingData?.district || "",
    province: existingData?.province || "TP. Hồ Chí Minh",
    capacity: existingData?.capacity || "",
    price: existingData?.price || "",
    weekendPrice: existingData?.weekendPrice || existingData?.price || "",
    description: existingData?.description || "",
    status: existingData?.status || "pending",
    amenities: existingData?.amenities || [],
    openTime: existingData?.openTime || "06:00",
    closeTime: existingData?.closeTime || "22:00",
    approvalMode: existingData?.approvalMode || "MANUAL",
    image: existingData?.image,
    existingImages: existingData?.existingImages || [],
    operating_hours: existingData?.operating_hours || [],
  };
}

function getStatusLabel(status: string) {
  if (status === "active") return "Đang hiển thị";
  if (status === "pending") return "Chờ duyệt";
  if (status === "inactive") return "Đã ẩn";
  if (status === "maintenance") return "Bảo trì";
  return status || "Chưa xác định";
}

function getStatusBadgeClass(status: string) {
  if (status === "active") {
    return "border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20 dark:text-green-400";
  }

  if (status === "pending") {
    return "border-yellow-500 text-yellow-700 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400";
  }

  if (status === "maintenance") {
    return "border-blue-500 text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400";
  }

  if (status === "inactive") {
    return "border-muted-foreground text-muted-foreground";
  }

  return "border-muted-foreground text-muted-foreground";
}

export default function EditFieldForm({
  fieldId,
  existingData,
}: {
  fieldId: string;
  existingData?: FieldData;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const selectedImagesRef = useRef<SelectedImage[]>([]);

  const safeData = getSafeFieldData(existingData);

  const normalizeSportType = (type: string) => {
    const map: Record<string, string> = {
      soccer: "Bóng đá",
      football: "Bóng đá",
      basketball: "Bóng rổ",
      tennis: "Tennis",
      badminton: "Cầu lông",
      volleyball: "Bóng chuyền",
      pickleball: "Pickleball",
    };

    return map[type] ?? type;
  };

  const parseAddress = (location?: string, address?: string) => {
    const parts = String(location || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      province:
        safeData.province ||
        (parts.length >= 2 ? parts[parts.length - 1] : "TP. Hồ Chí Minh"),
      district: safeData.district || (parts.length >= 1 ? parts[0] : ""),
      ward: safeData.ward || "",
      addressLine: safeData.addressLine || address || "",
    };
  };

  const buildOperatingHours = (): OperatingHourItem[] => {
    if (safeData.operating_hours && safeData.operating_hours.length > 0) {
      return DEFAULT_OPERATING_HOURS.map((day) => {
        const matched = safeData.operating_hours?.find(
          (item) => Number(item.day_of_week) === day.day_of_week,
        );

        if (!matched) {
          return {
            ...day,
            is_closed: true,
          };
        }

        return {
          ...day,
          open_time: matched.open_time || day.open_time,
          close_time: matched.close_time || day.close_time,
          is_closed:
            Boolean(matched.is_closed) ||
            !matched.open_time ||
            !matched.close_time,
        };
      });
    }

    return DEFAULT_OPERATING_HOURS.map((item) => ({
      ...item,
      open_time: safeData.openTime || "06:00",
      close_time: safeData.closeTime || "22:00",
    }));
  };

  const buildSelectedImages = (): SelectedImage[] => {
    if (safeData.existingImages && safeData.existingImages.length > 0) {
      return safeData.existingImages
        .filter((image) => image.url)
        .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary))
        .map((image) => ({
          id: image.id,
          file: null,
          previewUrl: image.url,
          isExisting: true,
          isPrimary: Boolean(image.isPrimary),
        }));
    }

    if (safeData.image) {
      return [
        {
          file: null,
          previewUrl: safeData.image,
          isExisting: true,
          isPrimary: true,
        },
      ];
    }

    return [];
  };

  const parsedAddress = parseAddress(safeData.location, safeData.address);

  const [formData, setFormData] = useState({
    name: safeData.name,
    type: normalizeSportType(safeData.type),
    province: parsedAddress.province,
    district: parsedAddress.district,
    ward: parsedAddress.ward,
    addressLine: parsedAddress.addressLine,
    capacity: safeData.capacity,
    description: safeData.description,
    status: safeData.status,
  });

  const [pricing, setPricing] = useState({
    weekdayPrice: safeData.price,
    weekendPrice:
      safeData.weekendPrice ??
      String(Math.round(Number(safeData.price || 0) * 1.2)),
  });

  const [approvalMode, setApprovalMode] = useState<OwnerApprovalMode>(
    safeData.approvalMode === "AUTO" ? "AUTO" : "MANUAL",
  );

  const [amenities, setAmenities] = useState<string[]>(safeData.amenities);
  const [newAmenity, setNewAmenity] = useState("");
  const [operatingHours, setOperatingHours] = useState<OperatingHourItem[]>(
    buildOperatingHours(),
  );
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>(
    buildSelectedImages(),
  );
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const [imageActionId, setImageActionId] = useState<number | null>(null);

  useEffect(() => {
    selectedImagesRef.current = selectedImages;
  }, [selectedImages]);

  useEffect(() => {
    return () => {
      selectedImagesRef.current
        .filter((img) => !img.isExisting)
        .forEach((img) => URL.revokeObjectURL(img.previewUrl));
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
    if (!pricing.weekdayPrice) {
      newErrors.weekdayPrice = "Vui lòng nhập giá ngày thường";
    } else if (Number.isNaN(weekdayPrice) || weekdayPrice <= 0) {
      newErrors.weekdayPrice = "Giá phải là số dương";
    } else if (weekdayPrice < 50000) {
      newErrors.weekdayPrice = "Giá tối thiểu 50,000 VND";
    }

    const weekendPrice = Number.parseInt(pricing.weekendPrice, 10);
    if (!pricing.weekendPrice) {
      newErrors.weekendPrice = "Vui lòng nhập giá cuối tuần";
    } else if (Number.isNaN(weekendPrice) || weekendPrice <= 0) {
      newErrors.weekendPrice = "Giá phải là số dương";
    } else if (weekendPrice < 50000) {
      newErrors.weekendPrice = "Giá tối thiểu 50,000 VND";
    }

    const capacity = Number.parseInt(formData.capacity, 10);
    if (!formData.capacity) {
      newErrors.capacity = "Vui lòng nhập sức chứa";
    } else if (Number.isNaN(capacity) || capacity <= 0) {
      newErrors.capacity = "Sức chứa phải là số dương";
    } else if (capacity > 100) {
      newErrors.capacity = "Sức chứa tối đa 100 người";
    }

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

      accepted.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    if (accepted.length > 0) {
      setSelectedImages((prev) => [...prev, ...accepted]);
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

  // const removeImage = (index: number) => {
  //   setSelectedImages((prev) => {
  //     const img = prev[index];

  //     if (img?.isExisting) {
  //       toast({
  //         title: "Chưa hỗ trợ xóa ảnh cũ",
  //         description:
  //           "Hiện tại chỉ hỗ trợ thêm ảnh mới. Chức năng xóa ảnh sẽ bổ sung sau.",
  //       });

  //       return prev;
  //     }

  //     if (img && !img.isExisting) URL.revokeObjectURL(img.previewUrl);

  //     return prev.filter((_, i) => i !== index);
  //   });
  // };

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

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };
  const handleSetPrimaryImage = async (image: SelectedImage) => {
    if (!image.isExisting || !image.id) {
      toast({
        title: "Không thể đặt ảnh chính",
        description: "Ảnh mới cần được lưu trước khi đặt làm ảnh chính.",
        variant: "destructive",
      });
      return;
    }

    try {
      setImageActionId(image.id);

      await setOwnerFieldPrimaryImage(fieldId, image.id);

      setSelectedImages((prev) =>
        prev.map((item) => ({
          ...item,
          isPrimary: item.id === image.id,
        })),
      );

      toast({
        title: "Đã đổi ảnh chính",
        description: "Ảnh đại diện sân đã được cập nhật.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Không thể đổi ảnh chính",
        description:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setImageActionId(null);
    }
  };
 const removeImage = async (index: number) => {
  const img = selectedImages[index]

  if (!img) return

  // Ảnh đã upload lên server
  if (img.isExisting) {
    if (!img.id) {
      toast({
        title: "Không thể xóa ảnh",
        description: "Ảnh hiện tại không có mã ảnh để xóa.",
        variant: "destructive",
      })
      return
    }

    const existingCount = selectedImages.filter((item) => item.isExisting).length

    if (existingCount <= 1) {
      toast({
        title: "Không thể xóa ảnh cuối cùng",
        description: "Mỗi sân nên có ít nhất 1 ảnh để hiển thị.",
        variant: "destructive",
      })
      return
    }

    if (!confirm("Bạn có chắc chắn muốn xóa ảnh này khỏi sân?")) {
      return
    }

    try {
      setImageActionId(img.id)

      await deleteOwnerFieldImage(fieldId, img.id)

      setSelectedImages((prev) => {
        const next = prev.filter((_, i) => i !== index)

        // Nếu ảnh vừa xóa là ảnh chính, cập nhật tạm ảnh đầu tiên còn lại làm ảnh chính trên UI
        if (img.isPrimary) {
          const firstExisting = next.find((item) => item.isExisting && item.id)

          return next.map((item) => ({
            ...item,
            isPrimary: firstExisting ? item.id === firstExisting.id : item.isPrimary,
          }))
        }

        return next
      })

      toast({
        title: "Đã xóa ảnh",
        description: "Ảnh sân đã được xóa thành công.",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Không thể xóa ảnh",
        description: error instanceof Error ? error.message : "Đã có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setImageActionId(null)
    }

    return
  }

  // Ảnh mới chỉ mới chọn ở FE, chưa upload lên server
  if (img.previewUrl) {
    URL.revokeObjectURL(img.previewUrl)
  }

  setSelectedImages((prev) => prev.filter((_, i) => i !== index))

  toast({
    title: "Đã bỏ ảnh",
    description: "Ảnh mới đã được bỏ khỏi danh sách tải lên.",
  })
}

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

      const payload: UpdateOwnerFieldPayload = {
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

        approval_mode: approvalMode,
        amenities,

        operating_hours: operatingHours.map((item) => ({
          day_of_week: item.day_of_week,
          open_time: item.is_closed ? null : item.open_time,
          close_time: item.is_closed ? null : item.close_time,
          is_closed: item.is_closed,
        })),
      };

      await updateOwnerField(fieldId, payload);

      const newFiles = selectedImages
        .filter((image) => !image.isExisting && image.file)
        .map((image) => image.file as File);

      if (newFiles.length > 0) {
        await uploadOwnerFieldImages(fieldId, newFiles);
      }

      toast({
        title: "Đã lưu thay đổi",
        description: "Thông tin sân đã được cập nhật thành công.",
      });

      router.push("/owner/fields");
      router.refresh();
    } catch (error) {
      toast({
        title: "Không thể cập nhật sân",
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

  const handleHideField = async () => {
    if (formData.status !== "active") {
      toast({
        title: "Không thể ẩn sân",
        description:
          "Chỉ sân đang hiển thị mới có thể chuyển sang trạng thái ẩn.",
        variant: "destructive",
      });
      return;
    }

    if (
      !confirm(
        "Bạn có chắc chắn muốn ẩn sân này? Sân sẽ không còn hiển thị cho khách đặt, nhưng dữ liệu vẫn được lưu.",
      )
    ) {
      return;
    }

    try {
      setIsHiding(true);

      await updateOwnerFieldStatus(fieldId, "inactive");

      setFormData((prev) => ({
        ...prev,
        status: "inactive",
      }));

      toast({
        title: "Đã ẩn sân",
        description:
          "Sân đã được chuyển sang trạng thái ẩn và không còn hiển thị cho khách đặt.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Không thể ẩn sân",
        description:
          error instanceof Error
            ? error.message
            : "Đã có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsHiding(false);
    }
  };

  return (
    <main className="min-h-screen bg-muted/30">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              href="/owner/fields"
              className="flex shrink-0 items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Quay lại</span>
            </Link>

            <Separator orientation="vertical" className="h-5" />

            <div className="min-w-0">
              <h1 className="text-base font-semibold text-foreground">
                Chỉnh sửa sân
              </h1>
              {/* <p className="max-w-[260px] truncate text-xs text-muted-foreground sm:max-w-[420px]">
                {formData.name || safeData.name || "Chưa có tên sân"}
              </p> */}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Badge
              variant="outline"
              className={getStatusBadgeClass(formData.status)}
            >
              {formData.status === "active" ? (
                <>
                  <Eye className="w-3 h-3 mr-1" />
                  {getStatusLabel(formData.status)}
                </>
              ) : (
                <>
                  <EyeOff className="w-3 h-3 mr-1" />
                  {getStatusLabel(formData.status)}
                </>
              )}
            </Badge>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="bg-background border">
              <TabsTrigger value="general">Thông tin chung</TabsTrigger>
              <TabsTrigger value="location">Vị trí</TabsTrigger>
              <TabsTrigger value="pricing">Giá & Lịch</TabsTrigger>
              <TabsTrigger value="images">Hình ảnh</TabsTrigger>
              <TabsTrigger value="settings">Cài đặt</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Thông tin cơ bản</CardTitle>
                  <CardDescription>
                    Tên, loại thể thao và mô tả sân
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="name">
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
                        <p className="text-xs text-red-500 mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>
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
                          {SPORT_OPTIONS.map((sport) => (
                            <SelectItem key={sport.value} value={sport.value}>
                              {sport.label}
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
                      <Label htmlFor="capacity">
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
                    <Label htmlFor="description">Mô tả sân</Label>
                    <Textarea
                      id="description"
                      placeholder="Mô tả chi tiết về sân, tiêu chuẩn mặt sân, thiết bị hỗ trợ..."
                      rows={4}
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
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Tiện ích</CardTitle>
                  <CardDescription>Các tiện ích có tại sân</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTED_AMENITIES.map((amenity) => (
                      <Button
                        key={amenity}
                        type="button"
                        variant={
                          amenities.includes(amenity) ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          amenities.includes(amenity)
                            ? removeAmenity(amenities.indexOf(amenity))
                            : addAmenity(amenity)
                        }
                      >
                        {amenity}
                      </Button>
                    ))}
                  </div>

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
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addAmenity()}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {amenities.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t">
                      {amenities.map((amenity, index) => (
                        <Badge
                          key={`${amenity}-${index}`}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {amenity}
                          <button
                            type="button"
                            onClick={() => removeAmenity(index)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Địa chỉ sân</CardTitle>
                  <CardDescription>
                    Địa chỉ chính xác để khách hàng tìm đến
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="province">Tỉnh/Thành phố</Label>
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
                      <Label htmlFor="district">
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

                    <div>
                      <Label htmlFor="ward">Phường/Xã</Label>
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
                      <Label htmlFor="addressLine">
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

                  <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium text-foreground">
                        Địa chỉ hiển thị:
                      </p>
                      <p>
                        {[
                          formData.addressLine,
                          formData.ward,
                          formData.district,
                          formData.province,
                        ]
                          .filter(Boolean)
                          .join(", ") || "Chưa có thông tin"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="pricing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bảng giá</CardTitle>
                  <CardDescription>Giá thuê sân theo giờ</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weekdayPrice">
                        Giá ngày thường <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="weekdayPrice"
                          type="number"
                          placeholder="200000"
                          min={50000}
                          step={10000}
                          value={pricing.weekdayPrice}
                          onChange={(e) => {
                            setPricing({
                              ...pricing,
                              weekdayPrice: e.target.value,
                            });
                            clearError("weekdayPrice");
                          }}
                          className={`pr-16 ${errors.weekdayPrice ? "border-red-500" : ""}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ₫/giờ
                        </span>
                      </div>
                      {errors.weekdayPrice && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.weekdayPrice}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Thứ 2 - Thứ 6
                      </p>
                    </div>

                    <div>
                      <Label htmlFor="weekendPrice">
                        Giá cuối tuần <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id="weekendPrice"
                          type="number"
                          placeholder="250000"
                          min={50000}
                          step={10000}
                          value={pricing.weekendPrice}
                          onChange={(e) => {
                            setPricing({
                              ...pricing,
                              weekendPrice: e.target.value,
                            });
                            clearError("weekendPrice");
                          }}
                          className={`pr-16 ${errors.weekendPrice ? "border-red-500" : ""}`}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                          ₫/giờ
                        </span>
                      </div>
                      {errors.weekendPrice && (
                        <p className="text-xs text-red-500 mt-1">
                          {errors.weekendPrice}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        Thứ 7 - Chủ nhật
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Giờ hoạt động</CardTitle>
                  <CardDescription>
                    Cài đặt giờ mở cửa cho từng ngày trong tuần
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  {errors.operatingHours && (
                    <p className="text-xs text-red-500 mb-4 p-2 bg-red-50 rounded">
                      {errors.operatingHours}
                    </p>
                  )}

                  <div className="space-y-3">
                    {operatingHours.map((item) => (
                      <div
                        key={item.day_of_week}
                        className={`flex items-center gap-4 p-3 rounded-lg border ${
                          item.is_closed ? "bg-muted/30" : "bg-background"
                        }`}
                      >
                        <div className="w-24 flex items-center gap-2">
                          <Switch
                            checked={!item.is_closed}
                            onCheckedChange={(checked) =>
                              updateOperatingHour(
                                item.day_of_week,
                                "is_closed",
                                !checked,
                              )
                            }
                          />
                          <span
                            className={`text-sm font-medium ${item.is_closed ? "text-muted-foreground" : ""}`}
                          >
                            {item.label}
                          </span>
                        </div>

                        {item.is_closed ? (
                          <span className="text-sm text-muted-foreground">
                            Đóng cửa
                          </span>
                        ) : (
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
                              className="w-28"
                            />
                            <span className="text-muted-foreground">-</span>
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
                              className="w-28"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="images" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Hình ảnh sân</CardTitle>
                  <CardDescription>
                    Tải lên tối đa {MAX_IMAGES} hình ảnh JPG, PNG, WEBP. Mỗi ảnh
                    tối đa 5MB.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ALLOWED_IMAGE_TYPES.join(",")}
                    multiple
                    onChange={handleSelectImages}
                    className="hidden"
                  />

                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragging
                        ? "border-primary bg-primary/5"
                        : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                  >
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm font-medium">Kéo thả ảnh vào đây</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      hoặc click để chọn file
                    </p>
                  </div>

                  {selectedImages.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                      {selectedImages.map((img, index) => (
                        <div
                          key={`${img.previewUrl}-${index}`}
                          className="relative aspect-video rounded-lg overflow-hidden border group"
                        >
                          <img
                            src={img.previewUrl || "/placeholder.svg"}
                            alt={`Ảnh ${index + 1}`}
                            className="w-full h-full object-cover"
                          />

                          {img.isPrimary && (
                            <Badge className="absolute top-2 left-2 text-xs">
                              Ảnh chính
                            </Badge>
                          )}

                          <button
                            type="button"
                            disabled={img.id ? imageActionId === img.id : false}
                            onClick={(event) => {
                              event.stopPropagation();
                              removeImage(index);
                            }}
                            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          {img.isExisting && !img.isPrimary && img.id && (
                            <button
                              type="button"
                              disabled={imageActionId === img.id}
                              onClick={(event) => {
                                event.stopPropagation();
                                handleSetPrimaryImage(img);
                              }}
                              className="absolute inset-x-2 bottom-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100"
                            >
                              {imageActionId === img.id
                                ? "Đang đổi..."
                                : "Đặt ảnh chính"}
                            </button>
                          )}
                        </div>
                      ))}

                      {selectedImages.length < MAX_IMAGES && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-video rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 flex flex-col items-center justify-center gap-2 transition-colors"
                        >
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Thêm ảnh
                          </span>
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    Cách duyệt đơn đặt sân
                  </CardTitle>
                  <CardDescription>
                    Chọn cách xử lý khi khách tạo đơn đặt sân mới.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => setApprovalMode("MANUAL")}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        approvalMode === "MANUAL"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-md p-2 ${
                            approvalMode === "MANUAL"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <ClipboardCheck className="h-4 w-4" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">Duyệt thủ công</p>

                            <span
                              className={`h-3 w-3 rounded-full border ${
                                approvalMode === "MANUAL"
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Chủ sân xác nhận trước khi đơn được duyệt.
                          </p>
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setApprovalMode("AUTO")}
                      className={`rounded-lg border p-4 text-left transition-colors ${
                        approvalMode === "AUTO"
                          ? "border-primary bg-primary/5"
                          : "border-border bg-background hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-md p-2 ${
                            approvalMode === "AUTO"
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Zap className="h-4 w-4" />
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-medium">Tự động duyệt</p>

                            <span
                              className={`h-3 w-3 rounded-full border ${
                                approvalMode === "AUTO"
                                  ? "border-primary bg-primary"
                                  : "border-muted-foreground/40"
                              }`}
                            />
                          </div>

                          <p className="mt-1 text-sm text-muted-foreground">
                            Hệ thống tự duyệt nếu khung giờ còn trống.
                          </p>
                        </div>
                      </div>
                    </button>
                  </div>

                  <p className="mt-3 text-xs text-muted-foreground">
                    Thay đổi này chỉ áp dụng cho các đơn đặt sân mới sau khi
                    lưu.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-orange-200 dark:border-orange-900/60 bg-background">
                <CardHeader>
                  <CardTitle className="text-lg text-orange-600 dark:text-orange-400">
                    Quản lý hiển thị
                  </CardTitle>
                  <CardDescription>
                    Ẩn sân khỏi trang public khi không còn nhận đặt sân. Trạng
                    thái active vẫn do admin duyệt.
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="flex items-center justify-between gap-4 rounded-lg border border-orange-200 bg-orange-50 p-4 dark:border-orange-900/60 dark:bg-orange-950/20">
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">
                        Tạm ẩn sân
                      </p>
                      <p className="text-sm text-orange-700/80 dark:text-orange-200/70">
                        Sân sẽ không hiển thị cho khách đặt. Dữ liệu sân và lịch
                        sử booking vẫn được giữ lại.
                      </p>
                    </div>

                    {formData.status === "active" ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={handleHideField}
                        disabled={isHiding}
                        className="shrink-0"
                      >
                        {isHiding ? (
                          "Đang ẩn..."
                        ) : (
                          <>
                            <Trash2 className="w-4 h-4 mr-1" />
                            Ẩn sân
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge variant="outline" className="shrink-0">
                        {getStatusLabel(formData.status)}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="sticky bottom-0 bg-background border-t border-border mt-6 -mx-4 px-4 py-4">
            <div className="max-w-5xl mx-auto flex items-center justify-between">
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.push("/owner/fields")}
                disabled={isSubmitting}
              >
                Hủy
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  "Đang lưu..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Lưu thay đổi
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
