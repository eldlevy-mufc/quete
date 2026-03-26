"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface BackupStats {
  quotes: number;
  clients: number;
  contacts: number;
  senders: number;
  brands: number;
  users: number;
}

interface BackupData {
  version: string;
  exportedAt: string;
  stats: BackupStats;
}

export default function BackupPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [loading, setLoading] = useState(false);
  const [lastBackup, setLastBackup] = useState<BackupData | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  if (role !== "ADMIN") {
    return (
      <div className="text-center py-20" style={{ animation: "fadeIn 0.4s ease-out" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>🔒</div>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>אין לך הרשאה לצפות בדף זה</p>
      </div>
    );
  }

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const downloadBackup = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/backup");
      if (!res.ok) throw new Error("Backup failed");

      const data = await res.json();
      setLastBackup(data);

      // Trigger download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(`גיבוי הורד בהצלחה! ${data.stats.quotes} הצעות, ${data.stats.clients} לקוחות`);
    } catch {
      showToast("שגיאה בביצוע גיבוי", "error");
    } finally {
      setLoading(false);
    }
  };

  const statItems = lastBackup
    ? [
        { label: "הצעות", value: lastBackup.stats.quotes, color: "#1ABC9C" },
        { label: "לקוחות", value: lastBackup.stats.clients, color: "#3B82F6" },
        { label: "אנשי קשר", value: lastBackup.stats.contacts, color: "#8B5CF6" },
        { label: "שולחים", value: lastBackup.stats.senders, color: "#F59E0B" },
        { label: "מותגים", value: lastBackup.stats.brands, color: "#EC4899" },
        { label: "משתמשים", value: lastBackup.stats.users, color: "#059669" },
      ]
    : [];

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="px-6 py-3 text-white text-sm font-bold"
            style={{
              background: toast.type === "success"
                ? "linear-gradient(135deg, #1ABC9C, #16A085)"
                : "linear-gradient(135deg, #E8725C, #DC2626)",
              borderRadius: "var(--radius-xs)",
              boxShadow: toast.type === "success"
                ? "0 4px 20px rgba(26,188,156,.3)"
                : "0 4px 20px rgba(232,114,92,.3)",
            }}>
            {toast.msg}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <h1 className="text-navy" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
          גיבוי נתונים
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>הורד עותק של כל הנתונים במערכת</p>
      </div>

      {/* Main Backup Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius)",
          padding: "36px 32px",
          boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
          border: "1px solid rgba(15,23,42,.06)",
          marginBottom: "28px",
          animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0ms both",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div style={{
            width: "40px", height: "40px", borderRadius: "50%",
            background: "linear-gradient(135deg, #1ABC9C, #16A085)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(26,188,156,.3)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "var(--navy)" }}>
              הורדת גיבוי מלא
            </h2>
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              כולל הצעות, לקוחות, אנשי קשר, שולחים, מותגים ומשתמשים
            </p>
          </div>
        </div>

        <button
          onClick={downloadBackup}
          disabled={loading}
          className="text-white font-bold"
          style={{
            background: "linear-gradient(135deg, #1ABC9C, #16A085)",
            padding: "14px 32px",
            borderRadius: "var(--radius-xs)",
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            boxShadow: "0 4px 20px rgba(26,188,156,.3)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,188,156,.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,188,156,.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {loading ? "מוריד גיבוי..." : "הורד גיבוי JSON"}
        </button>
      </div>

      {/* Stats after backup */}
      {lastBackup && (
        <div style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="mb-4 flex items-center gap-2">
            <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#059669" }} />
            <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
              גיבוי אחרון: {new Date(lastBackup.exportedAt).toLocaleString("he-IL")}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {statItems.map((stat, i) => (
              <div key={stat.label}
                style={{
                  background: "#fff",
                  borderRadius: "var(--radius-sm)",
                  padding: "16px",
                  boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 8px 24px rgba(0,0,0,.05)",
                  border: "1px solid rgba(15,23,42,.06)",
                  textAlign: "center",
                  animation: `slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 50}ms both`,
                }}>
                <p style={{ fontSize: "1.5rem", fontWeight: 700, color: stat.color, marginBottom: "4px" }}>
                  {stat.value}
                </p>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius)",
          padding: "24px 28px",
          boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 8px 24px rgba(0,0,0,.05)",
          border: "1px solid rgba(15,23,42,.06)",
          marginTop: "28px",
          animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 60ms both",
        }}
      >
        <h3 style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--navy)", marginBottom: "12px" }}>
          מידע על גיבוי הנתונים
        </h3>
        <div className="space-y-3" style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
          <div className="flex items-start gap-2">
            <span style={{ color: "#1ABC9C", fontWeight: 700 }}>✓</span>
            <p><strong style={{ color: "var(--navy)" }}>גיבוי אוטומטי:</strong> Neon PostgreSQL מגבה אוטומטית כל 24 שעות ושומר 7 ימים אחורה</p>
          </div>
          <div className="flex items-start gap-2">
            <span style={{ color: "#1ABC9C", fontWeight: 700 }}>✓</span>
            <p><strong style={{ color: "var(--navy)" }}>גיבוי ידני:</strong> השתמש בכפתור למעלה להורדת קובץ JSON עם כל הנתונים</p>
          </div>
          <div className="flex items-start gap-2">
            <span style={{ color: "#F59E0B", fontWeight: 700 }}>!</span>
            <p><strong style={{ color: "var(--navy)" }}>המלצה:</strong> הורד גיבוי ידני לפחות פעם בשבוע ושמור בענן (Google Drive / Dropbox)</p>
          </div>
          <div className="flex items-start gap-2">
            <span style={{ color: "#3B82F6", fontWeight: 700 }}>i</span>
            <p><strong style={{ color: "var(--navy)" }}>דפלוי:</strong> עדכון הממשק לא מוחק נתונים — הם מאוחסנים בנפרד בענן</p>
          </div>
        </div>
      </div>
    </div>
  );
}
