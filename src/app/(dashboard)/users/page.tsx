"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface User {
  id: number;
  username: string;
  fullName: string;
  role: string;
}

export default function UsersPage() {
  const { data: session } = useSession();
  const role = (session?.user as { role?: string })?.role;
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState({ username: "", password: "", fullName: "", role: "USER" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users").then(r => r.json()).then(setUsers);
  }, []);

  if (role !== "ADMIN") {
    return (
      <div className="text-center py-20" style={{ animation: "fadeIn 0.4s ease-out" }}>
        <div style={{ fontSize: "3rem", marginBottom: "16px", opacity: 0.3 }}>🔒</div>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem" }}>אין לך הרשאה לצפות בדף זה</p>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const body: Record<string, string> = { id: String(editingId), fullName: form.fullName, role: form.role };
      if (form.password) body.password = form.password;
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const updated = await res.json();
      setUsers(users.map(u => (u.id === editingId ? updated : u)));
      setEditingId(null);
      showToast("משתמש עודכן");
    } else {
      if (!form.password) { showToast("חובה למלא סיסמה"); return; }
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        showToast(err.error || "שגיאה");
        return;
      }
      const created = await res.json();
      setUsers([...users, created]);
      showToast("משתמש נוצר");
    }
    setForm({ username: "", password: "", fullName: "", role: "USER" });
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setForm({ username: user.username, password: "", fullName: user.fullName, role: user.role });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק את המשתמש?")) return;
    await fetch(`/api/users?id=${id}`, { method: "DELETE" });
    setUsers(users.filter(u => u.id !== id));
    showToast("משתמש נמחק");
  };

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50"
          style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="px-6 py-3 text-white text-sm font-bold"
            style={{
              background: "linear-gradient(135deg, #1ABC9C, #16A085)",
              borderRadius: "var(--radius-xs)",
              boxShadow: "0 4px 20px rgba(26,188,156,.3)",
            }}>
            {toast}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <h1 className="text-navy" style={{ fontSize: "1.75rem", fontWeight: 700, letterSpacing: "-0.02em", marginBottom: "4px" }}>
          ניהול משתמשים
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>{users.length} משתמשים במערכת</p>
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
            {editingId ? "עריכת משתמש" : "הוספת משתמש חדש"}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label>שם משתמש *</label>
            <input
              required
              disabled={!!editingId}
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              placeholder="username"
            />
          </div>
          <div>
            <label>{editingId ? "סיסמה חדשה (ריק = ללא שינוי)" : "סיסמה *"}</label>
            <input
              type="password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              placeholder={editingId ? "השאר ריק לשמור קיימת" : "סיסמה"}
            />
          </div>
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
            <label>תפקיד *</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="USER">משתמש</option>
              <option value="ADMIN">מנהל</option>
            </select>
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
              onClick={() => { setEditingId(null); setForm({ username: "", password: "", fullName: "", role: "USER" }); }}
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
              {["שם משתמש", "שם מלא", "תפקיד", "פעולות"].map((h) => (
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
            {users.map(user => (
              <tr key={user.id}
                style={{ borderBottom: "1px solid rgba(15,23,42,.06)", transition: "background 0.15s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(244,246,249,.6)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
              >
                <td className="px-5 py-3.5 font-mono" style={{ fontSize: "0.85rem" }}>{user.username}</td>
                <td className="px-5 py-3.5" style={{ fontWeight: 500 }}>{user.fullName}</td>
                <td className="px-5 py-3.5">
                  {user.role === "ADMIN" ? (
                    <span className="inline-flex items-center text-xs font-medium"
                      style={{
                        background: "rgba(26,188,156,.08)",
                        color: "#1ABC9C",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        border: "1px solid rgba(26,188,156,.15)",
                      }}>
                      מנהל
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-medium"
                      style={{
                        background: "rgba(100,116,139,.08)",
                        color: "var(--muted)",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        border: "1px solid rgba(100,116,139,.12)",
                      }}>
                      משתמש
                    </span>
                  )}
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(user)}
                      className="text-sm font-medium"
                      style={{ color: "#1ABC9C", transition: "color 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = "#16A085"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = "#1ABC9C"; }}
                    >
                      עריכה
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
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
          </tbody>
        </table>
      </div>
    </div>
  );
}
