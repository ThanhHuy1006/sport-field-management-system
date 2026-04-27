import "../src/config/env.js";
import prisma from "../src/config/prisma.js";
import bcrypt from "bcryptjs";

const PASSWORD = "123456";

async function main() {
  const password_hash = await bcrypt.hash(PASSWORD, 10);

  const admin = await prisma.users.upsert({
    where: { email: "admin@sport.local" },
    update: {
      name: "Demo Admin",
      password_hash,
      role: "ADMIN",
      status: "active",
    },
    create: {
      name: "Demo Admin",
      email: "admin@sport.local",
      password_hash,
      phone: "0900000001",
      role: "ADMIN",
      status: "active",
    },
  });

  const owner = await prisma.users.upsert({
    where: { email: "owner@sport.local" },
    update: {
      name: "Demo Owner",
      password_hash,
      role: "OWNER",
      status: "active",
    },
    create: {
      name: "Demo Owner",
      email: "owner@sport.local",
      password_hash,
      phone: "0900000002",
      role: "OWNER",
      status: "active",
    },
  });

  await prisma.owner_profiles.upsert({
    where: { user_id: owner.id },
    update: {
      business_name: "Sân thể thao Demo Owner",
      tax_code: "DEMO-OWNER-001",
      address: "Quận 7, TP. Hồ Chí Minh",
      status: "approved",
      approved_by: admin.id,
      approved_at: new Date(),
      reject_reason: null,
    },
    create: {
      user_id: owner.id,
      business_name: "Sân thể thao Demo Owner",
      tax_code: "DEMO-OWNER-001",
      address: "Quận 7, TP. Hồ Chí Minh",
      status: "approved",
      approved_by: admin.id,
      approved_at: new Date(),
    },
  });

  const user = await prisma.users.upsert({
    where: { email: "user@sport.local" },
    update: {
      name: "Demo User",
      password_hash,
      role: "USER",
      status: "active",
    },
    create: {
      name: "Demo User",
      email: "user@sport.local",
      password_hash,
      phone: "0900000003",
      role: "USER",
      status: "active",
    },
  });

  console.log("Seed demo users successfully:");
  console.table([
    { role: "ADMIN", email: admin.email, password: PASSWORD },
    { role: "OWNER", email: owner.email, password: PASSWORD },
    { role: "USER", email: user.email, password: PASSWORD },
  ]);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });