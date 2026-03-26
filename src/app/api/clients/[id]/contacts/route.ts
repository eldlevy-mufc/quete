import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-check";
import { createContactSchema, updateContactSchema, parseOrError } from "@/lib/validation";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const contacts = await prisma.contact.findMany({
    where: { clientId: numId },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(contacts);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  const body = await req.json();
  const parsed = parseOrError(createContactSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;
  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || null,
      clientId: numId,
    },
  });
  return NextResponse.json(contact);
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  await params;
  const body = await req.json();
  const parsed = parseOrError(updateContactSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;
  const contact = await prisma.contact.update({
    where: { id: data.id },
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || null,
    },
  });
  return NextResponse.json(contact);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;
  await params;
  const { searchParams } = new URL(req.url);
  const contactId = parseInt(searchParams.get("contactId") || "");
  if (isNaN(contactId) || contactId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }
  await prisma.contact.delete({ where: { id: contactId } });
  return NextResponse.json({ success: true });
}
