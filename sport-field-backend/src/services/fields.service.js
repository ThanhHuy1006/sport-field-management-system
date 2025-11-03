// src/services/fields.service.js
import { prisma } from "./_prisma.js";
import { fields_status } from "@prisma/client";

// ======================================================
// 🔹 Lấy danh sách sân (public)
// ======================================================
export async function getAllFields(filters) {
  const where = {};
  if (filters.type) where.sport_type = filters.type;
  if (filters.location) where.address = { contains: filters.location };
  if (filters.status) where.status = filters.status;
  else where.status = fields_status.active;

  const fields = await prisma.fields.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: {
      users: { select: { id: true, name: true, email: true } }, // ✅ đúng với schema
      field_images: { where: { is_primary: true }, take: 1 },
      reviews: { select: { rating: true } },
    },
  });

  // 🔹 Chuẩn hóa dữ liệu trả về cho FE
  return fields.map((f) => ({
    id: f.id,
    name: f.field_name,
    type: f.sport_type,
    location: f.address,
    price: Number(f.base_price_per_hour) || 0,
    rating:
      f.reviews.length > 0
        ? f.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / f.reviews.length
        : null,
    reviews: f.reviews.length,
    image: f.field_images?.[0]?.url || null,
    available: f.status === "active",
    owner: f.users
      ? {
          id: f.users.id,
          name: f.users.name,
          email: f.users.email,
        }
      : null,
  }));
}

// ======================================================
// 🔹 Lấy chi tiết sân
// ======================================================
export async function getFieldById(id) {
  const field = await prisma.fields.findUnique({
    where: { id: Number(id) },
    include: {
      users: { select: { id: true, name: true, email: true, phone: true } }, // ✅ chủ sân
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          users: { select: { name: true } }, // ✅ người viết review
        },
      },
      field_images: true,
      field_facilities: {
        include: { facilities: true },
      },
      operating_hours: true,
    },
  });

  if (!field) throw { status: 404, message: "Không tìm thấy sân" };

  return {
    id: field.id,
    name: field.field_name,
    type: field.sport_type,
    location: field.address,
    description: field.description,
    price: Number(field.base_price_per_hour) || 0,
    rating:
      field.reviews.length > 0
        ? field.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / field.reviews.length
        : null,
    reviewCount: field.reviews.length,
    images: field.field_images.map((img) => img.url),
    amenities: field.field_facilities.map((f) => f.facilities.name),
    hours:
      field.operating_hours?.length > 0
        ? field.operating_hours
            .map((h) => `Th${h.day_of_week}: ${h.open_time} - ${h.close_time}`)
            .join(", ")
        : "Chưa cập nhật",
    capacity: field.max_players,
    owner: field.users
      ? {
          id: field.users.id,
          name: field.users.name,
          email: field.users.email,
          phone: field.users.phone,
        }
      : null,
    reviews: field.reviews.map((r) => ({
      id: r.id,
      author: r.users?.name,
      rating: r.rating,
      text: r.comment,
    })),
  };
}

// ======================================================
// 🔹 Lấy sân theo chủ sở hữu
// ======================================================
export async function getMyFields(ownerId) {
  return await prisma.fields.findMany({
    where: { owner_id: ownerId },
    orderBy: { created_at: "desc" },
  });
}
// ======================================================
// 🔹 Thêm sân mới
// ======================================================
export async function createField(ownerId, data) {
  const field = await prisma.fields.create({
    data: {
      owner_id: ownerId,
      field_name: data.name,
      sport_type: data.type,
      address: data.location,
      base_price_per_hour: Number(data.price_per_hour),
      description: data.description,
      status:fields_status.pending, 
    },
  });
  return { message: "✅ Tạo sân thành công, vui lòng chờ admin duyệt.", field };
}


// ======================================================
// // 🔹 Thêm sân mới
// // ======================================================
// export async function createField(ownerId, data) {
//   const field = await prisma.fields.create({
//     data: {
//       owner_id: ownerId,
//       field_name: data.name,
//       sport_type: data.type,
//       address: data.location,
//       base_price_per_hour: Number(data.price_per_hour),
//       description: data.description,
//       status: fields_status.active,
//     },
//   });
//   return { message: "Tạo sân thành công, chờ admin duyệt", field };
// }

// ======================================================
// 🔹 Cập nhật sân
// ======================================================
// export async function updateField(id, ownerId, data) {
//   const existing = await prisma.fields.findUnique({ where: { id: Number(id) } });
//   if (!existing || existing.owner_id !== ownerId)
//     throw { status: 403, message: "Không có quyền sửa sân này" };

//   const field = await prisma.fields.update({
//     where: { id: Number(id) },
//     data: {
//       field_name: data.name,
//       sport_type: data.type,
//       address: data.location,
//       base_price_per_hour: Number(data.price_per_hour),
//       description: data.description,
//     },
//   });
//   return { message: "Cập nhật sân thành công", field };
// }
export async function updateField(id, ownerId, data) {
  const existing = await prisma.fields.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.owner_id !== ownerId)
    throw { status: 403, message: "Không có quyền sửa sân này" };

  const field = await prisma.fields.update({
    where: { id: Number(id) },
    data: {
      field_name: data.name,
      sport_type: data.type,
      address: data.address,
      base_price_per_hour: Number(data.price),
      description: data.description,
      status: data.status,
      max_players: Number(data.capacity),
    },
  });

  return { message: "Cập nhật sân thành công", field };
}


// ======================================================
// 🔹 Xóa sân
// ======================================================
export async function deleteField(id, ownerId) {
  const existing = await prisma.fields.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.owner_id !== ownerId)
    throw { status: 403, message: "Không có quyền xóa sân này" };
  await prisma.fields.delete({ where: { id: Number(id) } });
  return { message: "Đã xóa sân thành công" };
}

// ======================================================
// 🔹 Admin duyệt sân
// ======================================================
export async function updateStatus(id, status) {
  const field = await prisma.fields.update({
    where: { id: Number(id) },
    data: { status: fields_status[status] || fields_status.active },
  });
  return { message: `Cập nhật trạng thái sân: ${status}`, field };
}
