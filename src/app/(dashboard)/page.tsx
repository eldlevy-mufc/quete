"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SignatureCanvas, { SignatureCanvasRef } from "@/components/SignatureCanvas";
import type { QuoteItem } from "@/types";

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
}

interface Client {
  id: number;
  name: string;
  brand: string | null;
  paymentTerms: string | null;
  contacts: Contact[];
}

interface Sender {
  id: number;
  fullName: string;
  title: string;
}

const SUBJECTS = ["מדיה", "סטודיו", "קריאייטיב", "אסטרטגיה", "שונות"];

const emptyItem = (): QuoteItem => ({
  description: "",
  quantity: 1,
  unitPrice: 0,
  total: 0,
});

/* ─── Section Card wrapper ─── */
function SectionCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <section
      style={{
        background: "#fff",
        borderRadius: "var(--radius)",
        border: "1px solid var(--border)",
        padding: "28px",
        boxShadow: "var(--shadow-sm)",
        animation: `slideUp 0.45s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms both`,
        transition: "box-shadow 0.3s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "var(--shadow)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
    >
      {children}
    </section>
  );
}

function SectionHeader({ children, step }: { children: React.ReactNode; step?: number }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      {step && (
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(26,188,156,.12), rgba(26,188,156,.05))",
          color: "#1ABC9C", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "0.75rem", fontWeight: 700, flexShrink: 0,
          border: "1px solid rgba(26,188,156,.15)",
        }}>
          {step}
        </div>
      )}
      <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)", margin: 0, letterSpacing: "-0.01em" }}>
        {children}
      </h2>
    </div>
  );
}

