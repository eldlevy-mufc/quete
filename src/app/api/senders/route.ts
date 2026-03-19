import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const senders = await prisma.sender.findMany({ orderBy: { fullName: "asc" } });
  return NextResponse.json(senders);
}

export async function POST(req: Request) {
  const data = await req.json();
  const sender = await prisma.sender.create({
    data: { fullName: data.fullName, title: data.title },
  });
  return NextResponse.json(sender);
}

export async function PUT(req: Request) {
  const data = await req.json();
  const sender = await prisma.sender.update({
    where: { id: data.id },
    data: { fullName: data.fullName, title: data.title },
  });
  return NextResponse.json(sender);
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "0");
  await prisma.sender.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
