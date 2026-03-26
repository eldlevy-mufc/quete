import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-check";
import { importClientsSchema, parseOrError } from "@/lib/validation";

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const body = await req.json();
  const parsed = parseOrError(importClientsSchema, body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const created = [];
  const skipped = [];

  for (const c of parsed.data.clients) {
    const name = (c.name || "").replace(/<[^>]*>/g, "").trim();
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
        brand: (c.brand || "").replace(/<[^>]*>/g, "").trim() || null,
        paymentTerms: (c.paymentTerms || "").replace(/<[^>]*>/g, "").trim() || null,
      },
    });
    created.push(client);
  }

  return NextResponse.json({ created, skipped });
}
