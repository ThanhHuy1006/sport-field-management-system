import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const password = await bcrypt.hash("123456", 10);

  // Admin
  const admin = await prisma.users.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@example.com",
      password_hash: password,
      role: "ADMIN",
    },
  });

  // Owner pending
  const ownerPending = await prisma.users.upsert({
    where: { email: "owner_pending@example.com" },
    update: {},
    create: {
      name: "Owner Pending",
      email: "owner_pending@example.com",
      password_hash: password,
      role: "OWNER",
    },
  });

  await prisma.owner_profiles.upsert({
    where: { user_id: ownerPending.id },
    update: {},
    create: {
      user_id: ownerPending.id,
      business_name: "Pending Sports Center",
      address: "District 1, HCMC",
      status: "pending",
    },
  });

  // Owner approved
  const ownerApproved = await prisma.users.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      name: "Approved Owner",
      email: "owner@example.com",
      password_hash: password,
      role: "OWNER",
    },
  });

  await prisma.owner_profiles.upsert({
    where: { user_id: ownerApproved.id },
    update: {},
    create: {
      user_id: ownerApproved.id,
      business_name: "Pro Stadium",
      address: "District 3, HCMC",
      status: "approved",
    },
  });

  // Normal user
  await prisma.users.upsert({
    where: { email: "user@example.com" },
    update: {},
    create: {
      name: "Test User",
      email: "user@example.com",
      password_hash: password,
      role: "USER",
    },
  });

  // Field sample
  await prisma.fields.create({
    data: {
      owner_id: ownerApproved.id,
      field_name: "Stadium A",
      sport_type: "football",
      description: "High-quality synthetic grass field.",
      address: "District 3, HCMC",
      base_price_per_hour: 200000,
      status: "active",
      field_images: {
        create: [{ url: "https://picsum.photos/800/600", is_primary: true }],
      },
      operating_hours: {
        create: [
          { day_of_week: 1, open_time: "06:00", close_time: "22:00" },
          { day_of_week: 2, open_time: "06:00", close_time: "22:00" },
          { day_of_week: 3, open_time: "06:00", close_time: "22:00" },
          { day_of_week: 4, open_time: "06:00", close_time: "22:00" },
          { day_of_week: 5, open_time: "06:00", close_time: "22:00" },
          { day_of_week: 6, open_time: "06:00", close_time: "22:00" },
          { day_of_week: 0, open_time: "06:00", close_time: "22:00" },
        ],
      },
    },
  });

  console.log("✨ Seed completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
