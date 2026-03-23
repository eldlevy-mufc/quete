import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth-check";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;
  const { id } = await params;
  const contacts = await prisma.contact.findMany({
    where: { clientId: parseInt(id) },
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
  const data = await req.json();
  const contact = await prisma.contact.create({
    data: {
      name: data.name,
      email: data.email || null,
      phone: data.phone || null,
      role: data.role || null,
      clientId: parseInt(id),
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
  const data = await req.json();
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
  const contactId = parseInt(searchParams.get("contactId") || "0");
  await prisma.contact.delete({ where: { id: contactId } });
  return NextResponse.json({ success: true });
}
