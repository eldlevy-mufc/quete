"use client";

import { useState, useEffect, use } from "react";
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
  items: string | QuoteItem[];
  totalAmount: number;
  paymentTerms: string;
  notes: string | null;
  clientSignature: string | null;
  senderSignature: string | null;
  client: { name: string; brand: string | null };
  sender: { fullName: string; title: string };
}

export default function ViewQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [quote, setQuote] = useState<QuoteData | null>(null);

  useEffect(() => {
    fetch(`/api/quotes/${id}/pdf`).then((r) => r.json()).then(setQuote);
  }, [id]);

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-7 h-7 border-2 border-teal border-t-transparent rounded-full animate-spin" />
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>טוען הצעה...</p>
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

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Main document card */}
        <div
          className="print:shadow-none print:border-none print:p-0"
          style={{
            background: "#fff",
            borderRadius: "var(--radius)",
            padding: "40px",
            boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
            border: "1px solid rgba(15,23,42,.06)",
            animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-start mb-8 pb-6"
            style={{ borderBottom: "3px solid #1ABC9C" }}>
            <div style={{
              padding: "10px",
              background: "#fff",
              borderRadius: "var(--radius-xs)",
              boxShadow: "0 2px 8px rgba(0,0,0,.06)",
              border: "1px solid rgba(15,23,42,.05)",
            }}>
              <img src="/logo.jpg" alt="מנצ׳" style={{ height: "40px", display: "block" }} />
            </div>
            <div className="text-left text-sm">
              <div style={{ fontWeight: 700, color: "#1ABC9C", fontSize: "1.05rem", marginBottom: "4px" }}>
                הצעה מס׳ {quote.quoteNumber}
              </div>
              <div style={{ color: "var(--muted)" }}>
                תאריך: {new Date(quote.date).toLocaleDateString("he-IL")}
              </div>
            </div>
          </div>

          {/* Recipient */}
          <div className="mb-6 text-sm">
            <p style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)" }}>
              לכבוד: {quote.recipientName} {quote.recipientLast}
            </p>
            <p style={{ color: "var(--muted)" }}>{quote.recipientCompany}</p>
          </div>

          {/* Title */}
          <div className="text-center mb-6"
            style={{
              padding: "16px 20px",
              background: "rgba(26,188,156,.04)",
              borderRadius: "var(--radius-sm)",
              border: "1px solid rgba(26,188,156,.12)",
            }}>
            <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1ABC9C" }}>{quote.title}</h1>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-3 mb-6 text-sm">
            {[
              { label: "לקוח", value: quote.client.name },
              ...(quote.client.brand ? [{ label: "מותג", value: quote.client.brand }] : []),
              { label: "נושא", value: quote.subject },
            ].map((meta) => (
              <span key={meta.label}
                style={{
                  background: "var(--bg)",
                  padding: "8px 14px",
                  borderRadius: "var(--radius-xs)",
                  color: "var(--muted)",
                  border: "1px solid rgba(15,23,42,.06)",
                }}>
                <strong style={{ color: "var(--navy)" }}>{meta.label}:</strong> {meta.value}
              </span>
            ))}
          </div>

          {/* Items Table */}
          <div style={{ borderRadius: "var(--radius-sm)", overflow: "hidden", border: "1px solid rgba(15,23,42,.08)", marginBottom: "24px" }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ background: "#0B1C2D" }}>
                  {[
                    { label: "#", width: "5%" },
                    { label: "תיאור", width: "45%" },
                    { label: "כמות", width: "15%" },
                    { label: "מחיר ליחידה", width: "15%" },
                    { label: "סה״כ", width: "20%" },
                  ].map((col) => (
                    <th key={col.label} className="text-right px-3 py-3 text-white"
                      style={{ width: col.width, fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.02em" }}>
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.filter((item) => item.description).map((item, i) => (
                  <tr key={i} style={{ background: i % 2 === 1 ? "rgba(244,246,249,.5)" : "transparent" }}>
                    <td className="px-3 py-2.5" style={{ color: "var(--muted)", borderBottom: "1px solid rgba(15,23,42,.06)" }}>{i + 1}</td>
                    <td className="px-3 py-2.5" style={{ borderBottom: "1px solid rgba(15,23,42,.06)" }}>{item.description}</td>
                    <td className="px-3 py-2.5" style={{ color: "var(--muted)", borderBottom: "1px solid rgba(15,23,42,.06)" }}>{item.quantity}</td>
                    <td className="px-3 py-2.5" style={{ color: "var(--muted)", borderBottom: "1px solid rgba(15,23,42,.06)" }}>{Number(item.unitPrice).toLocaleString()} ₪</td>
                    <td className="px-3 py-2.5" style={{ fontWeight: 600, borderBottom: "1px solid rgba(15,23,42,.06)" }}>{Number(item.total).toLocaleString()} ₪</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "rgba(26,188,156,.04)" }}>
                  <td colSpan={4} className="px-3 py-3 text-left"
                    style={{ fontWeight: 700, fontSize: "1rem", borderTop: "2px solid #1ABC9C" }}>
                    סה״כ
                  </td>
                  <td className="px-3 py-3"
                    style={{ fontWeight: 700, fontSize: "1rem", color: "#1ABC9C", borderTop: "2px solid #1ABC9C" }}>
                    {Number(quote.totalAmount).toLocaleString()} ₪
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes */}
          <div className="mb-8"
            style={{
              padding: "16px 20px",
              background: "rgba(245,158,11,.04)",
              border: "1px solid rgba(245,158,11,.15)",
              borderRadius: "var(--radius-sm)",
            }}>
            <h3 style={{ fontWeight: 700, color: "#D97706", fontSize: "0.85rem", marginBottom: "8px" }}>הערות</h3>
            <ul className="space-y-1" style={{ fontSize: "0.85rem", color: "#B45309" }}>
              <li>• המחיר אינו כולל מע״מ</li>
              <li>• תנאי תשלום: {quote.paymentTerms || "לא צוין"}</li>
              {quote.notes && <li>• {quote.notes}</li>}
            </ul>
          </div>

          {/* Signatures */}
          <div className="flex justify-between pt-6" style={{ borderTop: "1px solid rgba(15,23,42,.08)" }}>
            <div className="text-center w-[45%]">
              <h4 style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                חתימת השולח
              </h4>
              {quote.senderSignature ? (
                <img src={quote.senderSignature} alt="חתימת שולח" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 mb-2" style={{ borderBottom: "1px solid rgba(15,23,42,.1)" }} />
              )}
              <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{quote.sender.fullName}</p>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{quote.sender.title}</p>
            </div>
            <div className="text-center w-[45%]">
              <h4 style={{ fontSize: "0.78rem", color: "var(--muted)", marginBottom: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                חתימת הלקוח
              </h4>
              {quote.clientSignature ? (
                <img src={quote.clientSignature} alt="חתימת לקוח" className="max-h-20 mx-auto mb-2" />
              ) : (
                <div className="h-20 mb-2 flex items-end justify-center" style={{ borderBottom: "1px solid rgba(15,23,42,.1)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--muted)", marginBottom: "4px" }}>טרם נחתם</span>
                </div>
              )}
              <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{quote.recipientName} {quote.recipientLast}</p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 justify-center mt-6 print:hidden"
          style={{ animation: "fadeIn 0.5s ease-out 0.3s both" }}>
          <button
            onClick={() => window.print()}
            className="text-white text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #1ABC9C, #16A085)",
              padding: "12px 28px",
              borderRadius: "var(--radius-xs)",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 12px rgba(26,188,156,.25)",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,188,156,.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,188,156,.25)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            הורד / הדפס PDF
          </button>
          <a
            href="/quotes"
            className="text-sm font-medium"
            style={{
              padding: "12px 28px",
              borderRadius: "var(--radius-xs)",
              border: "1.5px solid rgba(15,23,42,.12)",
              background: "#fff",
              color: "var(--navy)",
              transition: "all 0.2s",
              display: "inline-block",
              textDecoration: "none",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,.25)";
              (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 8px rgba(0,0,0,.06)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,.12)";
              (e.currentTarget as HTMLElement).style.boxShadow = "none";
            }}
          >
            חזרה להצעות
          </a>
        </div>
      </div>
    </div>
  );
}
