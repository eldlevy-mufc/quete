import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-check";

export async function GET(req: Request) {
  // Auth: either admin session or secret token for scheduled tasks
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const backupSecret = process.env.BACKUP_SECRET;

  if (token && backupSecret && token === backupSecret) {
    // Authorized via secret token (for scheduled/cron jobs)
  } else {
    // Fallback to session auth
    const { error } = await requireAdmin();
    if (error) return error;
  }

  try {
    // Fetch all data
    const [quotes, clients, contacts, senders, brands, users] = await Promise.all([
      prisma.quote.findMany({
        include: { client: true, sender: true, contact: true },
        orderBy: { createdAt: "desc" },
      }),
      prisma.client.findMany({ orderBy: { name: "asc" } }),
      prisma.contact.findMany({ orderBy: { name: "asc" } }),
      prisma.sender.findMany({ orderBy: { fullName: "asc" } }),
      prisma.brand.findMany({ orderBy: { name: "asc" } }),
      prisma.user.findMany({
        select: { id: true, username: true, fullName: true, role: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
    ]);

    const backup = {
      version: "1.0",
      exportedAt: new Date().toISOString(),
      stats: {
        quotes: quotes.length,
        clients: clients.length,
        contacts: contacts.length,
        senders: senders.length,
        brands: brands.length,
        users: users.length,
      },
      data: {
        quotes,
        clients,
        contacts,
        senders,
        brands,
        users,
      },
    };

    const filename = `backup-${new Date().toISOString().slice(0, 10)}.json`;

    return new NextResponse(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Backup failed" }, { status: 500 });
  }
}