export default function HomePage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [senders, setSenders] = useState<Sender[]>([]);
  const [recipientName, setRecipientName] = useState("");
  const [recipientLast, setRecipientLast] = useState("");
  const [recipientCompany, setRecipientCompany] = useState("");
  const [title, setTitle] = useState("הצעת מחיר");
  const [subject, setSubject] = useState("");
  const [clientId, setClientId] = useState<number>(0);
  const [senderId, setSenderId] = useState<number>(0);
  const [items, setItems] = useState<QuoteItem[]>([emptyItem(), emptyItem(), emptyItem()]);
  const [paymentTerms, setPaymentTerms] = useState("");
  const [notes, setNotes] = useState("");
  const [senderSignature, setSenderSignature] = useState("");
  const [contactId, setContactId] = useState<number>(0);
  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const sigRef = useRef<SignatureCanvasRef>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients);
    fetch("/api/senders").then(r => r.json()).then(setSenders);
  }, []);

  useEffect(() => {
    const client = clients.find(c => c.id === clientId);
    if (client?.paymentTerms) {
      setPaymentTerms(client.paymentTerms);
    }
    setContactId(0);
  }, [clientId, clients]);

  useEffect(() => {
    if (!contactId) return;
    const client = clients.find(c => c.id === clientId);
    const contact = client?.contacts?.find(ct => ct.id === contactId);
    if (contact) {
      const parts = contact.name.split(" ");
      setRecipientName(parts[0] || "");
      setRecipientLast(parts.slice(1).join(" ") || "");
      if (client) setRecipientCompany(client.name);
    }
  }, [contactId, clientId, clients]);

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updated = [...items];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (updated[index] as any)[field] = value;
    if (field === "quantity" || field === "unitPrice") {
      updated[index].total = Number(updated[index].quantity) * Number(updated[index].unitPrice);
    }
    setItems(updated);
  };

  const addRow = () => setItems([...items, emptyItem()]);
  const removeRow = (i: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== i));
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.total || 0), 0);

  const formatDate = () => {
    const d = new Date();
    return d.toLocaleDateString("he-IL");
  };

  const handleSave = async () => {
    if (!clientId || !senderId || !subject) {
      showToast("נא למלא את כל השדות הנדרשים: לקוח, שולח, ונושא", "error");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          recipientLast,
          recipientCompany,
          title,
          subject,
          clientId,
          senderId,
          contactId: contactId || null,
          items,
          totalAmount,
          notes,
          paymentTerms,
          senderSignature,
        }),
      });
      const quote = await res.json();
      setSavedQuoteId(quote.id);
      showToast(`ההצעה נשמרה בהצלחה! מספר הצעה: ${quote.quoteNumber}`);
    } catch {
      showToast("שגיאה בשמירת ההצעה", "error");
    } finally {
      setSaving(false);
    }
  };

  const generatePDF = useCallback(async () => {
    if (!savedQuoteId) {
      showToast("יש לשמור את ההצעה לפני הורדת PDF", "error");
      return;
    }

    setGenerating(true);
    try {
      const res = await fetch(`/api/quotes/${savedQuoteId}/pdf`);
      const quote = await res.json();
      const pdfItems: QuoteItem[] = typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items;

      const win = window.open("", "_blank");
      if (!win) {
        showToast("אנא אפשרו חלונות קופצים כדי להוריד PDF", "error");
        return;
      }

      const selectedClient = clients.find(c => c.id === quote.clientId);

      win.document.write(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
<meta charset="UTF-8">
<title>הצעת מחיר - ${quote.quoteNumber}</title>
<link href="https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4; margin: 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Heebo', sans-serif; color: #0F172A; padding: 40px; max-width: 210mm; margin: 0 auto; direction: rtl; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #0B1C2D; padding-bottom: 20px; }
  .logo { height: 60px; }
  .quote-info { text-align: left; font-size: 13px; color: #64748B; }
  .quote-number { font-weight: bold; color: #1ABC9C; font-size: 14px; }
  .recipient { margin-bottom: 20px; font-size: 14px; }
  .recipient strong { font-size: 15px; }
  .title-section { text-align: center; margin: 25px 0; padding: 15px; background: #F0FDF9; border-radius: 10px; }
  .title-section h1 { font-size: 22px; color: #0B1C2D; }
  .meta { display: flex; gap: 30px; margin-bottom: 20px; font-size: 14px; }
  .meta span { background: #F4F6F9; padding: 4px 12px; border-radius: 7px; border: 1px solid rgba(15,23,42,.08); }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #0B1C2D; color: white; padding: 10px 12px; text-align: right; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tr:nth-child(even) td { background: #F4F6F9; }
  .total-row { background: #F0FDF9 !important; font-weight: bold; font-size: 15px; }
  .total-row td { border-top: 2px solid #1ABC9C; }
  .notes { margin: 25px 0; padding: 15px; background: #FFFBEB; border-radius: 10px; border: 1px solid #FDE68A; font-size: 13px; }
  .notes h3 { margin-bottom: 8px; color: #92400E; font-size: 14px; }
  .notes ul { list-style: none; padding: 0; }
  .notes li { padding: 3px 0; }
  .notes li::before { content: "• "; color: #D97706; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .sig-block { text-align: center; width: 45%; }
  .sig-block h4 { margin-bottom: 10px; color: #64748B; font-size: 13px; }
  .sig-image { max-height: 80px; margin-bottom: 5px; }
  .sig-name { font-weight: bold; font-size: 14px; }
  .sig-title { color: #64748B; font-size: 12px; }
  .print-btn { position: fixed; top: 20px; left: 20px; background: #1ABC9C; color: white; border: none; padding: 12px 24px; border-radius: 10px; cursor: pointer; font-size: 14px; z-index: 1000; font-family: 'Heebo', sans-serif; }
  .print-btn:hover { background: #17a589; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">הורד / הדפס PDF</button>

<div class="header">
  <img src="/logo.jpg" class="logo" alt="מנצ׳" onerror="this.style.display='none'" />
  <div class="quote-info">
    <div class="quote-number">הצעה מס׳ ${quote.quoteNumber}</div>
    <div>תאריך: ${new Date(quote.date).toLocaleDateString("he-IL")}</div>
  </div>
</div>

<div class="recipient">
  <strong>לכבוד: ${quote.recipientName} ${quote.recipientLast}</strong><br/>
  ${quote.recipientCompany}
</div>

<div class="title-section">
  <h1>${quote.title}</h1>
</div>

<div class="meta">
  <span><strong>לקוח:</strong> ${selectedClient?.name || ""}</span>
  ${selectedClient?.brand ? `<span><strong>מותג:</strong> ${selectedClient.brand}</span>` : ""}
  <span><strong>נושא:</strong> ${quote.subject}</span>
</div>

<table>
  <thead>
    <tr>
      <th style="width:5%">#</th>
      <th style="width:45%">תיאור</th>
      <th style="width:15%">כמות</th>
      <th style="width:15%">מחיר ליחידה</th>
      <th style="width:20%">סה״כ</th>
    </tr>
  </thead>
  <tbody>
    ${pdfItems.filter(item => item.description).map((item, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>${item.description}</td>
      <td>${item.quantity}</td>
      <td>${Number(item.unitPrice).toLocaleString()} ₪</td>
      <td>${Number(item.total).toLocaleString()} ₪</td>
    </tr>`).join("")}
    <tr class="total-row">
      <td colspan="4" style="text-align:left;">סה״כ</td>
      <td>${Number(quote.totalAmount).toLocaleString()} ₪</td>
    </tr>
  </tbody>
</table>

<div class="notes">
  <h3>הערות</h3>
  <ul>
    <li>המחיר אינו כולל מע״מ</li>
    <li>תנאי תשלום: ${quote.paymentTerms || "לא צוין"}</li>
    ${quote.notes ? `<li>${quote.notes}</li>` : ""}
  </ul>
</div>

<div class="signatures">
  <div class="sig-block">
    <h4>חתימת השולח</h4>
    ${quote.senderSignature ? `<img src="${quote.senderSignature}" class="sig-image" />` : '<div style="height:80px;border-bottom:1px solid #ccc;margin-bottom:5px;"></div>'}
    <div class="sig-name">${quote.sender.fullName}</div>
    <div class="sig-title">${quote.sender.title}</div>
  </div>
  <div class="sig-block">
    <h4>חתימת הלקוח</h4>
    ${quote.clientSignature ? `<img src="${quote.clientSignature}" class="sig-image" />` : '<div style="height:80px;border-bottom:1px solid #ccc;margin-bottom:5px;"></div>'}
    <div class="sig-name">${quote.recipientName} ${quote.recipientLast}</div>
  </div>
</div>

</body>
</html>`);
      win.document.close();
    } catch {
      showToast("שגיאה ביצירת PDF", "error");
    } finally {
      setGenerating(false);
    }
  }, [savedQuoteId, clients]);

  const selectedClient = clients.find(c => c.id === clientId);

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 50,
          padding: "12px 24px", borderRadius: "var(--radius-xs)",
          color: "#fff", fontSize: "0.875rem", fontWeight: 500,
          background: toast.type === "success"
            ? "linear-gradient(135deg, #1ABC9C, #16A085)"
            : "linear-gradient(135deg, #EF4444, #DC2626)",
          boxShadow: "0 8px 30px rgba(0,0,0,.15)",
          animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="text-navy" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            הצעת מחיר חדשה
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.85rem", marginTop: 4 }}>מלא את הפרטים ושמור</p>
        </div>
        {totalAmount > 0 && (
          <div style={{
            background: "linear-gradient(135deg, rgba(26,188,156,.08), rgba(26,188,156,.03))",
            border: "1px solid rgba(26,188,156,.15)",
            borderRadius: "var(--radius-sm)", padding: "10px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: "0.7rem", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>סה״כ הצעה</div>
            <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#1ABC9C", letterSpacing: "-0.01em" }}>₪{totalAmount.toLocaleString()}</div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-5">
        {/* Recipient */}
        <SectionCard delay={0}>
          <SectionHeader step={1}>פרטי הנמען</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>שם פרטי</label>
              <input value={recipientName} onChange={e => setRecipientName(e.target.value)} placeholder="שם פרטי" />
            </div>
            <div>
              <label>שם משפחה</label>
              <input value={recipientLast} onChange={e => setRecipientLast(e.target.value)} placeholder="שם משפחה" />
            </div>
            <div>
              <label>חברה</label>
              <input value={recipientCompany} onChange={e => setRecipientCompany(e.target.value)} placeholder="שם החברה" />
            </div>
          </div>
        </SectionCard>

        {/* Quote Details */}
        <SectionCard delay={60}>
          <SectionHeader step={2}>פרטי ההצעה</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label>תאריך</label>
              <input value={formatDate()} disabled />
            </div>
            <div>
              <label>כותרת ההצעה</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="הצעת מחיר" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label>לקוח *</label>
              <select value={clientId} onChange={e => setClientId(Number(e.target.value))}>
                <option value={0}>בחר לקוח...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name}{c.brand ? ` (${c.brand})` : ""}
                  </option>
                ))}
              </select>
              {selectedClient?.brand && (
                <p className="text-xs text-teal mt-1">מותג: {selectedClient.brand}</p>
              )}
            </div>
            {selectedClient && selectedClient.contacts?.length > 0 && (
              <div>
                <label>איש קשר</label>
                <select value={contactId} onChange={e => setContactId(Number(e.target.value))}>
                  <option value={0}>בחר איש קשר...</option>
                  {selectedClient.contacts.map(ct => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}{ct.role ? ` — ${ct.role}` : ""}{ct.email ? ` (${ct.email})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>נושא ההצעה *</label>
              <select value={subject} onChange={e => setSubject(e.target.value)}>
                <option value="">בחר נושא...</option>
                {SUBJECTS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label>שולח ההצעה *</label>
              <select value={senderId} onChange={e => setSenderId(Number(e.target.value))}>
                <option value={0}>בחר שולח...</option>
                {senders.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.fullName} — {s.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </SectionCard>

        {/* Items Table */}
        <SectionCard delay={120}>
          <SectionHeader step={3}>פירוט השירותים</SectionHeader>
          <div className="overflow-x-auto" style={{ margin: "0 -8px" }}>
            <table className="w-full text-sm" style={{ borderCollapse: "separate", borderSpacing: 0 }}>
              <thead>
                <tr>
                  <th className="text-right px-3 py-2.5 text-muted" style={{ width: "5%", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid var(--border)" }}>#</th>
                  <th className="text-right px-3 py-2.5 text-muted" style={{ width: "40%", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid var(--border)" }}>תיאור</th>
                  <th className="text-right px-3 py-2.5 text-muted" style={{ width: "15%", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid var(--border)" }}>כמות</th>
                  <th className="text-right px-3 py-2.5 text-muted" style={{ width: "15%", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid var(--border)" }}>מחיר ליחידה (₪)</th>
                  <th className="text-right px-3 py-2.5 text-muted" style={{ width: "15%", fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: "2px solid var(--border)" }}>סה״כ (₪)</th>
                  <th style={{ width: "10%", borderBottom: "2px solid var(--border)" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                    <td className="px-3 py-2.5 text-muted" style={{ fontSize: "0.8rem" }}>{i + 1}</td>
                    <td className="px-3 py-2">
                      <input value={item.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="תיאור השירות" />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={item.quantity || ""} onChange={e => updateItem(i, "quantity", Number(e.target.value))} />
                    </td>
                    <td className="px-3 py-2">
                      <input type="number" min="0" value={item.unitPrice || ""} onChange={e => updateItem(i, "unitPrice", Number(e.target.value))} />
                    </td>
                    <td className="px-3 py-2" style={{ fontWeight: 600, color: "var(--navy)" }}>
                      ₪{item.total.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {items.length > 1 && (
                        <button type="button" onClick={() => removeRow(i)}
                          style={{ color: "#CBD5E1", fontSize: "0.9rem", transition: "color 0.15s", cursor: "pointer", background: "none", border: "none" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#E8725C"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = "#CBD5E1"; }}>
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="px-3 py-3 text-left" style={{ fontWeight: 700, color: "var(--navy)", borderTop: "2px solid rgba(26,188,156,.25)", background: "rgba(26,188,156,.04)" }}>סה״כ</td>
                  <td className="px-3 py-3" style={{ fontWeight: 700, fontSize: "1.1rem", color: "#1ABC9C", borderTop: "2px solid rgba(26,188,156,.25)", background: "rgba(26,188,156,.04)" }}>₪{totalAmount.toLocaleString()}</td>
                  <td style={{ borderTop: "2px solid rgba(26,188,156,.25)", background: "rgba(26,188,156,.04)" }}></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button type="button" onClick={addRow}
            className="mt-3 text-sm font-medium"
            style={{ color: "#1ABC9C", background: "none", border: "none", cursor: "pointer", transition: "opacity 0.15s" }}
            onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}>
            + הוסף שורה
          </button>
        </SectionCard>

        {/* Notes & Payment */}
        <SectionCard delay={180}>
          <SectionHeader step={4}>הערות ותנאי תשלום</SectionHeader>
          <div style={{
            background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "var(--radius-xs)",
            padding: "14px 16px", marginBottom: "16px", fontSize: "0.85rem",
          }}>
            <p style={{ fontWeight: 600, color: "#92400E", marginBottom: 4, fontSize: "0.8rem" }}>הערות קבועות:</p>
            <ul style={{ margin: 0, paddingRight: 0, listStyle: "none", color: "#A16207" }}>
              <li>• המחיר אינו כולל מע״מ</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>תנאי תשלום</label>
              <input value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} placeholder='למשל: שוטף + 30' />
            </div>
            <div>
              <label>הערות נוספות</label>
              <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="הערות נוספות (אופציונלי)" rows={2} />
            </div>
          </div>
        </SectionCard>

        {/* Signature */}
        <SectionCard delay={240}>
          <SectionHeader step={5}>חתימה</SectionHeader>
          <div className="max-w-md">
            <SignatureCanvas ref={sigRef} label="חתימת השולח" onEnd={(dataUrl) => setSenderSignature(dataUrl)} />
          </div>
        </SectionCard>

        {/* Actions */}
        <div className="flex flex-wrap gap-3 pb-8" style={{ animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 300ms both" }}>
          <button onClick={handleSave} disabled={saving}
            className="font-bold disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #1ABC9C, #16A085)",
              color: "#fff", padding: "12px 32px", borderRadius: "var(--radius-xs)",
              border: "none", cursor: saving ? "not-allowed" : "pointer",
              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              boxShadow: "0 2px 12px rgba(26,188,156,.2)",
              fontSize: "0.9rem",
            }}
            onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,188,156,.3)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
            onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,188,156,.2)"; e.currentTarget.style.transform = "translateY(0)"; }}>
            {saving ? "שומר..." : "שמור הצעה"}
          </button>
          <button onClick={generatePDF} disabled={generating || !savedQuoteId}
            className="font-medium disabled:opacity-50"
            style={{
              background: "#fff", color: "var(--navy)", padding: "12px 32px",
              borderRadius: "var(--radius-xs)", border: "1.5px solid var(--border-strong)",
              cursor: (generating || !savedQuoteId) ? "not-allowed" : "pointer",
              transition: "all 0.2s", fontSize: "0.9rem",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#1ABC9C"; e.currentTarget.style.color = "#1ABC9C"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border-strong)"; e.currentTarget.style.color = "var(--navy)"; }}>
            {generating ? "מייצר..." : "הורד PDF"}
          </button>
          {savedQuoteId && (
            <>
              <button
                onClick={() => {
                  const url = `${window.location.origin}/sign/${savedQuoteId}`;
                  navigator.clipboard.writeText(url);
                  showToast(`קישור חתימה הועתק: ${url}`);
                }}
                className="font-medium"
                style={{
                  background: "var(--navy)", color: "#fff", padding: "12px 32px",
                  borderRadius: "var(--radius-xs)", border: "none", cursor: "pointer",
                  transition: "all 0.2s", fontSize: "0.9rem",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "var(--navy2)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "var(--navy)"; }}>
                העתק קישור חתימה ללקוח
              </button>
              {(() => {
                const contact = selectedClient?.contacts?.find(ct => ct.id === contactId);
                return contact?.email ? (
                  <button
                    onClick={async () => {
                      setSendingEmail(true);
                      try {
                        const res = await fetch(`/api/quotes/${savedQuoteId}/send-email`, {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ to: contact.email, contactName: contact.name }),
                        });
                        const result = await res.json();
                        if (res.ok) {
                          showToast(`המייל נשלח בהצלחה ל-${contact.email}`);
                        } else {
                          showToast(result.error || "שגיאה בשליחת מייל", "error");
                        }
                      } catch {
                        showToast("שגיאה בשליחת מייל", "error");
                      } finally {
                        setSendingEmail(false);
                      }
                    }}
                    disabled={sendingEmail}
                    className="font-medium disabled:opacity-50"
                    style={{
                      background: "var(--navy2)", color: "#fff", padding: "12px 32px",
                      borderRadius: "var(--radius-xs)", border: "none",
                      cursor: sendingEmail ? "not-allowed" : "pointer",
                      transition: "all 0.2s", fontSize: "0.9rem",
                    }}>
                    {sendingEmail ? "שולח..." : `שלח למייל (${contact.email})`}
                  </button>
                ) : null;
              })()}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
