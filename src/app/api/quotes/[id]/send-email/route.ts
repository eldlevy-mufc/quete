import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-check";
import { resend, fromEmail, appUrl } from "@/lib/resend";
import { quoteEmailHtml } from "@/lib/email-templates/quote-email";
import { sendEmailSchema, parseOrError } from "@/lib/validation";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const quoteId = parseInt(id);
  if (isNaN(quoteId) || quoteId <= 0) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();
  const parsed = parseOrError(sendEmailSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const { to, contactName } = parsed.data;

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: "שירות המייל לא מוגדר. יש להגדיר RESEND_API_KEY" }, { status: 500 });
  }

  const quote = await prisma.quote.findUnique({
    where: { id: quoteId },
    include: { client: true, sender: true },
  });

  if (!quote) {
    return NextResponse.json({ error: "הצעה לא נמצאה" }, { status: 404 });
  }

  const viewUrl = `${appUrl}/view/${quote.id}`;
  const signUrl = `${appUrl}/sign/${quote.id}`;

  try {
    const { data, error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `הצעת מחיר ${quote.quoteNumber} - ${quote.client.name}`,
      html: quoteEmailHtml({
        contactName: contactName || "לקוח/ה יקר/ה",
        quoteNumber: quote.quoteNumber,
        date: new Date(quote.date).toLocaleDateString("he-IL"),
        totalAmount: Number(quote.totalAmount).toLocaleString(),
        viewUrl,
        signUrl,
      }),
    });

    if (sendError) {
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    await prisma.quote.update({
      where: { id: quoteId },
      data: { emailSentAt: new Date() },
    });

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch {
    return NextResponse.json({ error: "שגיאה בשליחת מייל" }, { status: 500 });
  }
}
