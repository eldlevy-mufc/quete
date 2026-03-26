import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-check";
import { createSenderSchema, updateSenderSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const senders = await prisma.sender.findMany({ orderBy: { fullName: "asc" } });
  return NextResponse.json(senders);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = parseOrError(createSenderSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const sender = await prisma.sender.create({
    data: { fullName: parsed.data.fullName, title: parsed.data.title },
  });
  return NextResponse.json(sender);
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = parseOrError(updateSenderSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const sender = await prisma.sender.update({
    where: { id: parsed.data.id },
    data: { fullName: parsed.data.fullName, title: parsed.data.title },
  });
  return NextResponse.json(sender);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  await prisma.sender.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
