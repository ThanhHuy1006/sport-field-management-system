"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, Plus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createField } from "@/lib/fields";

export default function NewFieldPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    type: "",
    location: "",
    address: "",
    capacity: "",
    price: "",
    description: "",
    status: "active",
  });

  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState("");
  const [operatingHours, setOperatingHours] = useState({
    openTime: "06:00",
    closeTime: "22:00",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NEW: lưu danh sách file ảnh
  const [images, setImages] = useState<File[]>([]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Vui lòng nhập tên sân";
    if (!formData.type) newErrors.type = "Vui lòng chọn loại thể thao";
    if (!formData.location.trim()) newErrors.location = "Vui lòng nhập khu vực";
    if (!formData.address.trim()) newErrors.address = "Vui lòng nhập địa chỉ chi tiết";

    const price = Number.parseInt(formData.price);
    if (!formData.price) {
      newErrors.price = "Vui lòng nhập giá thuê";
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = "Giá thuê phải là số dương";
    } else if (price < 50000) {
      newErrors.price = "Giá thuê tối thiểu 50,000 VND";
    }

    const capacity = Number.parseInt(formData.capacity);
    if (!formData.capacity) {
      newErrors.capacity = "Vui lòng nhập sức chứa";
    } else if (isNaN(capacity) || capacity <= 0) {
      newErrors.capacity = "Sức chứa phải là số dương";
    } else if (capacity > 100) {
      newErrors.capacity = "Sức chứa tối đa 100 người";
    }

    if (operatingHours.openTime >= operatingHours.closeTime) {
      newErrors.operatingHours = "Giờ mở cửa phải trước giờ đóng cửa";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

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

      // ============================
      // TẠO FORM DATA GỬI LÊN BACKEND
      // ============================
      const form = new FormData();

      // Core field info (map theo BE)
      form.append("field_name", formData.name);
      form.append("sport_type", formData.type);
      form.append("address", formData.address);
      form.append("description", formData.description);
      form.append("base_price_per_hour", formData.price);
      form.append("max_players", formData.capacity);
      form.append("status", formData.status);

      // Location (nếu BE có xử lý)
      form.append("location", formData.location);

      // Operating hours
      form.append("open_time", operatingHours.openTime);
      form.append("close_time", operatingHours.closeTime);

      // Amenities (tiện ích)
      amenities.forEach((a, i) => form.append(`amenities[${i}]`, a));

      // Images
      images.forEach((img) => form.append("images", img));

      // CALL API
      await createField(form);

      toast({
        title: "Tạo sân thành công!",
        description: `Sân "${formData.name}" đã được thêm vào danh sách của bạn.`,
      });

      router.push("/owner/fields");
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Tạo sân thất bại",
        description: error?.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setAmenities(amenities.filter((_, i) => i !== index));
  };

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background border-b border-border">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/owner/fields" className="flex items-center gap-2 text-primary hover:text-primary/80">
            <ArrowLeft className="w-5 h-5" />
            Quay lại
          </Link>
          <h1 className="text-xl font-bold">Thêm Sân Mới</h1>
          <div className="w-20" />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Thông Tin Cơ Bản</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Tên Sân *</Label>
                <Input
                  id="name"
                  placeholder="Ví dụ: Sân Bóng Đá Green Valley"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (errors.name) setErrors({ ...errors, name: "" });
                  }}
                  className={errors.name ? "border-red-500" : ""}
                  required
                />
                {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Loại Thể Thao *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => {
                      setFormData({ ...formData, type: value });
                      if (errors.type) setErrors({ ...errors, type: "" });
                    }}
                  >
                    <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                      <SelectValue placeholder="Chọn loại thể thao" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="soccer">Bóng Đá</SelectItem>
                      <SelectItem value="basketball">Bóng Rổ</SelectItem>
                      <SelectItem value="tennis">Tennis</SelectItem>
                      <SelectItem value="badminton">Cầu Lông</SelectItem>
                      <SelectItem value="volleyball">Bóng Chuyền</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.type && <p className="text-sm text-red-500 mt-1">{errors.type}</p>}
                </div>

                <div>
                  <Label htmlFor="status">Trạng Thái *</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Hoạt Động</SelectItem>
                      <SelectItem value="inactive">Không Hoạt Động</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Mô Tả</Label>
                <Textarea
                  id="description"
                  placeholder="Mô tả chi tiết về sân..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Vị Trí</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="location">Khu Vực *</Label>
                <Input
                  id="location"
                  placeholder="Ví dụ: Quận 1, TP.HCM"
                  value={formData.location}
                  onChange={(e) => {
                    setFormData({ ...formData, location: e.target.value });
                    if (errors.location) setErrors({ ...errors, location: "" });
                  }}
                  className={errors.location ? "border-red-500" : ""}
                  required
                />
                {errors.location && <p className="text-sm text-red-500 mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="address">Địa Chỉ Chi Tiết *</Label>
                <Input
                  id="address"
                  placeholder="Số nhà, tên đường..."
                  value={formData.address}
                  onChange={(e) => {
                    setFormData({ ...formData, address: e.target.value });
                    if (errors.address) setErrors({ ...errors, address: "" });
                  }}
                  className={errors.address ? "border-red-500" : ""}
                  required
                />
                {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Giá & Sức Chứa</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Giá Thuê (VND/giờ) *</Label>
                <Input
                  id="price"
                  type="number"
                  placeholder="500000"
                  value={formData.price}
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value });
                    if (errors.price) setErrors({ ...errors, price: "" });
                  }}
                  className={errors.price ? "border-red-500" : ""}
                  required
                />
                {errors.price && <p className="text-sm text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="capacity">Sức Chứa (người) *</Label>
                <Input
                  id="capacity"
                  type="number"
                  placeholder="22"
                  value={formData.capacity}
                  onChange={(e) => {
                    setFormData({ ...formData, capacity: e.target.value });
                    if (errors.capacity) setErrors({ ...errors, capacity: "" });
                  }}
                  className={errors.capacity ? "border-red-500" : ""}
                  required
                />
                {errors.capacity && <p className="text-sm text-red-500 mt-1">{errors.capacity}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Giờ Hoạt Động</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="openTime">Giờ Mở Cửa</Label>
                <Input
                  id="openTime"
                  type="time"
                  value={operatingHours.openTime}
                  onChange={(e) => {
                    setOperatingHours({
                      ...operatingHours,
                      openTime: e.target.value,
                    });
                    if (errors.operatingHours) setErrors({ ...errors, operatingHours: "" });
                  }}
                  className={errors.operatingHours ? "border-red-500" : ""}
                />
              </div>

              <div>
                <Label htmlFor="closeTime">Giờ Đóng Cửa</Label>
                <Input
                  id="closeTime"
                  type="time"
                  value={operatingHours.closeTime}
                  onChange={(e) => {
                    setOperatingHours({
                      ...operatingHours,
                      closeTime: e.target.value,
                    });
                    if (errors.operatingHours) setErrors({ ...errors, operatingHours: "" });
                  }}
                  className={errors.operatingHours ? "border-red-500" : ""}
                />
              </div>
            </div>
            {errors.operatingHours && <p className="text-sm text-red-500 mt-2">{errors.operatingHours}</p>}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Tiện Ích</h2>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Ví dụ: Bãi đỗ xe, Phòng thay đồ..."
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addAmenity();
                    }
                  }}
                />
                <Button type="button" onClick={addAmenity}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {amenities.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {amenities.map((amenity, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted px-3 py-1 rounded-full">
                      <span className="text-sm">{amenity}</span>
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
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

          {/* HÌNH ẢNH */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Hình Ảnh</h2>

            {/* Input file ẩn */}
            <input
              type="file"
              id="fieldImages"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (!e.target.files) return;
                setImages([...images, ...Array.from(e.target.files)]);
              }}
            />

            {/* Box upload giữ nguyên style + thêm onClick */}
            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer"
              onClick={() => document.getElementById("fieldImages")?.click()}
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                Kéo thả hình ảnh hoặc click để chọn
              </p>
              <Button type="button" variant="outline" size="sm">
                Chọn Hình Ảnh
              </Button>
            </div>

            {/* Preview ảnh */}
            {images.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={URL.createObjectURL(img)}
                      alt="preview"
                      className="w-full h-28 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"
                      onClick={() => setImages(images.filter((_, index) => index !== i))}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/owner/fields")}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Đang tạo..." : "Tạo Sân"}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}
