import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const numId = parseInt(id);
  if (isNaN(numId) || numId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: numId },
    include: { client: true, sender: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "Quote not found" }, { status: 404 });
  }

  // Strip password-like fields from sender data, only return what's needed
  return NextResponse.json({
    id: quote.id,
    quoteNumber: quote.quoteNumber,
    recipientName: quote.recipientName,
    recipientLast: quote.recipientLast,
    recipientCompany: quote.recipientCompany,
    date: quote.date,
    title: quote.title,
    subject: quote.subject,
    items: quote.items,
    totalAmount: quote.totalAmount,
    paymentTerms: quote.paymentTerms,
    notes: quote.notes,
    clientSignature: quote.clientSignature,
    senderSignature: quote.senderSignature,
    client: { name: quote.client.name, brand: quote.client.brand },
    sender: { fullName: quote.sender.fullName, title: quote.sender.title },
  });
}
