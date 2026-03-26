import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { signQuoteSchema, parseOrError } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  // Validate input
  const body = await req.json();
  const parsed = parseOrError(signQuoteSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  // Verify quote exists and isn't already signed
  const existing = await prisma.quote.findUnique({ where: { id: numId } });
  if (!existing) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }
  if (existing.clientSignature) {
    return NextResponse.json({ error: "Quote already signed" }, { status: 409 });
  }

  const quote = await prisma.quote.update({
    where: { id: numId },
    data: { clientSignature: parsed.data.clientSignature },
    select: { id: true, quoteNumber: true, clientSignature: true },
  });
  return NextResponse.json(quote);
}
