import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const quotes = await prisma.quote.findMany({
    include: { client: true, sender: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(quotes);
}

export async function POST(req: Request) {
  const data = await req.json();

  // Generate quote number: QT-YYYYMMDD-XXX
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
  const count = await prisma.quote.count({
    where: {
      createdAt: {
        gte: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
      },
    },
  });
  const quoteNumber = `QT-${dateStr}-${String(count + 1).padStart(3, "0")}`;

  const quote = await prisma.quote.create({
    data: {
      quoteNumber,
      recipientName: data.recipientName,
      recipientLast: data.recipientLast,
      recipientCompany: data.recipientCompany,
      title: data.title,
      subject: data.subject,
      clientId: data.clientId,
      senderId: data.senderId,
      items: data.items,
      totalAmount: data.totalAmount,
      notes: data.notes || null,
      paymentTerms: data.paymentTerms,
      senderSignature: data.senderSignature || null,
    },
    include: { client: true, sender: true },
  });
  return NextResponse.json(quote);
}
