"use client";

import { useSession, signOut, SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

/* ─── SVG Icons (refined stroke) ─── */
const icons = {
  plus: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  ),
  list: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  users: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  ),
  send: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
  shield: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  backup: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  logout: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
};

function Sidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const role = (session?.user as { role?: string })?.role || "USER";
  const isAdmin = role === "ADMIN";
  const userName = session?.user?.name || "";
  const initials = userName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2) || "U";

  const [expanded, setExpanded] = useState(false);

  const navItems = [
    { href: "/", label: "הצעה חדשה", icon: icons.plus },
    { href: "/quotes", label: "הצעות", icon: icons.list },
    ...(isAdmin
      ? [
          { href: "/clients", label: "ניהול לקוחות", icon: icons.users },
          { href: "/senders", label: "ניהול שולחים", icon: icons.send },
          { href: "/users", label: "ניהול משתמשים", icon: icons.shield },
          { href: "/backup", label: "גיבוי נתונים", icon: icons.backup },
        ]
      : []),
  ];

  return (
    <aside
      className={`${expanded ? "w-56" : "w-[68px]"} flex flex-col min-h-screen shrink-0 relative z-10`}
      style={{
        background: "linear-gradient(180deg, #0B1C2D 0%, #0E2337 50%, #0B1C2D 100%)",
        transition: "width 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "4px 0 24px rgba(0,0,0,.12)",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="flex items-center justify-center py-5 px-3">
        <Link href="/" className="block bg-white rounded-[var(--radius-xs)] overflow-hidden w-full"
          style={{ padding: "10px 8px", boxShadow: "0 2px 8px rgba(0,0,0,.08)" }}>
          <img src="/logo.jpg" alt="מנצ׳" className="h-7 w-auto mx-auto block" />
        </Link>
      </div>

      {/* Separator */}
      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.12), transparent)" }} />

      {/* Navigation */}
      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={item.label}
              className="group flex items-center gap-3 px-3 py-2.5 text-sm relative"
              style={{
                borderRadius: "var(--radius-xs)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                background: isActive
                  ? "linear-gradient(135deg, rgba(26,188,156,.2), rgba(26,188,156,.08))"
                  : "transparent",
                color: isActive ? "#1ABC9C" : "rgba(255,255,255,.5)",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "rgba(255,255,255,.06)";
                  e.currentTarget.style.color = "rgba(255,255,255,.85)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "rgba(255,255,255,.5)";
                }
              }}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full"
                  style={{ background: "#1ABC9C" }} />
              )}
              <span className="shrink-0" style={{ opacity: isActive ? 1 : 0.7 }}>{item.icon}</span>
              {expanded && (
                <span className="whitespace-nowrap overflow-hidden font-medium text-[13px]"
                  style={{ animation: "fadeIn 0.2s ease-out" }}>
                  {item.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Separator */}
      <div className="mx-4 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent)" }} />

      {/* User + Logout */}
      <div className="p-3 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-2 py-2" title={`${userName} (${isAdmin ? "מנהל" : "משתמש"})`}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #1ABC9C, #16A085)", boxShadow: "0 2px 8px rgba(26,188,156,.3)" }}>
            {initials}
          </div>
          {expanded && (
            <div className="overflow-hidden" style={{ animation: "fadeIn 0.2s ease-out" }}>
              <p className="text-[13px] font-medium text-white/85 truncate">{userName}</p>
              <p className="text-[11px]" style={{ color: "#1ABC9C" }}>{isAdmin ? "מנהל" : "משתמש"}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="התנתק"
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-xs)]"
          style={{ color: "rgba(255,255,255,.35)", transition: "all 0.2s" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#E8725C";
            e.currentTarget.style.background = "rgba(232,114,92,.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "rgba(255,255,255,.35)";
            e.currentTarget.style.background = "transparent";
          }}
        >
          {icons.logout}
          {expanded && <span className="text-[13px]" style={{ animation: "fadeIn 0.2s ease-out" }}>התנתק</span>}
        </button>
      </div>
    </aside>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <p className="text-sm" style={{ color: "var(--muted)" }}>טוען...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" dir="rtl" style={{ background: "var(--bg)" }}>
      <Sidebar />
      <main className="flex-1 overflow-auto relative z-[1]" style={{ padding: "28px 36px" }}>
        <div className="max-w-5xl" style={{ animation: "fadeIn 0.4s ease-out" }}>
          {children}
        </div>
      </main>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionProvider>
      <DashboardContent>{children}</DashboardContent>
    </SessionProvider>
  );
}
