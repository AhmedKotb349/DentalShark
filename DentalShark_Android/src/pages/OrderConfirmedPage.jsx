import { useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useLanguage } from '../hooks/useLanguage';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../lib/format';
import { printInvoice } from '../lib/printInvoice';

export default function OrderConfirmedPage() {
  const { t, lang, isAr } = useLanguage();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { showInfo } = useOutletContext() || {};
  const { toast } = useToast();
  const order = state?.order;

  if (!order) {
    navigate('/');
    return null;
  }

  const handleTrack = () => {
    if (showInfo) showInfo('track', order.trackingId);
    else navigate('/dashboard');
  };

  const handleInvoice = () => {
    const opened = printInvoice(order, { isAr, lang });
    if (!opened) {
      toast(isAr ? 'يرجى السماح بالنوافذ المنبثقة لطباعة الفاتورة' : 'Please allow pop-ups to print the invoice', 'warn');
    }
  };

  return (
    <div className="confirm-page" style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="sec" style={{ maxWidth: 600, textAlign: 'center' }}>
        <div style={{
          width: 96, height: 96, borderRadius: '50%',
          background: 'rgba(34,197,94,.15)', border: '2px solid rgba(34,197,94,.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 24px', fontSize: 44, color: '#22c55e',
        }}>
          ✓
        </div>

        <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, letterSpacing: 2, color: 'var(--text)', marginBottom: 12 }}>
          {isAr ? 'تم تأكيد الطلب!' : 'ORDER CONFIRMED!'}
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>
          {isAr ? 'تم تقديم طلبك بنجاح. سنقوم بمعالجته قريباً.' : 'Your order has been placed successfully. We will process it shortly.'}
        </p>

        {order.ptsEarned > 0 && (
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,158,11,.1)', border: '1px solid rgba(245,158,11,.3)',
            borderRadius: 20, padding: '8px 18px', fontSize: 13, fontWeight: 700,
            color: 'var(--gold)', marginBottom: 32,
          }}>
            ⚡ {isAr ? `اكتسبت ${order.ptsEarned} نقطة SHARK على هذا الطلب!` : `You earned ${order.ptsEarned} SHARK Points on this order!`}
          </div>
        )}

        <div style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 16, padding: 24, textAlign: 'left', marginBottom: 24 }}>
          <div className="confirm-meta-grid">
            <div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                {isAr ? 'رقم الطلب' : 'ORDER NUMBER'}
              </div>
              <div style={{ fontSize: 18, fontFamily: "'Bebas Neue',sans-serif", letterSpacing: 1, color: 'var(--teal)', marginTop: 4 }}>
                {order.orderId || `#${order.trackingId || order._id?.slice(-6)}`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                {isAr ? 'التسليم المتوقع' : 'EST. DELIVERY'}
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginTop: 4 }}>
                {order.estimatedDelivery || '—'}
              </div>
            </div>
          </div>

          {order.items?.map((item, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--b2)', alignItems: 'center' }}>
              <img src={item.img} alt={item.name} referrerPolicy="no-referrer" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover', background: 'var(--bg)' }} onError={e => { e.currentTarget.style.opacity = 0.35; }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{item.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text3)' }}>
                  {item.brand ? `${item.brand} × ${item.qty}` : `×${item.qty}`}
                </div>
              </div>
              <div style={{ fontSize: 13, color: 'var(--teal)', fontWeight: 700 }}>{formatPrice(item.price * item.qty, lang)}</div>
            </div>
          ))}

          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--b2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
              <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span><span>{formatPrice(order.subtotal, lang)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>
              <span>{isAr ? 'الشحن' : 'Shipping'}</span><span>{formatPrice(order.shipping, lang)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 16, fontWeight: 700, color: 'var(--text)', marginTop: 8 }}>
              <span>{isAr ? 'الإجمالي' : 'Total'}</span><span style={{ color: 'var(--teal)' }}>{formatPrice(order.total, lang)}</span>
            </div>
            {order.address && (
              <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text3)' }}>
                <span style={{ fontWeight: 700 }}>{isAr ? 'الشحن إلى:' : 'Shipping To:'}</span> {order.address}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={() => navigate('/shop')}>
            🛍️ {isAr ? 'متابعة التسوق' : 'Continue Shopping'}
          </button>
          <button className="btn-outline" onClick={handleTrack}>
            📦 {isAr ? 'تتبع الطلب' : 'Track Order'}
          </button>
          <button className="btn-outline" onClick={handleInvoice}>
            🖨️ {isAr ? 'طباعة الفاتورة' : 'Print Invoice'}
          </button>
        </div>
      </div>
    </div>
  );
}
