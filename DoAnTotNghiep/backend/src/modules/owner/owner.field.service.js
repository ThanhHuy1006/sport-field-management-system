import prisma from "../../core/prisma.js";

/* ============================================================
   CREATE FIELD
============================================================ */
export const createField = async (ownerId, data, images) => {
  // Check owner profile status
  const owner = await prisma.owner_profiles.findUnique({
    where: { user_id: ownerId },
  });

  if (!owner) throw new Error("Owner profile not found");
  if (owner.status !== "approved")
    throw new Error("Your owner profile is not approved yet");

  const newField = await prisma.fields.create({
    data: {
      owner_id: ownerId,
      field_name: data.field_name,
      sport_type: data.sport_type,
      description: data.description || null,
      address: data.address,
      latitude: data.latitude ? Number(data.latitude) : null,
      longitude: data.longitude ? Number(data.longitude) : null,
      base_price_per_hour: Number(data.base_price_per_hour) || 0,
      min_duration_minutes: Number(data.min_duration_minutes) || 60,
      max_players: Number(data.max_players) || null,
      currency: data.currency || "VND",
    },
  });

  // Save images
  if (images?.length > 0) {
    const imgData = images.map((f, index) => ({
      field_id: newField.id,
      url: f.path,
      is_primary: index === 0,
      order_no: index,
    }));

    await prisma.field_images.createMany({ data: imgData });
  }

  return newField;
};

/* ============================================================
   GET OWNER FIELDS
============================================================ */
export const getMyFields = async (ownerId) => {
  return prisma.fields.findMany({
    where: { owner_id: ownerId },
    include: {
      field_images: true,
    },
  });
};

/* ============================================================
   GET FIELD DETAIL
============================================================ */
export const getFieldDetail = async (id) => {
  const field = await prisma.fields.findUnique({
    where: { id },
    include: {
      field_images: true,
      field_facilities: true,
      operating_hours: true,
    },
  });

  if (!field) throw new Error("Field not found");

  return field;
};

/* ============================================================
   UPDATE FIELD
============================================================ */
export const updateField = async (fieldId, ownerId, data, images) => {
  const exists = await prisma.fields.findFirst({
    where: { id: fieldId, owner_id: ownerId },
  });

  if (!exists) throw new Error("Field not found or not owned by you");

  const updated = await prisma.fields.update({
    where: { id: fieldId },
    data: {
      field_name: data.field_name,
      sport_type: data.sport_type,
      description: data.description || null,
      address: data.address,
      base_price_per_hour: Number(data.base_price_per_hour) || 0,
      min_duration_minutes: Number(data.min_duration_minutes) || 60,
      max_players: Number(data.max_players) || null,
    },
  });

  if (images?.length > 0) {
    await prisma.field_images.deleteMany({
      where: { field_id: fieldId },
    });

    const imgData = images.map((f, index) => ({
      field_id: fieldId,
      url: f.path,
      is_primary: index === 0,
      order_no: index,
    }));

    await prisma.field_images.createMany({ data: imgData });
  }

  return updated;
};

/* ============================================================
   DELETE FIELD
============================================================ */
export const deleteField = async (fieldId, ownerId) => {
  const exists = await prisma.fields.findFirst({
    where: { id: fieldId, owner_id: ownerId },
  });

  if (!exists) throw new Error("Field not found or not owned by you");

  await prisma.field_images.deleteMany({ where: { field_id: fieldId } });

  await prisma.fields.delete({
    where: { id: fieldId },
  });
};
