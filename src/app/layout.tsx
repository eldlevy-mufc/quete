import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "מנצ׳ - מחולל הצעות מחיר",
  description: "פלטפורמה ליצירת הצעות מחיר",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="antialiased bg-gray-50 text-gray-900 font-sans">
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <img src="/logo.svg" alt="מנצ׳" className="h-10" />
              <span className="text-lg font-bold text-gray-700">מחולל הצעות מחיר</span>
            </a>
            <div className="flex gap-4 text-sm">
              <a href="/" className="text-gray-600 hover:text-purple-600 transition">הצעה חדשה</a>
              <a href="/clients" className="text-gray-600 hover:text-purple-600 transition">ניהול לקוחות</a>
              <a href="/senders" className="text-gray-600 hover:text-purple-600 transition">ניהול שולחים</a>
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
