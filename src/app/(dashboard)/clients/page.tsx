"use client";

import React, { useState, useEffect, useRef } from "react";
import * as XLSX from "xlsx";

interface Contact {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  clientId: number;
}

interface Client {
  id: number;
  name: string;
  brand: string | null;
  paymentTerms: string | null;
  contacts: Contact[];
}

interface Brand {
  id: number;
  name: string;
}

/* ─── Reusable premium card wrapper ─── */
function SectionCard({ children, delay = "0ms", className = "" }: { children: React.ReactNode; delay?: string; className?: string }) {
  return (
    <div
      className={className}
      style={{
        background: "#fff",
        borderRadius: "var(--radius)",
        padding: "28px 28px 24px",
        boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
        border: "1px solid rgba(15,23,42,.06)",
        marginBottom: "28px",
        animation: `slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay} both`,
        transition: "box-shadow 0.3s, transform 0.3s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,.04), 0 24px 60px rgba(0,0,0,.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)";
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div style={{
        width: "28px", height: "28px", borderRadius: "50%",
        background: "linear-gradient(135deg, #1ABC9C, #16A085)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontSize: "0.75rem", fontWeight: 700,
        boxShadow: "0 2px 8px rgba(26,188,156,.3)",
      }}>
        {icon}
      </div>
      <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)" }}>{title}</h2>
    </div>
  );
}

/* ─── Primary button ─── */
function PrimaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      {...props}
      className="text-white text-sm font-bold"
      style={{
        background: "linear-gradient(135deg, #1ABC9C, #16A085)",
        padding: "10px 24px",
        borderRadius: "var(--radius-xs)",
        border: "none",
        cursor: props.disabled ? "not-allowed" : "pointer",
        boxShadow: "0 2px 12px rgba(26,188,156,.25)",
        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
        opacity: props.disabled ? 0.5 : 1,
      }}
      onMouseEnter={(e) => {
        if (!props.disabled) {
          e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,188,156,.35)";
          e.currentTarget.style.transform = "translateY(-1px)";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,188,156,.25)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      {children}
    </button>
  );
}

