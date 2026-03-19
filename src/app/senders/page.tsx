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
      <h1 className="text-2xl font-bold mb-6">ניהול שולחים</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "עריכת שולח" : "הוספת שולח חדש"}</h2>
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
        <div className="mt-4 flex gap-2">
          <button
            type="submit"
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 text-sm font-medium"
          >
            {editingId ? "עדכון" : "הוספה"}
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => { setEditingId(null); setForm({ fullName: "", title: "" }); }}
              className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 text-sm"
            >
              ביטול
            </button>
          )}
        </div>
      </form>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-right px-4 py-3 font-medium">שם מלא</th>
              <th className="text-right px-4 py-3 font-medium">טייטל</th>
              <th className="text-right px-4 py-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {senders.map(sender => (
              <tr key={sender.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{sender.fullName}</td>
                <td className="px-4 py-3">{sender.title}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEdit(sender)}
                    className="text-purple-600 hover:text-purple-800 ml-3 text-sm"
                  >
                    עריכה
                  </button>
                  <button
                    onClick={() => handleDelete(sender.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))}
            {senders.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-400">
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
