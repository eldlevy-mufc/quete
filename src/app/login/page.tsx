"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("שם משתמש או סיסמה שגויים");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}
      className="relative"
      style={{
        background: "#fff",
        borderRadius: "var(--radius)",
        padding: "36px 32px 32px",
        boxShadow: "0 1px 3px rgba(0,0,0,.03), 0 20px 60px rgba(0,0,0,.08)",
        border: "1px solid rgba(15,23,42,.06)",
        animation: "slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Teal top accent line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 rounded-b-full"
        style={{ background: "linear-gradient(90deg, #1ABC9C, #16A085)" }} />

      {error && (
        <div style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#DC2626",
          fontSize: "0.85rem",
          borderRadius: "var(--radius-xs)",
          padding: "10px 14px",
          marginBottom: "20px",
          animation: "fadeIn 0.3s ease-out",
        }}>
          {error}
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label>שם משתמש</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="הזן שם משתמש"
          required
          autoFocus
        />
      </div>

      <div style={{ marginBottom: "28px" }}>
        <label>סיסמה</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="הזן סיסמה"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full font-bold text-sm disabled:opacity-50"
        style={{
          background: "linear-gradient(135deg, #1ABC9C, #16A085)",
          color: "#fff",
          padding: "12px",
          borderRadius: "var(--radius-xs)",
          border: "none",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 2px 12px rgba(26,188,156,.25)",
          letterSpacing: "0.02em",
        }}
        onMouseEnter={(e) => {
          if (!loading) {
            e.currentTarget.style.boxShadow = "0 4px 20px rgba(26,188,156,.35)";
            e.currentTarget.style.transform = "translateY(-1px)";
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = "0 2px 12px rgba(26,188,156,.25)";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {loading ? "מתחבר..." : "כניסה"}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden" dir="rtl"
      style={{ background: "linear-gradient(145deg, #F4F6F9 0%, #EDF0F4 50%, #F4F6F9 100%)" }}
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(15,23,42,.025) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }} />

      {/* Decorative gradient orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-30"
        style={{ background: "radial-gradient(circle, rgba(26,188,156,.12), transparent 70%)", filter: "blur(80px)" }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(11,28,45,.1), transparent 70%)", filter: "blur(80px)" }} />

      <div className="w-full max-w-[360px] relative z-10">
        <div className="text-center mb-8" style={{ animation: "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div className="inline-block rounded-[var(--radius-sm)] overflow-hidden mb-6"
            style={{ padding: "14px", background: "#fff", boxShadow: "0 2px 12px rgba(0,0,0,.06)", border: "1px solid rgba(15,23,42,.05)" }}>
            <img src="/logo.jpg" alt="מנצ׳" style={{ height: "36px", display: "block" }} />
          </div>
          <h1 className="text-navy" style={{ fontSize: "1.65rem", fontWeight: 700, marginBottom: "6px", letterSpacing: "-0.02em" }}>
            מחולל הצעות מחיר
          </h1>
          <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>היכנס למערכת</p>
        </div>
        <Suspense
          fallback={
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
