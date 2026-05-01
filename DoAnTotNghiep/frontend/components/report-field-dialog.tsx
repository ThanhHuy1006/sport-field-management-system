
"use client";
import { toast } from "sonner";
import { useState, type ChangeEvent } from "react";
import { AlertTriangle, ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createFieldReport } from "@/features/field-reports/services/create-field-report";
import type { FieldReportReason } from "@/types/field-report";

type ReportFieldDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldId: number;
  fieldName: string;
};

const MAX_IMAGES = 3;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const FIELD_REPORT_REASONS: Array<{
  value: FieldReportReason;
  label: string;
}> = [
  { value: "WRONG_INFO", label: "Thông tin sân không chính xác" },
  { value: "FAKE_IMAGE", label: "Hình ảnh không đúng thực tế" },
  { value: "FIELD_CLOSED", label: "Sân đã đóng cửa hoặc không hoạt động" },
  { value: "BAD_QUALITY", label: "Chất lượng sân không tốt" },
  { value: "OWNER_ATTITUDE", label: "Chủ sân xử lý không tốt" },
  { value: "OTHER", label: "Lý do khác" },
];

export function ReportFieldDialog({
  open,
  onOpenChange,
  fieldId,
  fieldName,
}: ReportFieldDialogProps) {
  const [reason, setReason] = useState<FieldReportReason>("WRONG_INFO");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!open) return null;

  const resetForm = () => {
    setReason("WRONG_INFO");
    setDescription("");
    setImages([]);
    setError("");
  };

  const handleClose = () => {
    if (isSubmitting) return;

    resetForm();
    onOpenChange(false);
  };

  const handleSelectImages = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (selectedFiles.length === 0) return;

    const nextImages = [...images];

    for (const file of selectedFiles) {
      if (nextImages.length >= MAX_IMAGES) {
        setError(`Chỉ được chọn tối đa ${MAX_IMAGES} ảnh.`);
        break;
      }

      if (!file.type.startsWith("image/")) {
        setError("Chỉ được upload file hình ảnh.");
        continue;
      }

      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        setError("Mỗi ảnh không được vượt quá 5MB.");
        continue;
      }

      nextImages.push(file);
    }

    setImages(nextImages);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

 const handleSubmit = async () => {
  try {
    setIsSubmitting(true);
    setError("");

    await createFieldReport({
      field_id: fieldId,
      reason,
      description: description.trim() || null,
      images,
    });

    toast.success("Đã gửi báo cáo sân. Admin sẽ xem xét và xử lý.");

    resetForm();
    onOpenChange(false);
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Không thể gửi báo cáo sân. Vui lòng thử lại."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-xl border border-border bg-background shadow-xl">
        <div className="flex items-start justify-between border-b border-border p-5">
          <div className="flex gap-3">
            <div className="mt-1 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">
                Báo cáo sân
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Gửi báo cáo nếu sân có thông tin sai hoặc vấn đề cần Admin kiểm tra.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="rounded-lg p-1 hover:bg-muted disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 rounded-lg bg-muted p-3">
            <p className="text-sm text-muted-foreground">Sân được báo cáo</p>
            <p className="mt-1 font-semibold text-foreground">{fieldName}</p>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Lý do báo cáo <span className="text-destructive">*</span>
            </label>

            <select
              value={reason}
              onChange={(event) =>
                setReason(event.target.value as FieldReportReason)
              }
              disabled={isSubmitting}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            >
              {FIELD_REPORT_REASONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Mô tả chi tiết
            </label>

            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={4}
              maxLength={500}
              placeholder="Ví dụ: Sân không giống hình ảnh, địa chỉ sai, sân đã đóng cửa..."
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary disabled:opacity-50"
            />

            <div className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/500
            </div>
          </div>

          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-foreground">
              Ảnh minh chứng <span className="text-muted-foreground">(không bắt buộc)</span>
            </label>

            <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground hover:bg-muted">
              <ImagePlus className="h-4 w-4" />
              Chọn ảnh ({images.length}/{MAX_IMAGES})
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                disabled={isSubmitting || images.length >= MAX_IMAGES}
                onChange={handleSelectImages}
              />
            </label>

            {images.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-3">
                {images.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative overflow-hidden rounded-lg border border-border"
                  >
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Ảnh minh chứng ${index + 1}`}
                      className="h-24 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      disabled={isSubmitting}
                      className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black disabled:opacity-50"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Hủy
            </Button>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang gửi..." : "Gửi báo cáo"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}