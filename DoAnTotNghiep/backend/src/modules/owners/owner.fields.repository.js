import prisma from "../../config/prisma.js";

const OWNER_FIELD_INCLUDE = {
  field_images: {
    orderBy: [{ is_primary: "desc" }, { order_no: "asc" }],
  },
  field_pricing_rules: {
    orderBy: [{ priority: "desc" }, { id: "asc" }],
  },
  operating_hours: {
    orderBy: { day_of_week: "asc" },
  },
  field_facilities: {
    include: {
      facilities: true,
    },
  },
};
async function upsertFieldPricingRule(tx, fieldId, rule) {
  const existing = await tx.field_pricing_rules.findFirst({
    where: {
      field_id: fieldId,
      day_type: rule.day_type,
    },
  });

  const data = {
    start_time: rule.start_time,
    end_time: rule.end_time,
    price: rule.price,
    currency: rule.currency,
    priority: rule.priority ?? 0,
    active: rule.active ?? true,
  };

  if (existing) {
    return tx.field_pricing_rules.update({
      where: { id: existing.id },
      data,
    });
  }

  return tx.field_pricing_rules.create({
    data: {
      field_id: fieldId,
      day_type: rule.day_type,
      ...data,
    },
  });
}

export const ownerFieldsRepository = {
  findOwnerFields(ownerId) {
    return prisma.fields.findMany({
      where: { owner_id: ownerId },
      orderBy: { created_at: "desc" },
      include: OWNER_FIELD_INCLUDE,
    });
  },

  findOwnerFieldById(ownerId, fieldId) {
    return prisma.fields.findFirst({
      where: {
        id: fieldId,
        owner_id: ownerId,
      },
      include: OWNER_FIELD_INCLUDE,
    });
  },

  createOwnerFieldWithDetails(ownerId, payload) {
    const {
      fieldData,
      pricingRules = [],
      operatingHours = [],
     
      amenities = [],
    } = payload;

    return prisma.$transaction(async (tx) => {
      const field = await tx.fields.create({
        data: {
          owner_id: ownerId,
          ...fieldData,
        },
      });

      if (pricingRules.length > 0) {
        await tx.field_pricing_rules.createMany({
          data: pricingRules.map((rule) => ({
            field_id: field.id,
            day_type: rule.day_type,
            start_time: rule.start_time,
            end_time: rule.end_time,
            price: rule.price,
            currency: rule.currency,
            priority: rule.priority ?? 0,
            active: rule.active ?? true,
          })),
        });
      }
      if (operatingHours.length > 0) {
  await tx.operating_hours.createMany({
    data: operatingHours.map((item) => ({
      field_id: field.id,
      day_of_week: item.day_of_week,
      open_time: item.open_time,
      close_time: item.close_time,
    })),
  });
}

      // if (operatingHours.length > 0) {
      //   await tx.operating_hours.createMany({
      //     data: operatingHours.map((item) => ({
      //       field_id: field.id,
      //       day_of_week: item.day_of_week,
      //       open_time: item.open_time,
      //       close_time: item.close_time,
      //     })),
      //   });
      // }

      for (const amenityName of amenities) {
        const facility = await tx.facilities.upsert({
          where: { name: amenityName },
          update: {},
          create: { name: amenityName },
        });

        await tx.field_facilities.create({
          data: {
            field_id: field.id,
            facility_id: facility.id,
          },
        });
      }

      return tx.fields.findUnique({
        where: { id: field.id },
        include: OWNER_FIELD_INCLUDE,
      });
    });
  },
async createOwnerFieldImages(fieldId, uploadedFiles) {
  return prisma.$transaction(async (tx) => {
    const existingImagesCount = await tx.field_images.count({
      where: { field_id: fieldId },
    });

    await tx.field_images.createMany({
      data: uploadedFiles.map((file, index) => ({
        field_id: fieldId,
        url: file.url,
        is_primary: existingImagesCount === 0 && index === 0,
        order_no: existingImagesCount + index,
      })),
    });

    return tx.fields.findUnique({
      where: { id: fieldId },
      include: OWNER_FIELD_INCLUDE,
    });
  });
},
updateOwnerFieldWithDetails(fieldId, payload) {
  const {
    fieldData = {},
    pricingRules = [],
    amenities,
  } = payload;

  return prisma.$transaction(async (tx) => {
    if (Object.keys(fieldData).length > 0) {
      await tx.fields.update({
        where: { id: fieldId },
        data: fieldData,
      });
    }

    for (const rule of pricingRules) {
      await upsertFieldPricingRule(tx, fieldId, rule);
    }

    if (amenities !== undefined) {
      await tx.field_facilities.deleteMany({
        where: { field_id: fieldId },
      });

      for (const amenityName of amenities) {
        const facility = await tx.facilities.upsert({
          where: { name: amenityName },
          update: {},
          create: { name: amenityName },
        });

        await tx.field_facilities.create({
          data: {
            field_id: fieldId,
            facility_id: facility.id,
          },
        });
      }
    }

    return tx.fields.findUnique({
      where: { id: fieldId },
      include: OWNER_FIELD_INCLUDE,
    });
  });
},
async setOwnerFieldPrimaryImage(fieldId, imageId) {
  return prisma.$transaction(async (tx) => {
    const image = await tx.field_images.findFirst({
      where: {
        id: imageId,
        field_id: fieldId,
      },
    });

    if (!image) {
      return null;
    }

    await tx.field_images.updateMany({
      where: { field_id: fieldId },
      data: { is_primary: false },
    });

    await tx.field_images.update({
      where: { id: imageId },
      data: { is_primary: true },
    });

    return tx.fields.findUnique({
      where: { id: fieldId },
      include: OWNER_FIELD_INCLUDE,
    });
  });
},
  // updateOwnerField(fieldId, data) {
  //   return prisma.fields.update({
  //     where: { id: fieldId },
  //     data,
  //     include: OWNER_FIELD_INCLUDE,
  //   });
  // },

  updateOwnerFieldStatus(fieldId, status) {
    return prisma.fields.update({
      where: { id: fieldId },
      data: { status },
      include: OWNER_FIELD_INCLUDE,
    });
  },
  async deleteOwnerFieldImage(fieldId, imageId) {
  return prisma.$transaction(async (tx) => {
    const image = await tx.field_images.findFirst({
      where: {
        id: Number(imageId),
        field_id: Number(fieldId),
      },
    });

    if (!image) {
      return null;
    }

    await tx.field_images.delete({
      where: { id: image.id },
    });

    const remainingImages = await tx.field_images.findMany({
      where: { field_id: Number(fieldId) },
      orderBy: [{ is_primary: "desc" }, { order_no: "asc" }, { id: "asc" }],
    });

    const hasPrimary = remainingImages.some((item) => item.is_primary);

    if (!hasPrimary && remainingImages.length > 0) {
      await tx.field_images.update({
        where: { id: remainingImages[0].id },
        data: { is_primary: true },
      });
    }

    return tx.fields.findUnique({
      where: { id: Number(fieldId) },
      include: OWNER_FIELD_INCLUDE,
    });
  });
},
};