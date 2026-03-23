import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth-check";
import { resend, fromEmail, appUrl } from "@/lib/resend";
import { quoteEmailHtml } from "@/lib/email-templates/quote-email";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAuth();
  if (error) return error;

  const { id } = await params;
  const quoteId = parseInt(id);
  const body = await req.json();
  const { to, contactName } = body;

  if (!to) {
    return NextResponse.json({ error: "לא הוזנה כתובת מייל" }, { status: 400 });
  }

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
      return NextResponse.json({ error: sendError.message }, { status: 500 });
    }

    await prisma.quote.update({
      where: { id: quoteId },
      data: { emailSentAt: new Date() },
    });

    return NextResponse.json({ success: true, emailId: data?.id });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "שגיאה בשליחת מייל" },
      { status: 500 }
    );
  }
}
