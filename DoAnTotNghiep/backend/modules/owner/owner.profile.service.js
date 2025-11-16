// import prisma from "../../core/prisma.js";

// /* =======================
//    GET MY PROFILE
// ======================= */
// export const getMyProfile = async (ownerId) => {
//   const profile = await prisma.owner_profiles.findUnique({
//     where: { user_id: ownerId },
//   });

//   if (!profile) throw new Error("Hồ sơ chủ sân không tồn tại");

//   return profile;
// };

// /* =======================
//    UPDATE PROFILE
//    (only allowed if rejected)
// ======================= */
// export const updateProfile = async (ownerId, data) => {
//   const profile = await prisma.owner_profiles.findUnique({
//     where: { user_id: ownerId },
//   });

//   if (!profile) throw new Error("Hồ sơ không tồn tại");

//   // Đã duyệt => không cho sửa
//   if (profile.status === "approved") {
//     throw new Error("Hồ sơ đã được phê duyệt, không thể chỉnh sửa");
//   }

//   // Đang pending => không cho sửa
//   if (profile.status === "pending") {
//     throw new Error("Hồ sơ đang được xét duyệt, không thể chỉnh sửa");
//   }

//   // Bị reject => cho sửa lại
//   const updated = await prisma.owner_profiles.update({
//     where: { user_id: ownerId },
//     data: {
//       business_name: data.business_name || profile.business_name,
//       tax_code: data.tax_code || profile.tax_code,
//       address: data.address || profile.address,

//       // reset trạng thái để admin duyệt lại
//       status: "pending",
//       reject_reason: null,
//     },
//   });

//   return updated;
// };
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
   UPDATE PROFILE + DOCUMENTS
   (only allowed if rejected)
======================= */
export const updateProfile = async (ownerId, data, files) => {
  const profile = await prisma.owner_profiles.findUnique({
    where: { user_id: ownerId },
  });

  if (!profile) throw new Error("Hồ sơ không tồn tại");

  // ❌ Đã được phê duyệt → KHÔNG cho sửa
  if (profile.status === "approved") {
    throw new Error("Hồ sơ đã được phê duyệt, không thể chỉnh sửa");
  }

  // ❌ Đang chờ duyệt → KHÔNG cho sửa
  if (profile.status === "pending") {
    throw new Error("Hồ sơ đang được xét duyệt, không thể chỉnh sửa");
  }

  // 🟢 Chỉ cho update khi: REJECTED
  let license_url = profile.license_url;
  let id_front_url = profile.id_front_url;
  let id_back_url = profile.id_back_url;

  // Nếu user upload lại tài liệu → cập nhật đường dẫn mới
  if (files?.license) {
    license_url = `uploads/documents/${files.license[0].filename}`;
  }

  if (files?.id_front) {
    id_front_url = `uploads/documents/${files.id_front[0].filename}`;
  }

  if (files?.id_back) {
    id_back_url = `uploads/documents/${files.id_back[0].filename}`;
  }

  const updated = await prisma.owner_profiles.update({
    where: { user_id: ownerId },
    data: {
      business_name: data.business_name || profile.business_name,
      tax_code: data.tax_code || profile.tax_code,
      address: data.address || profile.address,

      // UPDATE documents nếu có upload
      license_url,
      id_front_url,
      id_back_url,

      // Reset trạng thái để admin duyệt lại
      status: "pending",
      reject_reason: null,
    },
  });

  return updated;
};
