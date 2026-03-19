import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(clients);
}

export async function POST(req: Request) {
  const data = await req.json();
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
  const data = await req.json();
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
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