function SecondaryButton({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { children: React.ReactNode }) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 24px",
        borderRadius: "var(--radius-xs)",
        border: "1.5px solid rgba(15,23,42,.12)",
        background: "transparent",
        color: "var(--muted)",
        fontSize: "0.875rem",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(15,23,42,.25)";
        e.currentTarget.style.color = "var(--navy)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(15,23,42,.12)";
        e.currentTarget.style.color = "var(--muted)";
      }}
    >
      {children}
    </button>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [form, setForm] = useState({ name: "", brand: "", customBrand: "", paymentTerms: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [importing, setImporting] = useState(false);
  const [importMsg, setImportMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newBrandName, setNewBrandName] = useState("");
  const [brandError, setBrandError] = useState("");

  const [expandedClientId, setExpandedClientId] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", phone: "", role: "" });
  const [editingContactId, setEditingContactId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients);
    fetch("/api/brands").then(r => r.json()).then(setBrands);
  }, []);

  const brandValue = form.brand === "__custom__" ? form.customBrand : form.brand;

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMsg(null);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet);

      if (rows.length === 0) {
        setImportMsg({ type: "error", text: "הקובץ ריק" });
        return;
      }

      const mapped = rows.map((row) => {
        const keys = Object.keys(row);
        return {
          name: row["שם לקוח"] || row["שם"] || row["לקוח"] || row["name"] || row[keys[0]] || "",
          brand: row["מותג"] || row["brand"] || row[keys[1]] || "",
          paymentTerms: row["תנאי תשלום"] || row["paymentTerms"] || row[keys[2]] || "",
        };
      }).filter(c => c.name.trim());

      if (mapped.length === 0) {
        setImportMsg({ type: "error", text: "לא נמצאו שמות לקוחות בקובץ" });
        return;
      }

      const res = await fetch("/api/clients/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clients: mapped }),
      });

      const result = await res.json();

      if (!res.ok) {
        setImportMsg({ type: "error", text: result.error || "שגיאה בייבוא" });
        return;
      }

      const updated = await fetch("/api/clients").then(r => r.json());
      setClients(updated);

      const parts = [];
      if (result.created.length > 0) parts.push(`${result.created.length} לקוחות יובאו`);
      if (result.skipped.length > 0) parts.push(`${result.skipped.length} דולגו (כבר קיימים)`);
      setImportMsg({ type: "success", text: parts.join(", ") });
    } catch {
      setImportMsg({ type: "error", text: "שגיאה בקריאת הקובץ" });
    } finally {
      setImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name: form.name, brand: brandValue, paymentTerms: form.paymentTerms };

    if (editingId) {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...payload }),
      });
      const updated = await res.json();
      setClients(clients.map(c => (c.id === editingId ? { ...c, ...updated } : c)));
      setEditingId(null);
    } else {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const created = await res.json();
      setClients([...clients, { ...created, contacts: [] }]);
    }
    setForm({ name: "", brand: "", customBrand: "", paymentTerms: "" });
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    const isGlobalBrand = brands.some(b => b.name === client.brand);
    setForm({
      name: client.name,
      brand: client.brand ? (isGlobalBrand ? client.brand : "__custom__") : "",
      customBrand: client.brand && !isGlobalBrand ? client.brand : "",
      paymentTerms: client.paymentTerms || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק את הלקוח? כל אנשי הקשר שלו יימחקו גם.")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    setClients(clients.filter(c => c.id !== id));
    if (expandedClientId === id) setExpandedClientId(null);
  };

  const handleContactSubmit = async (clientId: number) => {
    if (!contactForm.name.trim()) return;

    if (editingContactId) {
      const res = await fetch(`/api/clients/${clientId}/contacts`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingContactId, ...contactForm }),
      });
      const updated = await res.json();
      setClients(clients.map(c =>
        c.id === clientId
          ? { ...c, contacts: c.contacts.map(ct => ct.id === editingContactId ? updated : ct) }
          : c
      ));
      setEditingContactId(null);
    } else {
      const res = await fetch(`/api/clients/${clientId}/contacts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      const created = await res.json();
      setClients(clients.map(c =>
        c.id === clientId ? { ...c, contacts: [...c.contacts, created] } : c
      ));
    }
    setContactForm({ name: "", email: "", phone: "", role: "" });
  };

  const handleContactEdit = (contact: Contact) => {
    setEditingContactId(contact.id);
    setContactForm({
      name: contact.name,
      email: contact.email || "",
      phone: contact.phone || "",
      role: contact.role || "",
    });
  };

  const handleContactDelete = async (clientId: number, contactId: number) => {
    if (!confirm("למחוק את איש הקשר?")) return;
    await fetch(`/api/clients/${clientId}/contacts?contactId=${contactId}`, { method: "DELETE" });
    setClients(clients.map(c =>
      c.id === clientId ? { ...c, contacts: c.contacts.filter(ct => ct.id !== contactId) } : c
    ));
  };

  const handleAddBrand = async () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    setBrandError("");
    const res = await fetch("/api/brands", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });
    if (!res.ok) {
      setBrandError("מותג עם שם זה כבר קיים");
      return;
    }
    const created = await res.json();
    setBrands([...brands, created].sort((a, b) => a.name.localeCompare(b.name)));
    setNewBrandName("");
  };

  const handleDeleteBrand = async (id: number) => {
    if (!confirm("למחוק את המותג?")) return;
    await fetch(`/api/brands?id=${id}`, { method: "DELETE" });
    setBrands(brands.filter(b => b.id !== id));
  };

  const toggleExpand = (clientId: number) => {
    if (expandedClientId === clientId) {
      setExpandedClientId(null);
    } else {
      setExpandedClientId(clientId);
      setContactForm({ name: "", email: "", phone: "", role: "" });
      setEditingContactId(null);
    }
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <h1 className="text-navy" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
          ניהול לקוחות
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{clients.length} לקוחות במערכת</p>
      </div>

      {/* Client Form */}
      <SectionCard delay="0ms">
        <SectionHeader icon={editingId ? "✎" : "+"} title={editingId ? "עריכת לקוח" : "הוספת לקוח חדש"} />
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label>שם לקוח *</label>
              <input
                required
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="שם הלקוח"
              />
            </div>
            <div>
              <label>מותג</label>
              <select
                value={form.brand}
                onChange={e => setForm({ ...form, brand: e.target.value, customBrand: "" })}
              >
                <option value="">ללא מותג</option>
                {brands.map(b => (
                  <option key={b.id} value={b.name}>{b.name}</option>
                ))}
                <option value="__custom__">אחר...</option>
              </select>
              {form.brand === "__custom__" && (
                <input
                  className="mt-2"
                  value={form.customBrand}
                  onChange={e => setForm({ ...form, customBrand: e.target.value })}
                  placeholder="הזן שם מותג"
                />
              )}
            </div>
            <div>
              <label>תנאי תשלום ברירת מחדל</label>
              <input
                value={form.paymentTerms}
                onChange={e => setForm({ ...form, paymentTerms: e.target.value })}
                placeholder='למשל: שוטף + 30'
              />
            </div>
          </div>
          <div className="mt-5 flex gap-2">
            <PrimaryButton type="submit">{editingId ? "עדכון" : "הוספה"}</PrimaryButton>
            {editingId && (
              <SecondaryButton
                type="button"
                onClick={() => { setEditingId(null); setForm({ name: "", brand: "", customBrand: "", paymentTerms: "" }); }}
              >
                ביטול
              </SecondaryButton>
            )}
          </div>
        </form>
      </SectionCard>

      {/* Brand Management */}
      <SectionCard delay="60ms">
        <SectionHeader icon="◆" title="ניהול מותגים" />
        <div className="flex gap-3 items-end mb-4">
          <div className="flex-1">
            <input
              value={newBrandName}
              onChange={e => { setNewBrandName(e.target.value); setBrandError(""); }}
              placeholder="שם המותג החדש"
              onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAddBrand())}
            />
            {brandError && <p style={{ color: "#E8725C", fontSize: "0.78rem", marginTop: "4px" }}>{brandError}</p>}
          </div>
          <PrimaryButton type="button" onClick={handleAddBrand}>הוסף מותג</PrimaryButton>
        </div>
        {brands.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {brands.map(b => (
              <span key={b.id}
                className="inline-flex items-center gap-1.5 text-sm"
                style={{
                  background: "rgba(26,188,156,.06)",
                  color: "#1ABC9C",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "1px solid rgba(26,188,156,.15)",
                }}>
                {b.name}
                <button
                  onClick={() => handleDeleteBrand(b.id)}
                  className="text-xs font-bold"
                  style={{ color: "rgba(26,188,156,.5)", transition: "color 0.15s", marginRight: "2px" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#E8725C"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(26,188,156,.5)"; }}
                  title="מחק מותג"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}
        {brands.length === 0 && (
          <p style={{ fontSize: "0.85rem", color: "var(--muted)" }}>אין מותגים עדיין. הוסף מותג כדי שיופיע ב-dropdown למעלה.</p>
        )}
      </SectionCard>

      {/* Excel Import */}
      <SectionCard delay="120ms">
        <SectionHeader icon="⬆" title="ייבוא לקוחות מאקסל" />
        <p style={{ fontSize: "0.85rem", color: "var(--muted)", marginBottom: "16px" }}>
          העלה קובץ Excel (.xlsx / .xls) עם עמודות: <strong style={{ color: "var(--navy)" }}>שם לקוח</strong>, <strong style={{ color: "var(--navy)" }}>מותג</strong> (אופציונלי), <strong style={{ color: "var(--navy)" }}>תנאי תשלום</strong> (אופציונלי)
        </p>
        <div className="flex items-center gap-4">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleExcelUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={importing}
            className="text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, #059669, #047857)",
              padding: "10px 24px",
              borderRadius: "var(--radius-xs)",
              border: "none",
              cursor: importing ? "not-allowed" : "pointer",
              boxShadow: "0 2px 12px rgba(5,150,105,.25)",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(5,150,105,.35)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "0 2px 12px rgba(5,150,105,.25)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {importing ? "מייבא..." : "העלה קובץ אקסל"}
          </button>
        </div>
        {importMsg && (
          <div className="mt-3 text-sm"
            style={{
              padding: "10px 16px",
              borderRadius: "var(--radius-xs)",
              background: importMsg.type === "success" ? "rgba(5,150,105,.06)" : "rgba(232,114,92,.06)",
              color: importMsg.type === "success" ? "#059669" : "#E8725C",
              border: `1px solid ${importMsg.type === "success" ? "rgba(5,150,105,.15)" : "rgba(232,114,92,.15)"}`,
            }}>
            {importMsg.text}
          </div>
        )}
      </SectionCard>

      {/* Client Table */}
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
              {["", "שם לקוח", "מותג", "תנאי תשלום", "אנשי קשר", "פעולות"].map((h, i) => (
                <th key={i} className="text-right px-5 py-3"
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--muted)",
                    textTransform: "uppercase",
                    letterSpacing: "0.04em",
                    width: i === 0 ? "40px" : "auto",
                  }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <React.Fragment key={client.id}>
                <tr
                  style={{ borderBottom: "1px solid rgba(15,23,42,.06)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,246,249,.6)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => toggleExpand(client.id)}
                      style={{
                        color: "var(--muted)",
                        transition: "all 0.2s",
                        transform: expandedClientId === client.id ? "rotate(90deg)" : "rotate(0deg)",
                        display: "inline-block",
                        fontSize: "0.75rem",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "var(--muted)"; }}
                    >
                      ▶
                    </button>
                  </td>
                  <td className="px-5 py-3.5" style={{ fontWeight: 500 }}>{client.name}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{client.brand || "—"}</td>
                  <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{client.paymentTerms || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center text-xs font-medium"
                      style={{
                        background: "rgba(26,188,156,.08)",
                        color: "#1ABC9C",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        border: "1px solid rgba(26,188,156,.15)",
                      }}>
                      {client.contacts?.length || 0}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEdit(client)}
                        className="text-sm font-medium"
                        style={{ color: "#1ABC9C", transition: "color 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#16A085"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
                      >
                        עריכה
                      </button>
                      <button
                        onClick={() => handleDelete(client.id)}
                        className="text-sm font-medium"
                        style={{ color: "#CBD5E1", transition: "color 0.15s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "#E8725C"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "#CBD5E1"; }}
                      >
                        מחיקה
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Expanded contacts section */}
                {expandedClientId === client.id && (
                  <tr>
                    <td colSpan={6}
                      style={{
                        background: "rgba(26,188,156,.03)",
                        padding: "20px 32px",
                        borderBottom: "1px solid rgba(15,23,42,.06)",
                      }}>
                      <div className="space-y-4">
                        <h3 style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1ABC9C" }}>
                          אנשי קשר של {client.name}
                        </h3>

                        {/* Contact form */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                          <input
                            value={contactForm.name}
                            onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                            placeholder="שם איש קשר *"
                            className="text-sm"
                          />
                          <input
                            value={contactForm.email}
                            onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
                            placeholder="מייל"
                            type="email"
                            className="text-sm"
                          />
                          <input
                            value={contactForm.phone}
                            onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                            placeholder="טלפון"
                            className="text-sm"
                          />
                          <input
                            value={contactForm.role}
                            onChange={e => setContactForm({ ...contactForm, role: e.target.value })}
                            placeholder="תפקיד"
                            className="text-sm"
                          />
                          <div className="flex gap-2">
                            <PrimaryButton type="button" onClick={() => handleContactSubmit(client.id)}>
                              {editingContactId ? "עדכון" : "הוסף"}
                            </PrimaryButton>
                            {editingContactId && (
                              <SecondaryButton
                                type="button"
                                onClick={() => { setEditingContactId(null); setContactForm({ name: "", email: "", phone: "", role: "" }); }}
                              >
                                ביטול
                              </SecondaryButton>
                            )}
                          </div>
                        </div>

                        {/* Contact list */}
                        {client.contacts?.length > 0 ? (
                          <table className="w-full text-xs">
                            <thead>
                              <tr style={{ borderBottom: "1px solid rgba(15,23,42,.08)" }}>
                                {["שם", "מייל", "טלפון", "תפקיד", "פעולות"].map((h) => (
                                  <th key={h} className="text-right py-2"
                                    style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                                    {h}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {client.contacts.map(contact => (
                                <tr key={contact.id} style={{ borderTop: "1px solid rgba(15,23,42,.06)" }}>
                                  <td className="py-2" style={{ fontWeight: 500 }}>{contact.name}</td>
                                  <td className="py-2" style={{ color: "var(--muted)" }}>{contact.email || "—"}</td>
                                  <td className="py-2" style={{ color: "var(--muted)" }}>{contact.phone || "—"}</td>
                                  <td className="py-2" style={{ color: "var(--muted)" }}>{contact.role || "—"}</td>
                                  <td className="py-2">
                                    <button
                                      onClick={() => handleContactEdit(contact)}
                                      style={{ color: "#1ABC9C", transition: "color 0.15s", marginLeft: "8px" }}
                                      onMouseEnter={(e) => { e.currentTarget.style.color = "#16A085"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
                                    >
                                      עריכה
                                    </button>
                                    <button
                                      onClick={() => handleContactDelete(client.id, contact.id)}
                                      style={{ color: "#CBD5E1", transition: "color 0.15s" }}
                                      onMouseEnter={(e) => { e.currentTarget.style.color = "#E8725C"; }}
                                      onMouseLeave={(e) => { e.currentTarget.style.color = "#CBD5E1"; }}
                                    >
                                      מחיקה
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p style={{ fontSize: "0.78rem", color: "var(--muted)" }}>אין אנשי קשר עדיין</p>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-12 text-center" style={{ color: "var(--muted)" }}>
                  אין לקוחות עדיין. הוסיפו את הלקוח הראשון למעלה.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
