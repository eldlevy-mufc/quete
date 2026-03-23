"use client";

import { useState, useEffect } from "react";

interface Sender {
  id: number;
  fullName: string;
  title: string;
}

export default function SendersPage() {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [form, setForm] = useState({ fullName: "", title: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/senders").then(r => r.json()).then(setSenders);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const res = await fetch("/api/senders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const updated = await res.json();
      setSenders(senders.map(s => (s.id === editingId ? updated : s)));
      setEditingId(null);
    } else {
      const res = await fetch("/api/senders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setSenders([...senders, created]);
    }
    setForm({ fullName: "", title: "" });
  };

  const handleEdit = (sender: Sender) => {
    setEditingId(sender.id);
    setForm({ fullName: sender.fullName, title: sender.title });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק את השולח?")) return;
    await fetch(`/api/senders?id=${id}`, { method: "DELETE" });
    setSenders(senders.filter(s => s.id !== id));
  };

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <h1 className="text-navy" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
          ניהול שולחים
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{senders.length} שולחים במערכת</p>
      </div>

      {/* Form Card */}
      <form
        onSubmit={handleSubmit}
        style={{
          background: "#fff",
          borderRadius: "var(--radius)",
          padding: "28px 28px 24px",
          boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
          border: "1px solid rgba(15,23,42,.06)",
          marginBottom: "28px",
          animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0ms both",
          transition: "box-shadow 0.3s, transform 0.3s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,.04), 0 24px 60px rgba(0,0,0,.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)";
        }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "linear-gradient(135deg, #1ABC9C, #16A085)",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "0.75rem", fontWeight: 700,
            boxShadow: "0 2px 8px rgba(26,188,156,.3)",
          }}>
            {editingId ? "✎" : "+"}
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 600, color: "var(--navy)" }}>
            {editingId ? "עריכת שולח" : "הוספת שולח חדש"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label>שם מלא *</label>
            <input
              required
              value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })}
              placeholder="שם מלא"
            />
          </div>
          <div>
            <label>טייטל *</label>
            <input
              required
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
              placeholder='למשל: מנכ"ל, סמנכ"ל שיווק'
            />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            type="submit"
            className="text-white text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #1ABC9C, #16A085)",
              padding: "10px 24px",
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
            {editingId ? "עדכון" : "הוספה"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ fullName: "", title: "" }); }}
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
              ביטול
            </button>
          )}
        </div>
      </form>

      {/* Table Card */}
      <div
        style={{
          background: "#fff",
          borderRadius: "var(--radius)",
          boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
          border: "1px solid rgba(15,23,42,.06)",
          overflow: "hidden",
          animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 60ms both",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: "2px solid rgba(15,23,42,.08)" }}>
              {["שם מלא", "טייטל", "פעולות"].map((h) => (
                <th key={h} className="text-right px-5 py-3"
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
            {senders.map(sender => (
              <tr key={sender.id}
                style={{ borderBottom: "1px solid rgba(15,23,42,.06)", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,246,249,.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td className="px-5 py-3.5" style={{ fontWeight: 500 }}>{sender.fullName}</td>
                <td className="px-5 py-3.5" style={{ color: "var(--muted)" }}>{sender.title}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(sender)}
                      className="text-sm font-medium"
                      style={{ color: "#1ABC9C", transition: "color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#16A085"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDelete(sender.id)}
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
            ))}
            {senders.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-12 text-center" style={{ color: "var(--muted)" }}>
                  אין שולחים עדיין. הוסיפו את השולח הראשון למעלה.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
