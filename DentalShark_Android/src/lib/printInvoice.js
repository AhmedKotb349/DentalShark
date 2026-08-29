import { formatPrice, formatDate } from './format';

/**
 * Opens a self-contained, print-ready invoice for an order in a new window
 * and triggers the browser print dialog. Built as plain HTML/inline CSS
 * (not the app's own stylesheet) so it prints cleanly regardless of the
 * app's dark theme or layout.
 */
export function printInvoice(order, { isAr = false, lang = 'en' } = {}) {
  if (!order) return;

  const orderNumber = order.orderId || `#${order.trackingId || (order._id || '').slice(-6)}`;
  const dateStr = formatDate(order.createdAt || new Date(), lang);
  const itemsHtml = (order.items || []).map(item => `
    <tr>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:600;color:#111827;">${escapeHtml(item.name || '')}</div>
        ${item.brand ? `<div style="font-size:11px;color:#6b7280;">${escapeHtml(item.brand)}</div>` : ''}
      </td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${item.qty || 1}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151;">${formatPrice(item.price || 0, lang)}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #e5e7eb;text-align:right;font-weight:600;color:#111827;">${formatPrice((item.price || 0) * (item.qty || 1), lang)}</td>
    </tr>
  `).join('');

  const html = `
<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${isAr ? 'rtl' : 'ltr'}">
<head>
<meta charset="UTF-8">
<title>${isAr ? 'فاتورة' : 'Invoice'} ${orderNumber}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; margin: 0; padding: 40px; background: #fff; }
  .invoice-wrap { max-width: 700px; margin: 0 auto; }
  .invoice-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0f766e; padding-bottom: 20px; margin-bottom: 24px; }
  .brand { font-size: 24px; font-weight: 800; color: #0f766e; }
  .brand span { color: #111827; }
  .invoice-title { text-align: ${isAr ? 'left' : 'right'}; }
  .invoice-title h1 { font-size: 20px; margin: 0 0 6px; letter-spacing: 1px; color: #111827; }
  .invoice-title div { font-size: 12px; color: #6b7280; }
  .meta-grid { display: flex; justify-content: space-between; margin-bottom: 24px; gap: 24px; }
  .meta-block { font-size: 12px; color: #374151; line-height: 1.6; }
  .meta-block strong { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
  thead th { text-align: left; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #9ca3af; padding: 0 8px 8px; border-bottom: 2px solid #e5e7eb; }
  thead th:nth-child(2) { text-align: center; }
  thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
  .totals { margin-left: auto; width: 260px; }
  .totals div { display: flex; justify-content: space-between; padding: 6px 0; font-size: 13px; color: #374151; }
  .totals .grand { border-top: 2px solid #111827; margin-top: 6px; padding-top: 10px; font-size: 16px; font-weight: 800; color: #0f766e; }
  .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; padding-top: 16px; }
  @media print { body { padding: 0; } .invoice-wrap { max-width: 100%; } }
</style>
</head>
<body>
  <div class="invoice-wrap">
    <div class="invoice-header">
      <div class="brand">Dental<span>Shark</span></div>
      <div class="invoice-title">
        <h1>${isAr ? 'فاتورة' : 'INVOICE'}</h1>
        <div>${orderNumber} · ${dateStr}</div>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-block">
        <strong>${isAr ? 'العميل' : 'BILLED TO'}</strong>
        ${escapeHtml(order.customerName || '—')}<br>
        ${escapeHtml(order.address || '')}
      </div>
      <div class="meta-block" style="text-align:${isAr ? 'left' : 'right'}">
        <strong>${isAr ? 'طريقة الدفع' : 'PAYMENT METHOD'}</strong>
        ${escapeHtml(order.paymentMethod || '—')}<br>
        ${order.paymentTransactionId ? `${isAr ? 'رقم العملية' : 'Txn'}: ${escapeHtml(order.paymentTransactionId)}` : ''}
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>${isAr ? 'المنتج' : 'Item'}</th>
          <th>${isAr ? 'الكمية' : 'Qty'}</th>
          <th>${isAr ? 'السعر' : 'Price'}</th>
          <th>${isAr ? 'الإجمالي' : 'Total'}</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <div><span>${isAr ? 'المجموع الفرعي' : 'Subtotal'}</span><span>${formatPrice(order.subtotal || 0, lang)}</span></div>
      <div><span>${isAr ? 'الشحن' : 'Shipping'}</span><span>${formatPrice(order.shipping || 0, lang)}</span></div>
      <div class="grand"><span>${isAr ? 'الإجمالي' : 'Total'}</span><span>${formatPrice(order.total || 0, lang)}</span></div>
    </div>

    <div class="footer">
      ${isAr ? 'شكراً لتسوقك من دنتال شارك — سوق مصر الأول لأجهزة طب الأسنان' : 'Thank you for shopping with DentalShark — Egypt&#39;s #1 dental equipment marketplace'}
    </div>
  </div>
  <script>window.onload = () => { window.print(); };</script>
</body>
</html>`;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return false; // popup blocked
  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
  return true;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}
