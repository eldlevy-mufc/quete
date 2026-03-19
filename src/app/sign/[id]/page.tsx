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
    return <div className="text-center py-20 text-gray-400">טוען הצעה...</div>;
  }

  if (signed || quote.clientSignature) {
    return (
      <div className="max-w-lg mx-auto text-center py-20">
        <div className="text-6xl mb-4">✓</div>
        <h1 className="text-2xl font-bold text-green-700 mb-2">ההצעה נחתמה בהצלחה!</h1>
        <p className="text-gray-600">תודה, {quote.recipientName}. החתימה נשמרה.</p>
        <p className="text-sm text-gray-400 mt-4">מספר הצעה: {quote.quoteNumber}</p>
      </div>
    );
  }

  const items: QuoteItem[] = typeof quote.items === "string" ? JSON.parse(quote.items) : quote.items;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <img src="/logo.svg" alt="מנצ׳" className="h-12 mx-auto mb-4" />
        <h1 className="text-2xl font-bold">חתימה על הצעת מחיר</h1>
        <p className="text-gray-500">מספר הצעה: {quote.quoteNumber}</p>
      </div>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-lg mb-3 text-purple-700">{quote.title}</h2>
        <div className="text-sm text-gray-600 space-y-1 mb-4">
          <p><strong>לכבוד:</strong> {quote.recipientName} {quote.recipientLast}, {quote.recipientCompany}</p>
          <p><strong>תאריך:</strong> {new Date(quote.date).toLocaleDateString("he-IL")}</p>
          <p><strong>לקוח:</strong> {quote.client.name}{quote.client.brand ? ` (${quote.client.brand})` : ""}</p>
          <p><strong>נושא:</strong> {quote.subject}</p>
        </div>

        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="bg-purple-50">
              <th className="text-right px-3 py-2">תיאור</th>
              <th className="text-right px-3 py-2">כמות</th>
              <th className="text-right px-3 py-2">מחיר</th>
              <th className="text-right px-3 py-2">סה״כ</th>
            </tr>
          </thead>
          <tbody>
            {items.filter(item => item.description).map((item, i) => (
              <tr key={i} className="border-b border-gray-100">
                <td className="px-3 py-2">{item.description}</td>
                <td className="px-3 py-2">{item.quantity}</td>
                <td className="px-3 py-2">₪{Number(item.unitPrice).toLocaleString()}</td>
                <td className="px-3 py-2 font-semibold">₪{Number(item.total).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-purple-50 font-bold">
              <td colSpan={3} className="px-3 py-2 text-left">סה״כ</td>
              <td className="px-3 py-2 text-purple-700">₪{Number(quote.totalAmount).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
          <p>• המחיר אינו כולל מע״מ</p>
          <p>• תנאי תשלום: {quote.paymentTerms || "לא צוין"}</p>
          {quote.notes && <p>• {quote.notes}</p>}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4 text-purple-700">חתימת הלקוח</h2>
        <p className="text-sm text-gray-500 mb-3">
          אנא חתמו כאן לאישור ההצעה:
        </p>
        <SignatureCanvas ref={sigRef} label="" />
      </section>

      <button
        onClick={handleSign}
        disabled={submitting}
        className="w-full bg-purple-600 text-white py-4 rounded-lg hover:bg-purple-700 font-medium text-lg disabled:opacity-50 mb-8"
      >
        {submitting ? "שולח..." : "אישור וחתימה"}
      </button>
    </div>
  );
}
