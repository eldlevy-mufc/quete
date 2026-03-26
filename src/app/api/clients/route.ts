import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-check";
import { createClientSchema, updateClientSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const clients = await prisma.client.findMany({
    include: { contacts: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = parseOrError(createClientSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;
  const client = await prisma.client.create({
    data: {
      name: data.name,
      brand: data.brand || null,
      paymentTerms: data.paymentTerms || null,
    },
  });
  return NextResponse.json(client);
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const body = await req.json();
  const parsed = parseOrError(updateClientSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;
  const client = await prisma.client.update({
    where: { id: data.id },
    data: {
      name: data.name,
      brand: data.brand || null,
      paymentTerms: data.paymentTerms || null,
    },
  });
  return NextResponse.json(client);
}

export async function DELETE(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "");
  if (isNaN(id) || id <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
