import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-check";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(brands);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const data = await req.json();
  const brand = await prisma.brand.create({
    data: { name: data.name.trim() },
  });
  return NextResponse.json(brand);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
