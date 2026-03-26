import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-check";
import { createQuoteSchema, parseOrError } from "@/lib/validation";

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  const quotes = await prisma.quote.findMany({
    include: { client: true, sender: true, contact: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const body = await req.json();
  const parsed = parseOrError(createQuoteSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const data = parsed.data;

  // Generate quote number inside a transaction to avoid race conditions
  const quote = await prisma.$transaction(async (tx) => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    const count = await tx.quote.count({
      where: {
        createdAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    const quoteNumber = `QT-${dateStr}-${String(count + 1).padStart(3, "0")}`;

    return tx.quote.create({
      data: {
        quoteNumber,
        recipientName: data.recipientName,
        recipientLast: data.recipientLast,
        recipientCompany: data.recipientCompany,
        title: data.title,
        subject: data.subject,
        clientId: data.clientId,
        senderId: data.senderId,
        contactId: data.contactId || null,
        items: data.items,
        totalAmount: data.totalAmount,
        notes: data.notes || null,
        paymentTerms: data.paymentTerms,
        senderSignature: data.senderSignature || null,
      },
      include: { client: true, sender: true, contact: true },
    });
  });

  return NextResponse.json(quote);
}
