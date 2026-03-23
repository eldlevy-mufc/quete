"use client";

import { useState, useEffect, useRef, use } from "react";
import SignatureCanvas, { SignatureCanvasRef } from "@/components/SignatureCanvas";
import type { QuoteItem } from "@/types";

interface QuoteData {
  id: number;
  quoteNumber: string;
  recipientName: string;
  recipientLast: string;
  recipientCompany: string;
  date: string;
  title: string;
  subject: string;
  items: string;
  totalAmount: number;
  paymentTerms: string;
  notes: string | null;
  clientSignature: string | null;
  senderSignature: string | null;
  client: { name: string; brand: string | null };
  sender: { fullName: string; title: string };
}

export default function SignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [signed, setSigned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const sigRef = useRef<SignatureCanvasRef>(null);

  useEffect(() => {
    fetch(`/api/quotes/${id}/pdf`).then(r => r.json()).then(setQuote);
  }, [id]);

  const handleSign = async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      alert("נא לחתום לפני השליחה");
      return;
    }

    setSubmitting(true);
    try {
      await fetch(`/api/quotes/${id}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientSignature: sigRef.current.toDataURL() }),
      });
      setSigned(true);
    } catch {
      alert("שגיאה בשמירת החתימה");
    } finally {
      setSubmitting(false);
    }
  };

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>טוען...</p>
        </div>
      </div>
    );
  }

  if (signed || quote.clientSignature) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden" dir="rtl"
        style={{ background: "linear-gradient(145deg, #F4F6F9 0%, #EDF0F4 50%, #F4F6F9 100%)" }}>
        {/* Background texture */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,.025) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }} />
        <div className="max-w-lg mx-auto text-center py-20 relative z-10"
          style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "rgba(5,150,105,.06)",
            border: "2px solid rgba(5,150,105,.2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 24px",
            boxShadow: "0 4px 20px rgba(5,150,105,.12)",
          }}>
            <span style={{ fontSize: "2.5rem", color: "#059669" }}>✓</span>
          </div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "#059669", marginBottom: "8px" }}>
            ההצעה נחתמה בהצלחה!
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "1rem" }}>תודה, {quote.recipientName}. החתימה נשמרה.</p>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginTop: "16px" }}>מספר הצעה: {quote.quoteNumber}</p>
        </div>
      </div>
    );
  }

  const items: QuoteItem[] = typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items;

  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden" dir="rtl"
      style={{ background: "linear-gradient(145deg, #F4F6F9 0%, #EDF0F4 50%, #F4F6F9 100%)" }}>

      {/* Background texture */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,.025) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

      {/* Decorative orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(26,188,156,.12), transparent 70%)", filter: "blur(80px)" }} />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="inline-block overflow-hidden mb-5"
            style={{
              padding: "14px",
              background: "#fff",
              borderRadius: "var(--radius-sm)",
              boxShadow: "0 2px 12px rgba(0,0,0,.06)",
              border: "1px solid rgba(15,23,42,.05)",
            }}>
            <img src="/logo.jpg" alt="מנצ׳" style={{ height: "36px", display: "block" }} />
          </div>
          <h1 style={{ fontSize: "1.65rem", fontWeight: 700, color: "var(--navy)", letterSpacing: "-0.02em", marginBottom: "6px" }}>
            חתימה על הצעת מחיר
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>מספר הצעה: {quote.quoteNumber}</p>
        </div>

        {/* Quote details card */}
        <section
          style={{
            background: "#fff",
            borderRadius: "var(--radius)",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
            border: "1px solid rgba(15,23,42,.06)",
            marginBottom: "20px",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 60ms both",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1ABC9C", marginBottom: "14px" }}>{quote.title}</h2>
          <div className="text-sm space-y-1.5 mb-5" style={{ color: "var(--muted)" }}>
            <p><strong style={{ color: "var(--navy)" }}>לכבוד:</strong> {quote.recipientName} {quote.recipientLast}, {quote.recipientCompany}</p>
            <p><strong style={{ color: "var(--navy)" }}>תאריך:</strong> {new Date(quote.date).toLocaleDateString("he-IL")}</p>
            <p><strong style={{ color: "var(--navy)" }}>לקוח:</strong> {quote.client.name}{quote.client.brand ? ` (${quote.client.brand})` : ""}</p>
            <p><strong style={{ color: "var(--navy)" }}>נושא:</strong> {quote.subject}</p>
          </div>

          {/* Items table */}
          <div style={{ borderRadius: "var(--radius-xs)", overflow: "hidden", border: "1px solid rgba(15,23,42,.08)", marginBottom: "16px" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: "2px solid rgba(15,23,42,.08)" }}>
                  {["תיאור", "כמות", "מחיר", "סה״כ"].map((h) => (
                    <th key={h} className="text-right px-3 py-2.5"
                      style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.filter(item => item.description).map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(15,23,42,.06)" }}>
                    <td className="px-3 py-2.5">{item.description}</td>
                    <td className="px-3 py-2.5" style={{ color: "var(--muted)" }}>{item.quantity}</td>
                    <td className="px-3 py-2.5" style={{ color: "var(--muted)" }}>₪{Number(item.unitPrice).toLocaleString()}</td>
                    <td className="px-3 py-2.5" style={{ fontWeight: 600 }}>₪{Number(item.total).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "rgba(26,188,156,.04)" }}>
                  <td colSpan={3} className="px-3 py-2.5 text-left"
                    style={{ fontWeight: 700, borderTop: "2px solid #1ABC9C" }}>סה״כ</td>
                  <td className="px-3 py-2.5"
                    style={{ fontWeight: 700, color: "#1ABC9C", borderTop: "2px solid #1ABC9C" }}>
                    ₪{Number(quote.totalAmount).toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          <div style={{
            padding: "12px 16px",
            background: "rgba(245,158,11,.04)",
            border: "1px solid rgba(245,158,11,.12)",
            borderRadius: "var(--radius-xs)",
            fontSize: "0.85rem",
          }}>
            <p style={{ color: "#B45309" }}>• המחיר אינו כולל מע״מ</p>
            <p style={{ color: "#B45309" }}>• תנאי תשלום: {quote.paymentTerms || "לא צוין"}</p>
            {quote.notes && <p style={{ color: "#B45309" }}>• {quote.notes}</p>}
          </div>
        </section>

        {/* Signature card */}
        <section
          style={{
            background: "#fff",
            borderRadius: "var(--radius)",
            padding: "28px",
            boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
            border: "1px solid rgba(15,23,42,.06)",
            marginBottom: "20px",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 120ms both",
          }}
        >
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, color: "#1ABC9C", marginBottom: "12px" }}>חתימת הלקוח</h2>
          <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "14px" }}>
            אנא חתמו כאן לאישור ההצעה:
          </p>
          <SignatureCanvas ref={sigRef} label="" />
        </section>

        {/* Submit button */}
        <button
          onClick={handleSign}
          disabled={submitting}
          className="w-full text-white font-bold text-lg disabled:opacity-50"
          style={{
            background: "linear-gradient(135deg, #1ABC9C, #16A085)",
            padding: "16px",
            borderRadius: "var(--radius-xs)",
            border: "none",
            cursor: submitting ? "not-allowed" : "pointer",
            boxShadow: "0 4px 20px rgba(26,188,156,.3)",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            marginBottom: "32px",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 180ms both",
          }}
          onMouseEnter={(e) => {
            if (!submitting) {
              e.currentTarget.style.boxShadow = "0 6px 28px rgba(26,188,156,.4)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,188,156,.3)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {submitting ? "שולח..." : "אישור וחתימה"}
        </button>
      </div>
    </div>
  );
}
