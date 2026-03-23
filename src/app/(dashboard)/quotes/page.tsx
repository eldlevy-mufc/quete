"use client";

import { useState, useEffect } from "react";

interface Quote {
  id: number;
  quoteNumber: string;
  recipientName: string;
  recipientLast: string;
  recipientCompany: string;
  date: string;
  title: string;
  subject: string;
  totalAmount: number;
  clientSignature: string | null;
  senderSignature: string | null;
  emailSentAt: string | null;
  client: { name: string; brand: string | null };
  sender: { fullName: string; title: string };
  contact: { name: string; email: string | null } | null;
}

export default function QuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [sendingEmailId, setSendingEmailId] = useState<number | null>(null);
  const [emailToast, setEmailToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const sendEmail = async (quote: Quote) => {
    if (!quote.contact?.email) return;
    setSendingEmailId(quote.id);
    try {
      const res = await fetch(`/api/quotes/${quote.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: quote.contact.email, contactName: quote.contact.name }),
      });
      const result = await res.json();
      if (res.ok) {
        setEmailToast({ message: `נשלח בהצלחה ל-${quote.contact.email}`, type: "success" });
        setQuotes(quotes.map(q => q.id === quote.id ? { ...q, emailSentAt: new Date().toISOString() } : q));
      } else {
        setEmailToast({ message: result.error || "שגיאה בשליחה", type: "error" });
      }
    } catch {
      setEmailToast({ message: "שגיאה בשליחה", type: "error" });
    } finally {
      setSendingEmailId(null);
      setTimeout(() => setEmailToast(null), 4000);
    }
  };

  useEffect(() => {
    fetch("/api/quotes")
      .then((r) => r.json())
      .then((data) => {
        setQuotes(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const copySignLink = (id: number) => {
    const url = `${window.location.origin}/sign/${id}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const openView = (quote: Quote) => {
    window.open(`/view/${quote.id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="w-7 h-7 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>טוען הצעות...</p>
      </div>
    );
  }

  const signedCount = quotes.filter(q => q.clientSignature).length;
  const pendingCount = quotes.filter(q => !q.clientSignature).length;
  const totalValue = quotes.reduce((sum, q) => sum + Number(q.totalAmount), 0);

  return (
    <div>
      {/* Toast */}
      {emailToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          style={{
            animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
          }}>
          <div className="px-6 py-3 rounded-[var(--radius-xs)] text-white text-sm font-medium"
            style={{
              background: emailToast.type === "success"
                ? "linear-gradient(135deg, #059669, #047857)"
                : "linear-gradient(135deg, #E8725C, #DC2626)",
              boxShadow: emailToast.type === "success"
                ? "0 4px 20px rgba(5,150,105,.3)"
                : "0 4px 20px rgba(232,114,92,.3)",
            }}>
            {emailToast.message}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-8"
        style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div>
          <h1 className="text-navy" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
            היסטוריית הצעות
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{quotes.length} הצעות במערכת</p>
        </div>
      </div>

      {/* Stats Cards */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "סה״כ שווי", value: `₪${totalValue.toLocaleString()}`, color: "#1ABC9C", delay: "0ms" },
            { label: "נחתמו", value: String(signedCount), color: "#059669", delay: "60ms" },
            { label: "ממתינות", value: String(pendingCount), color: "#F59E0B", delay: "120ms" },
          ].map((stat) => (
            <div key={stat.label}
              className="relative overflow-hidden"
              style={{
                background: "#fff",
                borderRadius: "var(--radius)",
                padding: "20px 24px",
                boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 8px 30px rgba(0,0,0,.05)",
                border: "1px solid rgba(15,23,42,.06)",
                animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${stat.delay} both`,
                transition: "box-shadow 0.3s, transform 0.3s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,.04), 0 24px 60px rgba(0,0,0,.1)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.03), 0 8px 30px rgba(0,0,0,.05)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div className="absolute top-0 right-0 w-1 h-full rounded-l-full" style={{ background: stat.color }} />
              <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "6px" }}>
                {stat.label}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--navy)", letterSpacing: "-0.02em" }}>
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      )}

      {quotes.length === 0 ? (
        <div
          className="text-center"
          style={{
            background: "#fff",
            borderRadius: "var(--radius)",
            padding: "60px 32px",
            boxShadow: "var(--shadow)",
            border: "1px solid rgba(15,23,42,.06)",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>📄</div>
          <p style={{ color: "var(--muted)", fontSize: "1.1rem", marginBottom: "20px" }}>אין הצעות עדיין</p>
          <a href="/"
            className="inline-block text-white text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #1ABC9C, #16A085)",
              padding: "12px 28px",
              borderRadius: "var(--radius-xs)",
              boxShadow: "0 2px 12px rgba(26,188,156,.25)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            צור הצעה ראשונה
          </a>
        </div>
      ) : (
        <div
          style={{
            background: "#fff",
            borderRadius: "var(--radius)",
            boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
            border: "1px solid rgba(15,23,42,.06)",
            overflow: "hidden",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 180ms both",
          }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: "2px solid rgba(15,23,42,.08)" }}>
                {["מס׳ הצעה", "תאריך", "נמען", "לקוח", "נושא", "סכום", "סטטוס", "פעולות"].map((h) => (
                  <th key={h} className="text-right px-4 py-3"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      color: "var(--muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {quotes.map((quote) => (
                <tr
                  key={quote.id}
                  style={{
                    borderBottom: "1px solid rgba(15,23,42,.06)",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,246,249,.6)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td className="px-4 py-3.5 font-mono font-medium" style={{ color: "#1ABC9C", fontSize: "0.85rem" }}>
                    {quote.quoteNumber}
                  </td>
                  <td className="px-4 py-3.5" style={{ color: "var(--muted)" }}>
                    {new Date(quote.date).toLocaleDateString("he-IL")}
                  </td>
                  <td className="px-4 py-3.5">
                    <span style={{ fontWeight: 500 }}>{quote.recipientName} {quote.recipientLast}</span>
                    <br />
                    <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{quote.recipientCompany}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span style={{ fontWeight: 500 }}>{quote.client.name}</span>
                    {quote.client.brand && (
                      <span style={{ display: "block", fontSize: "0.78rem", color: "#1ABC9C" }}>{quote.client.brand}</span>
                    )}
                  </td>
                  <td className="px-4 py-3.5">{quote.subject}</td>
                  <td className="px-4 py-3.5" style={{ fontWeight: 600, color: "var(--navy)" }}>
                    {Number(quote.totalAmount).toLocaleString()} ₪
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1.5">
                      {quote.clientSignature ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{
                            background: "rgba(5,150,105,.08)",
                            color: "#059669",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(5,150,105,.15)",
                          }}>
                          <span>✓</span> נחתם
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{
                            background: "rgba(245,158,11,.08)",
                            color: "#D97706",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(245,158,11,.15)",
                          }}>
                          <span>●</span> ממתין
                        </span>
                      )}
                      {quote.emailSentAt && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium"
                          style={{
                            background: "rgba(59,130,246,.08)",
                            color: "#2563EB",
                            padding: "4px 10px",
                            borderRadius: "20px",
                            border: "1px solid rgba(59,130,246,.15)",
                          }}>
                          ✉ נשלח
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => openView(quote)}
                        className="text-xs font-medium"
                        style={{ color: "#1ABC9C", transition: "color 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#16A085"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
                        title="צפה בהצעה"
                      >
                        צפייה
                      </button>
                      <button
                        onClick={() => copySignLink(quote.id)}
                        className="text-xs font-medium"
                        style={{ color: "#059669", transition: "color 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#047857"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#059669"; }}
                        title="העתק קישור חתימה"
                      >
                        {copiedId === quote.id ? "✓ הועתק!" : "קישור חתימה"}
                      </button>
                      {quote.contact?.email && (
                        <button
                          onClick={() => sendEmail(quote)}
                          disabled={sendingEmailId === quote.id}
                          className="text-xs font-medium disabled:opacity-50"
                          style={{ color: "#2563EB", transition: "color 0.15s" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#1D4ED8"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#2563EB"; }}
                          title={`שלח ל-${quote.contact.email}`}
                        >
                          {sendingEmailId === quote.id ? "שולח..." : "שלח מייל"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
