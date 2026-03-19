"use client";

import { useState, useEffect } from "react";

interface Client {
  id: number;
  name: string;
  brand: string | null;
  paymentTerms: string | null;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [form, setForm] = useState({ name: "", brand: "", paymentTerms: "" });
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/clients").then(r => r.json()).then(setClients);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      const res = await fetch("/api/clients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, ...form }),
      });
      const updated = await res.json();
      setClients(clients.map(c => (c.id === editingId ? updated : c)));
      setEditingId(null);
    } else {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const created = await res.json();
      setClients([...clients, created]);
    }
    setForm({ name: "", brand: "", paymentTerms: "" });
  };

  const handleEdit = (client: Client) => {
    setEditingId(client.id);
    setForm({
      name: client.name,
      brand: client.brand || "",
      paymentTerms: client.paymentTerms || "",
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("למחוק את הלקוח?")) return;
    await fetch(`/api/clients?id=${id}`, { method: "DELETE" });
    setClients(clients.filter(c => c.id !== id));
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">ניהול לקוחות</h1>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">{editingId ? "עריכת לקוח" : "הוספת לקוח חדש"}</h2>
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
            <input
              value={form.brand}
              onChange={e => setForm({ ...form, brand: e.target.value })}
              placeholder="שם המותג"
            />
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
              onClick={() => { setEditingId(null); setForm({ name: "", brand: "", paymentTerms: "" }); }}
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
              <th className="text-right px-4 py-3 font-medium">שם לקוח</th>
              <th className="text-right px-4 py-3 font-medium">מותג</th>
              <th className="text-right px-4 py-3 font-medium">תנאי תשלום</th>
              <th className="text-right px-4 py-3 font-medium">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {clients.map(client => (
              <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3">{client.name}</td>
                <td className="px-4 py-3">{client.brand || "—"}</td>
                <td className="px-4 py-3">{client.paymentTerms || "—"}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleEdit(client)}
                    className="text-purple-600 hover:text-purple-800 ml-3 text-sm"
                  >
                    עריכה
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    מחיקה
                  </button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
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
