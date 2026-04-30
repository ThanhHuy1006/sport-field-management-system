import { apiRequest } from "@/lib/api-client";

export type UploadedFile = {
  url: string;
  storage_path: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
};

export type UploadAvatarResponse = {
  success: boolean;
  message: string;
  data: {
    file: UploadedFile;
  };
};

export function uploadAvatar(file: File) {
  const formData = new FormData();
  formData.append("avatar", file);

  return apiRequest<UploadAvatarResponse>("/uploads/avatar", {
    method: "POST",
    requireAuth: true,
    body: formData,
  });
}
