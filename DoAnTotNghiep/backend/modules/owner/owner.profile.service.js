import prisma from "../../core/prisma.js";

/* =======================
   GET MY PROFILE
======================= */
export const getMyProfile = async (ownerId) => {
  const profile = await prisma.owner_profiles.findUnique({
    where: { user_id: ownerId },
  });

  if (!profile) throw new Error("Hồ sơ chủ sân không tồn tại");

  return profile;
};

/* =======================
   UPDATE PROFILE
   (only allowed if rejected)
======================= */
export const updateProfile = async (ownerId, data) => {
  const profile = await prisma.owner_profiles.findUnique({
    where: { user_id: ownerId },
  });

  if (!profile) throw new Error("Hồ sơ không tồn tại");

  // Đã duyệt => không cho sửa
  if (profile.status === "approved") {
    throw new Error("Hồ sơ đã được phê duyệt, không thể chỉnh sửa");
  }

  // Đang pending => không cho sửa
  if (profile.status === "pending") {
    throw new Error("Hồ sơ đang được xét duyệt, không thể chỉnh sửa");
  }

  // Bị reject => cho sửa lại
  const updated = await prisma.owner_profiles.update({
    where: { user_id: ownerId },
    data: {
      business_name: data.business_name || profile.business_name,
      tax_code: data.tax_code || profile.tax_code,
      address: data.address || profile.address,

      // reset trạng thái để admin duyệt lại
      status: "pending",
      reject_reason: null,
    },
  });

  return updated;
};
