import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { clientSignature } = await req.json();
  const quote = await prisma.quote.update({
    where: { id: parseInt(id) },
    data: { clientSignature },
  });
  return NextResponse.json(quote);
}
