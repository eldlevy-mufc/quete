import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-check";
import { createBrandSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = parseOrError(createBrandSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Check for duplicate
  const existing = await prisma.brand.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return NextResponse.json({ error: "Brand already exists" }, { status: 409 });
  }

  const brand = await prisma.brand.create({
    data: { name: parsed.data.name },
  });
  return NextResponse.json(brand);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
