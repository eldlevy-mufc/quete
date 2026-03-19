"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SignatureCanvas, { SignatureCanvasRef } from "@/components/SignatureCanvas";
import type { QuoteItem } from "@/types";

interface Client {
  id: number;
  name: string;
  brand: string | null;
  paymentTerms: string | null;
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
  const [saving, setSaving] = useState(false);
  const [savedQuoteId, setSavedQuoteId] = useState<number | null>(null);
  const [generating, setGenerating] = useState(false);
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

  // When client changes, update payment terms
  useEffect(() => {
    const client = clients.find(c => c.id === clientId);
    if (client?.paymentTerms) {
      setPaymentTerms(client.paymentTerms);
    }
  }, [clientId, clients]);

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

      // Build PDF in a new window
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
<style>
  @page { size: A4; margin: 20mm; }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #333; padding: 40px; max-width: 210mm; margin: 0 auto; direction: rtl; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 30px; border-bottom: 3px solid #7c3aed; padding-bottom: 20px; }
  .logo { height: 60px; }
  .quote-info { text-align: left; font-size: 13px; color: #666; }
  .quote-number { font-weight: bold; color: #7c3aed; font-size: 14px; }
  .recipient { margin-bottom: 20px; font-size: 14px; }
  .recipient strong { font-size: 15px; }
  .title-section { text-align: center; margin: 25px 0; padding: 15px; background: #f5f3ff; border-radius: 8px; }
  .title-section h1 { font-size: 22px; color: #7c3aed; }
  .meta { display: flex; gap: 30px; margin-bottom: 20px; font-size: 14px; }
  .meta span { background: #f3f4f6; padding: 4px 12px; border-radius: 6px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #7c3aed; color: white; padding: 10px 12px; text-align: right; font-size: 13px; }
  td { padding: 10px 12px; border-bottom: 1px solid #e5e7eb; font-size: 13px; }
  tr:nth-child(even) td { background: #faf9ff; }
  .total-row { background: #f5f3ff !important; font-weight: bold; font-size: 15px; }
  .total-row td { border-top: 2px solid #7c3aed; }
  .notes { margin: 25px 0; padding: 15px; background: #fffbeb; border-radius: 8px; border: 1px solid #fde68a; font-size: 13px; }
  .notes h3 { margin-bottom: 8px; color: #92400e; font-size: 14px; }
  .notes ul { list-style: none; padding: 0; }
  .notes li { padding: 3px 0; }
  .notes li::before { content: "• "; color: #d97706; }
  .signatures { display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
  .sig-block { text-align: center; width: 45%; }
  .sig-block h4 { margin-bottom: 10px; color: #666; font-size: 13px; }
  .sig-image { max-height: 80px; margin-bottom: 5px; }
  .sig-name { font-weight: bold; font-size: 14px; }
  .sig-title { color: #666; font-size: 12px; }
  .print-btn { position: fixed; top: 20px; left: 20px; background: #7c3aed; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer; font-size: 14px; z-index: 1000; }
  .print-btn:hover { background: #6d28d9; }
  @media print { .print-btn { display: none; } }
</style>
</head>
<body>
<button class="print-btn" onclick="window.print()">הורד / הדפס PDF</button>

<div class="header">
  <img src="/logo.svg" class="logo" alt="מנצ׳" onerror="this.style.display='none'" />
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
      {toast && (
        <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg text-white text-sm font-medium transition-all ${
          toast.type === "success" ? "bg-green-600" : "bg-red-500"
        }`}>
          {toast.message}
        </div>
      )}
      <h1 className="text-2xl font-bold mb-6">הצעת מחיר חדשה</h1>

      <div className="space-y-6">
        {/* Recipient */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">פרטי הנמען</h2>
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
        </section>

        {/* Quote Details */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">פרטי ההצעה</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label>תאריך</label>
              <input value={formatDate()} disabled className="bg-gray-100" />
            </div>
            <div>
              <label>כותרת ההצעה</label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="הצעת מחיר" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <p className="text-xs text-purple-500 mt-1">מותג: {selectedClient.brand}</p>
              )}
            </div>
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
        </section>

        {/* Items Table */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">פירוט השירותים</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-purple-50">
                  <th className="text-right px-3 py-2 font-medium" style={{ width: "5%" }}>#</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ width: "40%" }}>תיאור</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ width: "15%" }}>כמות</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ width: "15%" }}>מחיר ליחידה (₪)</th>
                  <th className="text-right px-3 py-2 font-medium" style={{ width: "15%" }}>סה״כ (₪)</th>
                  <th style={{ width: "10%" }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100">
                    <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                    <td className="px-3 py-2">
                      <input
                        value={item.description}
                        onChange={e => updateItem(i, "description", e.target.value)}
                        placeholder="תיאור השירות"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.quantity || ""}
                        onChange={e => updateItem(i, "quantity", Number(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || ""}
                        onChange={e => updateItem(i, "unitPrice", Number(e.target.value))}
                      />
                    </td>
                    <td className="px-3 py-2 font-semibold text-purple-700">
                      ₪{item.total.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRow(i)}
                          className="text-red-400 hover:text-red-600 text-lg"
                        >
                          ✕
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-purple-50 font-bold">
                  <td colSpan={4} className="px-3 py-3 text-left">סה״כ</td>
                  <td className="px-3 py-3 text-purple-700 text-lg">₪{totalAmount.toLocaleString()}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <button
            type="button"
            onClick={addRow}
            className="mt-3 text-sm text-purple-600 hover:text-purple-800 font-medium"
          >
            + הוסף שורה
          </button>
        </section>

        {/* Notes & Payment */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">הערות ותנאי תשלום</h2>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-sm">
            <p className="font-medium text-amber-800">הערות קבועות:</p>
            <ul className="mt-1 text-amber-700">
              <li>• המחיר אינו כולל מע״מ</li>
            </ul>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label>תנאי תשלום</label>
              <input
                value={paymentTerms}
                onChange={e => setPaymentTerms(e.target.value)}
                placeholder='למשל: שוטף + 30'
              />
            </div>
            <div>
              <label>הערות נוספות</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="הערות נוספות (אופציונלי)"
                rows={2}
              />
            </div>
          </div>
        </section>

        {/* Signature */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold mb-4 text-purple-700">חתימה</h2>
          <div className="max-w-md">
            <SignatureCanvas
              ref={sigRef}
              label="חתימת השולח"
              onEnd={(dataUrl) => setSenderSignature(dataUrl)}
            />
          </div>
        </section>

        {/* Actions */}
        <div className="flex gap-4 pb-8">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 font-medium disabled:opacity-50"
          >
            {saving ? "שומר..." : "שמור הצעה"}
          </button>
          <button
            onClick={generatePDF}
            disabled={generating || !savedQuoteId}
            className="bg-white text-purple-600 border-2 border-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 font-medium disabled:opacity-50"
          >
            {generating ? "מייצר..." : "הורד PDF"}
          </button>
          {savedQuoteId && (
            <button
              onClick={() => {
                const url = `${window.location.origin}/sign/${savedQuoteId}`;
                navigator.clipboard.writeText(url);
                showToast(`קישור חתימה הועתק: ${url}`);
              }}
              className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 font-medium"
            >
              העתק קישור חתימה ללקוח
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
