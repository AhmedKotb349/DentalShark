import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedProduct } from '../../hooks/useLocalizedProduct';
import { api } from '../../lib/api';
import { ADDON_REGISTRY } from '../../patterns/CartItemDecorators';

export default function CartSidebar({ open, onClose }) {
  const { isAr } = useLanguage();
  const {
    cart, updateQty, clearCart, subtotal, total, pointsEarned,
    decoratedCart, toggleAddon, runRemoveItem, undoLastAction, canUndo, lastActionLabel,
  } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const localize = useLocalizedProduct();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  // STRATEGY (backend): Cash on Delivery / Card / Wallet / Bank Transfer — each a
  // separate concrete strategy behind PaymentStrategyFactory.get(method).
  const [payMethod, setPayMethod] = useState('COD');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [walletNumber, setWalletNumber] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const shipping = cart.length ? total - subtotal : 150;

  const PAYMENT_METHODS = [
    { id: 'COD', icon: '💵', label: 'Cash on Delivery', labelAr: 'الدفع عند الاستلام', short: 'COD', shortAr: 'عند الاستلام' },
    { id: 'Card', icon: '💳', label: 'Credit / Debit Card', labelAr: 'بطاقة ائتمان / خصم', short: 'Card', shortAr: 'بطاقة' },
    { id: 'Wallet', icon: '📱', label: 'E-Wallet (Vodafone Cash)', labelAr: 'محفظة إلكترونية (فودافون كاش)', short: 'Wallet', shortAr: 'محفظة' },
    { id: 'BankTransfer', icon: '🏦', label: 'InstaPay Bank Transfer', labelAr: 'تحويل بنكي (إنستاباي)', short: 'InstaPay', shortAr: 'إنستاباي' },
    { id: 'PayPal', icon: '🅿️', label: 'PayPal', labelAr: 'باي بال', short: 'PayPal', shortAr: 'باي بال' },
  ];

  const handleUndo = useCallback(() => {
    const undone = undoLastAction();
    if (undone) toast(isAr ? `↩️ تراجع: ${undone.label}` : `↩️ Undone: ${undone.label}`, 'success');
  }, [undoLastAction, toast, isAr]);

  const handleCheckout = useCallback(async () => {
    // A guest is a real, logged-in account (uid + role: 'Guest') and can check out like anyone
    // else — only a genuinely logged-out visitor (no user at all) needs to sign in first.
    if (!user) {
      toast(isAr ? '⚠️ يرجى تسجيل الدخول أولاً!' : '⚠️ Please Sign In first to proceed!', 'warn');
      onClose();
      navigate('/login');
      return;
    }
    if (!cart.length) { toast(isAr ? 'سلتك فارغة!' : 'Your cart is empty!', 'warn'); return; }
    if (!address.trim()) { toast(isAr ? 'يرجى إدخال عنوان الشحن!' : 'Please enter your shipping address!', 'warn'); return; }
    if (payMethod === 'Card' && (!cardNumber.trim() || !cardHolder.trim())) {
      toast(isAr ? 'يرجى إدخال بيانات البطاقة!' : 'Please enter your card details!', 'warn'); return;
    }
    if (payMethod === 'Wallet' && !walletNumber.trim()) {
      toast(isAr ? 'يرجى إدخال رقم المحفظة!' : 'Please enter your wallet number!', 'warn'); return;
    }
    if (payMethod === 'PayPal' && !paypalEmail.trim()) {
      toast(isAr ? 'يرجى إدخال بريد PayPal!' : 'Please enter your PayPal email!', 'warn'); return;
    }
    setSubmitting(true);
    try {
      // DECORATOR: send the decorated (add-on-inclusive) price/description per line
      const items = decoratedCart.map(({ raw, decorated }) => ({
        id: raw.id, name: decorated.getDescription(), brand: raw.brand, img: raw.img,
        price: decorated.getUnitPrice() + (decorated.getPrice() - decorated.getUnitPrice() * raw.qty) / raw.qty,
        qty: raw.qty, pts: raw.pts || 0, addons: raw.addons || [],
      }));
      // FACADE endpoint: stock check + STRATEGY payment + BUILDER + persistence, one call
      const { order, paymentMessage } = await api.checkout({
        items, address: address.trim(), paymentMethod: payMethod,
        paymentDetails: payMethod === 'Card' ? { cardNumber, cardHolder } : payMethod === 'Wallet' ? { walletNumber } : payMethod === 'PayPal' ? { paypalEmail } : {},
      });
      clearCart();
      onClose();
      toast(paymentMessage || (isAr ? '✅ تم الدفع بنجاح' : '✅ Payment successful'), 'success');
      navigate('/order-confirmed', { state: { order } });
    } catch (err) {
      toast(err.message || (isAr ? '❌ خطأ في الخادم' : '❌ Server error'), 'error');
    } finally { setSubmitting(false); }
  }, [user, cart, address, payMethod, cardNumber, cardHolder, walletNumber, paypalEmail, decoratedCart, navigate, toast, clearCart, onClose, isAr]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.55)', zIndex: 2999, backdropFilter: 'blur(2px)' }} />

      {/* Cart sidebar panel */}
      <div className="cart-sidebar open" id="cart-sidebar">
        {/* Header */}
        <div className="cart-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <h2>🛒 {isAr ? 'سلة المشتريات' : 'Your Cart'}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {canUndo && (
              <button onClick={handleUndo} title={lastActionLabel || 'Undo'}
                style={{ fontSize: 11, fontWeight: 700, padding: '5px 10px', borderRadius: 7, border: '1px solid var(--b2)', background: 'var(--bg2)', color: 'var(--teal)', cursor: 'pointer' }}>
                ↩️ {isAr ? 'تراجع' : 'Undo Last Action'}
              </button>
            )}
            <button className="cart-close" onClick={onClose} aria-label="Close">×</button>
          </div>
        </div>

        {/* Items */}
        <div id="cart-items" style={{ flex: 1, overflowY: 'auto' }}>
          {!cart.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 48, marginBottom: 12, color: 'var(--text3)', opacity: .5 }}>🛒</div>
              <div style={{ fontSize: 14, color: 'var(--text3)', fontWeight: 600 }}>
                {isAr ? 'سلتك فارغة' : 'Your cart is empty'}
              </div>
            </div>
          ) : decoratedCart.map(({ raw: c, decorated }) => {
            const lp = localize(c);
            return (
              <div key={c.id} className="cart-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', width: '100%' }}>
                  <img className="cart-item-img" src={c.img} alt={lp.name}
                    referrerPolicy="no-referrer"
                    style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }}
                    onError={e => { e.currentTarget.style.opacity = 0.35; }}
                  />
                  <div className="cart-item-info" style={{ flex: 1, minWidth: 0, marginLeft: 10 }}>
                    <div className="cart-item-name" style={{ fontWeight: 700, fontSize: 12, lineHeight: 1.3, marginBottom: 3 }}>{lp.name}</div>
                    <div className="cart-item-sub" style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 4 }}>{lp.brand}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button onClick={() => updateQty(c.id, c.qty - 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--b2)', background: 'var(--bg2)', cursor: 'pointer', color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 16, textAlign: 'center' }}>{c.qty}</span>
                      <button onClick={() => updateQty(c.id, c.qty + 1)}
                        style={{ width: 22, height: 22, borderRadius: 6, border: '1px solid var(--b2)', background: 'var(--bg2)', cursor: 'pointer', color: 'var(--text)', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                    </div>
                    {c.pts > 0 && <div style={{ fontSize: 10, color: 'var(--gold)', marginTop: 3 }}>⚡ +{(c.pts) * c.qty} pts</div>}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                    <div className="cart-item-price" style={{ fontWeight: 700, fontSize: 13, color: 'var(--teal)' }}>
                      {decorated.getPrice().toLocaleString()} EGP
                    </div>
                    <button className="cart-item-del" onClick={() => runRemoveItem(c)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16 }}>✕</button>
                  </div>
                </div>
                {/* DECORATOR add-on toggles */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, paddingLeft: 58 }}>
                  {Object.values(ADDON_REGISTRY).map(Decorator => {
                    const active = (c.addons || []).includes(Decorator.KEY);
                    return (
                      <label key={Decorator.KEY} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: active ? 'var(--teal)' : 'var(--text3)', cursor: 'pointer', border: `1px solid ${active ? 'var(--teal)' : 'var(--b2)'}`, borderRadius: 6, padding: '2px 6px' }}>
                        <input type="checkbox" checked={active} onChange={() => toggleAddon(c.id, Decorator.KEY)} style={{ width: 11, height: 11, accentColor: 'var(--teal)' }} />
                        {Decorator.LABEL}
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals + checkout */}
        <div className="cart-total">
          <div className="cart-row">
            <span>{isAr ? 'المجموع الفرعي' : 'Subtotal'}</span>
            <span id="cart-sub">{subtotal.toLocaleString()} EGP</span>
          </div>
          <div className="cart-row">
            <span>{isAr ? 'الشحن' : 'Shipping'}</span>
            <span>EGP {shipping}</span>
          </div>
          <div className="cart-row big">
            <span>{isAr ? 'الإجمالي' : 'Total'}</span>
            <span id="cart-tot">{(subtotal + shipping).toLocaleString()} EGP</span>
          </div>

          {/* SHARK Points earn */}
          <div className="cart-pts-earn" id="cart-pts-earn">
            <span>⚡</span>
            <span id="cart-pts-text">
              {isAr ? `اكسب ${pointsEarned} نقطة SHARK مع هذا الطلب` : `Earn ${pointsEarned} SHARK Points on this order`}
            </span>
          </div>

          {/* Shipping address */}
          <div style={{ margin: '12px 0 8px' }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>
              {isAr ? 'عنوان الشحن' : 'SHIPPING ADDRESS'}
            </div>
            <input
              placeholder={isAr ? 'أدخل عنوان التوصيل...' : 'Enter delivery address...'}
              value={address}
              onChange={e => setAddress(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontSize: 12.5, boxSizing: 'border-box', outline: 'none' }}
            />
          </div>

          {/* Payment method — STRATEGY: COD / Card / Wallet / Bank Transfer / PayPal.
              Compact horizontal pill row (not a tall stacked list) so the cart items
              above keep most of the sidebar's vertical space. */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, fontWeight: 800, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 7 }}>
              {isAr ? 'طريقة الدفع' : 'PAYMENT METHOD'}
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 2 }}>
              {PAYMENT_METHODS.map(m => (
                <button key={m.id} type="button" onClick={() => setPayMethod(m.id)} title={isAr ? m.labelAr : m.label}
                  className={`pay-method-pill${payMethod === m.id ? ' active' : ''}`}>
                  <span style={{ fontSize: 14 }}>{m.icon}</span>
                  <span>{isAr ? m.shortAr : m.short}</span>
                </button>
              ))}
            </div>

            {payMethod === 'Card' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <input placeholder={isAr ? 'رقم البطاقة' : 'Card number'} value={cardNumber} onChange={e => setCardNumber(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }} />
                <input placeholder={isAr ? 'اسم حامل البطاقة' : 'Cardholder name'} value={cardHolder} onChange={e => setCardHolder(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }} />
              </div>
            )}
            {payMethod === 'Wallet' && (
              <input placeholder={isAr ? 'رقم المحفظة (فودافون كاش)' : 'Wallet number (Vodafone Cash)'} value={walletNumber} onChange={e => setWalletNumber(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }} />
            )}
            {payMethod === 'PayPal' && (
              <input placeholder={isAr ? 'بريد PayPal' : 'PayPal email'} value={paypalEmail} onChange={e => setPaypalEmail(e.target.value)}
                style={{ width: '100%', padding: '9px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 12, boxSizing: 'border-box' }} />
            )}
          </div>

          <button className="btn-checkout" onClick={handleCheckout} disabled={submitting}>
            {submitting ? (isAr ? 'جاري المعالجة...' : 'Processing…') : (isAr ? 'تأكيد الطلبية ←' : 'Checkout Now →')}
          </button>
        </div>
      </div>
    </>
  );
}
