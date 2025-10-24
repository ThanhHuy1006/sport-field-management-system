// src/services/fields.service.js
import { prisma } from "./_prisma.js";
import { fields_status } from "@prisma/client"; // ✅ enum Prisma cho status

// 🔹 Lấy danh sách sân (public)
export async function getAllFields(filters) {
  const where = {};
  if (filters.type) where.sport_type = filters.type;
  if (filters.location) where.address = { contains: filters.location };
  if (filters.status) where.status = filters.status;
  else where.status = fields_status.approved; // ✅ enum thay vì chuỗi

  return await prisma.fields.findMany({
    where,
    orderBy: { created_at: "desc" },
    include: {
      owner: { select: { id: true, name: true, email: true } },
    },
  });
}

// 🔹 Lấy chi tiết sân
export async function getFieldById(id) {
  const field = await prisma.fields.findUnique({
    where: { id: Number(id) },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          user: { select: { name: true } },
        },
      },
    },
  });
  if (!field) throw { status: 404, message: "Không tìm thấy sân" };
  return field;
}

// 🔹 Xem danh sách sân của chủ sân
export async function getMyFields(ownerId) {
  return await prisma.fields.findMany({
    where: { owner_id: ownerId },
    orderBy: { created_at: "desc" },
  });
}

// 🔹 Thêm sân mới
export async function createField(ownerId, data) {
  const field = await prisma.fields.create({
    data: {
      owner_id: ownerId,
      field_name: data.name,
      sport_type: data.type,
      address: data.location,
      base_price_per_hour: Number(data.price_per_hour),
      description: data.description,
      status: fields_status.pending, // ✅ enum đúng cú pháp
    },
  });
  return { message: "Tạo sân thành công, chờ admin duyệt", field };
}

// 🔹 Cập nhật sân
export async function updateField(id, ownerId, data) {
  const existing = await prisma.fields.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.owner_id !== ownerId)
    throw { status: 403, message: "Không có quyền sửa sân này" };

  const field = await prisma.fields.update({
    where: { id: Number(id) },
    data: {
      field_name: data.name,
      sport_type: data.type,
      address: data.location,
      base_price_per_hour: Number(data.price_per_hour),
      description: data.description,
    },
  });
  return { message: "Cập nhật sân thành công", field };
}

// 🔹 Xóa sân
export async function deleteField(id, ownerId) {
  const existing = await prisma.fields.findUnique({ where: { id: Number(id) } });
  if (!existing || existing.owner_id !== ownerId)
    throw { status: 403, message: "Không có quyền xóa sân này" };
  await prisma.fields.delete({ where: { id: Number(id) } });
  return { message: "Đã xóa sân thành công" };
}

// 🔹 Admin duyệt sân
export async function updateStatus(id, status) {
  const field = await prisma.fields.update({
    where: { id: Number(id) },
    data: { status: fields_status[status] || fields_status.approved }, // ✅ convert từ chuỗi sang enum
  });
  return { message: `Cập nhật trạng thái sân: ${status}`, field };
}
