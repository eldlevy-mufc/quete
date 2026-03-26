import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { createUserSchema, updateUserSchema, parseOrError } from "@/lib/validation";

async function checkAdmin() {
  const session = await auth();
  if (!session?.user || (session.user as { role?: string }).role !== "ADMIN") {
    return false;
  }
  return true;
}

export async function GET() {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    select: { id: true, username: true, fullName: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = parseOrError(createUserSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  const existing = await prisma.user.findUnique({ where: { username: data.username } });
  if (existing) {
    return NextResponse.json({ error: "שם משתמש כבר קיים" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: {
      username: data.username,
      password: hashedPassword,
      fullName: data.fullName,
      role: data.role,
    },
    select: { id: true, username: true, fullName: true, role: true },
  });
  return NextResponse.json(user);
}

export async function PUT(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const body = await req.json();
  const parsed = parseOrError(updateUserSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  const updateData: { fullName?: string; role?: string; password?: string } = {
    fullName: data.fullName,
    role: data.role,
  };
  if (data.password && data.password.length >= 6) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }
  const user = await prisma.user.update({
    where: { id: data.id },
    data: updateData,
    select: { id: true, username: true, fullName: true, role: true },
  });
  return NextResponse.json(user);
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
