import { useState } from 'react';
import Modal from './Modal';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

const FAQ_ITEMS = [
  { q: 'Do you ship across Egypt?', a: 'Yes — we deliver to all 27 governorates. Free shipping on orders over 500 EGP.' },
  { q: 'What payment methods do you accept?', a: 'Cash on Delivery, Credit/Debit Card, Vodafone Cash e-wallet, and InstaPay bank transfer.' },
  { q: 'How do I earn SHARK Points?', a: '1 point per 10 EGP spent on products, 2× on service bookings, 50 pts per verified review, 200 pts per referral.' },
  { q: 'What is the warranty on products?', a: 'All products carry a 6-month warranty. Service repairs carry a 3-month warranty on parts.' },
  { q: 'Can I return a product?', a: 'Yes, within 14 days of delivery. Items must be unused and in original packaging. Contact us to initiate a return.' },
];

function TrackOrder({ t, prefill }) {
  const { user } = useAuth();
  const [trackId, setTrackId] = useState(prefill || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const doTrack = async () => {
    if (!trackId.trim()) { setErr(t('info.trackEmpty')); return; }
    setLoading(true); setErr(''); setResult(null);
    try {
      const data = await api.trackOrder(trackId.trim());
      setResult(data);
    } catch (e) {
      // Surface the real problem instead of always showing a generic message —
      // a network/connectivity failure looks nothing like a genuine 404.
      if (e.status === 0) {
        setErr('Could not reach the server. Check that the backend is running and try again.');
      } else if (e.status === 404) {
        setErr(t('info.trackNotFound'));
      } else {
        setErr(e.message || t('info.trackNotFound'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 14 }}>{t('info.trackPrompt')}</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          className="form-input"
          placeholder={t('info.trackPlaceholder')}
          value={trackId}
          onChange={(e) => setTrackId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && doTrack()}
          style={{ flex: 1, padding: '10px 12px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 8, color: 'var(--text)', fontSize: 13 }}
        />
        <button className="btn-primary" onClick={doTrack} disabled={loading} style={{ padding: '10px 16px' }}>
          {loading ? '…' : t('info.trackBtn')}
        </button>
      </div>
      {err && <p style={{ color: '#ef4444', fontSize: 12 }}>{err}</p>}
      {result && (
        <div style={{ background: 'var(--b2)', borderRadius: 10, padding: 14, fontSize: 13 }}>
          <div style={{ marginBottom: 6, fontWeight: 700, color: 'var(--teal)' }}>
            #{result.trackingId || result._id}
          </div>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', color: 'var(--text2)' }}>
            <span>Status: <strong style={{ color: 'var(--text)' }}>{result.status}</strong></span>
            <span>Total: <strong style={{ color: 'var(--teal)' }}>{result.total} EGP</strong></span>
          </div>
          {result.address && <div style={{ marginTop: 6, color: 'var(--text3)', fontSize: 12 }}>{result.address}</div>}
        </div>
      )}
      {user && (
        <div style={{ marginTop: 20 }}>
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 10 }}>{t('info.yourOrders')}</div>
        </div>
      )}
    </div>
  );
}

const RETURNS_POLICY = `
**Return Window:** 14 days from confirmed delivery.

**Eligible Items:** Unused, sealed products in original packaging with all accessories included.

**Non-eligible:** Items showing signs of use, broken seals, or missing documentation.

**How to Return:** Contact our support team with your order number and photos of the item. We will arrange pickup.

**Refunds:** Processed within 5–7 business days of return receipt, via the original payment method.

**Exceptions:** Sterilization pouches, single-use items, and custom-order products are non-returnable.
`.trim();

const PAYMENT_INFO = [
  { icon: '💵', name: 'Cash on Delivery', desc: 'Pay when your order arrives. Available nationwide.' },
  { icon: '💳', name: 'Credit / Debit Card', desc: 'Visa, Mastercard accepted. Secure payment via our payment gateway.' },
  { icon: '📱', name: 'Vodafone Cash', desc: 'E-wallet transfer. You will receive payment instructions after checkout.' },
  { icon: '🏦', name: 'InstaPay', desc: 'Instant bank transfer. Account details provided after order confirmation.' },
];

const TOPICS = {
  faq: (t) => (
    <div>
      {FAQ_ITEMS.map((item, i) => (
        <details key={i} style={{ borderBottom: '1px solid var(--b2)', padding: '10px 0' }}>
          <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{item.q}</summary>
          <p style={{ marginTop: 8, fontSize: 12, color: 'var(--text2)', lineHeight: 1.7 }}>{item.a}</p>
        </details>
      ))}
    </div>
  ),
  returns: (t) => (
    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
      {RETURNS_POLICY.split('\n\n').map((block, i) => (
        <p key={i} style={{ marginBottom: 12 }}>
          {block.startsWith('**') ? (
            <>
              <strong style={{ color: 'var(--teal)' }}>{block.split('**')[1]}</strong>
              {block.split('**').slice(2).join('')}
            </>
          ) : block}
        </p>
      ))}
    </div>
  ),
  track: (t) => <TrackOrder t={t} />,
  warranty: (t) => (
    <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.8 }}>
      <p><strong style={{ color: 'var(--teal)' }}>Products:</strong> 6-month warranty on all equipment from date of delivery.</p>
      <p><strong style={{ color: 'var(--teal)' }}>Service Repairs:</strong> 3-month warranty on replaced parts and labour.</p>
      <p><strong style={{ color: 'var(--teal)' }}>Claiming Warranty:</strong> Contact us with your order/job number and a description of the defect. Our team will respond within 24 hours.</p>
      <p><strong style={{ color: 'var(--teal)' }}>Exclusions:</strong> Warranty does not cover damage from misuse, improper installation, or failure to follow manufacturer maintenance guidelines.</p>
    </div>
  ),
  payment: (t) => (
    <div>
      {PAYMENT_INFO.map((m, i) => (
        <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: i < PAYMENT_INFO.length - 1 ? '1px solid var(--b2)' : 'none' }}>
          <div style={{ fontSize: 24, width: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{m.icon}</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{m.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text2)' }}>{m.desc}</div>
          </div>
        </div>
      ))}
    </div>
  ),
};

const TITLES = {
  faq: 'info.faq',
  returns: 'info.returns',
  track: 'info.track',
  warranty: 'info.warranty',
  payment: 'info.payment',
};

export default function InfoModal({ topic, onClose, prefill }) {
  const { t } = useLanguage();
  if (!topic) return null;

  const titleKey = TITLES[topic];
  const render = topic === 'track' ? () => <TrackOrder t={t} prefill={prefill} /> : TOPICS[topic];

  return (
    <Modal open={!!topic} onClose={onClose} title={t(titleKey)}>
      {render ? render(t) : null}
    </Modal>
  );
}
