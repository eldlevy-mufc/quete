export function quoteEmailHtml({
  contactName,
  quoteNumber,
  date,
  totalAmount,
  viewUrl,
  signUrl,
}: {
  contactName: string;
  quoteNumber: string;
  date: string;
  totalAmount: string;
  viewUrl: string;
  signUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="he" dir="rtl">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f3ff;padding:40px 0;direction:rtl;">
  <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <div style="background:#7c3aed;padding:24px 32px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:22px;">הצעת מחיר</h1>
    </div>
    <div style="padding:32px;">
      <p style="font-size:16px;color:#333;margin-bottom:24px;">שלום ${contactName},</p>
      <p style="font-size:15px;color:#555;margin-bottom:24px;">מצורפת הצעת מחיר לעיונך.</p>
      <div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:24px;">
        <table style="width:100%;font-size:14px;color:#555;">
          <tr><td style="padding:6px 0;"><strong>מספר הצעה:</strong></td><td style="padding:6px 0;">${quoteNumber}</td></tr>
          <tr><td style="padding:6px 0;"><strong>תאריך:</strong></td><td style="padding:6px 0;">${date}</td></tr>
          <tr><td style="padding:6px 0;"><strong>סכום:</strong></td><td style="padding:6px 0;font-weight:bold;color:#7c3aed;">₪${totalAmount}</td></tr>
        </table>
      </div>
      <div style="text-align:center;margin:32px 0;">
        <a href="${viewUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;margin-left:12px;">צפייה בהצעה</a>
        <a href="${signUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;">חתימה על ההצעה</a>
      </div>
    </div>
    <div style="background:#f9fafb;padding:16px 32px;text-align:center;font-size:12px;color:#999;">
      הודעה זו נשלחה אוטומטית ממערכת הצעות המחיר
    </div>
  </div>
</body>
</html>`;
}
