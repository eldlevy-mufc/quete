import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-check";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { clients } = await req.json();

  if (!Array.isArray(clients) || clients.length === 0) {
    return NextResponse.json({ error: "אין נתונים לייבוא" }, { status: 400 });
  }

  const created = [];
  const skipped = [];

  for (const c of clients) {
    const name = (c.name || "").trim();
    if (!name) continue;

    // Skip if client with same name already exists
    const existing = await prisma.client.findFirst({ where: { name } });
    if (existing) {
      skipped.push(name);
      continue;
    }

    const client = await prisma.client.create({
      data: {
        name,
        brand: (c.brand || "").trim() || null,
        paymentTerms: (c.paymentTerms || "").trim() || null,
      },
    });
    created.push(client);
  }

  return NextResponse.json({ created, skipped });
}
