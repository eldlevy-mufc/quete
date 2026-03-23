import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin user already exists, skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      fullName: "מנהל מערכת",
      role: "ADMIN",
    },
  });
  console.log("Admin user created: username=admin, password=admin123");
  console.log("IMPORTANT: Change the password after first login!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
