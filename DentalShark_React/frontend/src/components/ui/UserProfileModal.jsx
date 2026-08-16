import { useNavigate } from 'react-router-dom';
import Modal from './Modal';

/**
 * A profile popup for a single user. When `showActions` is true (the default), it
 * includes the current-account actions — Redeem points, go to Dashboard, Sign Out —
 * so it doubles as the account quick-view opened from the navbar. When `showActions`
 * is false, it renders as a read-only card (used e.g. to view a team member's profile
 * from the About page), with no account-management actions shown.
 */
export default function UserProfileModal({ user, open, onClose, onLogout, showActions = true, isAr = false }) {
  const navigate = useNavigate();
  if (!user || !open) return null;

  return (
    <Modal open={open} onClose={onClose} title={`👤 ${user.name}`} maxWidth={520}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0 20px', borderBottom: '1px solid var(--b2)' }}>
        <div style={{
          width: 64, height: 64, borderRadius: 14, flexShrink: 0,
          background: user.color?.includes('gradient') ? user.color : (user.color || 'var(--teal)'),
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 800, color: '#fff',
        }}>{user.initials || (user.name || '?')[0]}</div>
        <div>
          <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--text)' }}>{user.name}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <span style={{ fontSize: 10 }}>👤</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 1 }}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="dash-profile-fields-grid">
        {[
          ['DEPARTMENT', user.dept || '—'],
          ['EMAIL', user.email || '—'],
          ['PHONE', user.phone || '—'],
          ['MEMBER SINCE', user.joined || '—'],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 13, color: 'var(--text)', fontWeight: 500 }}>{val}</div>
          </div>
        ))}
      </div>

      {showActions && (
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gold)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{isAr ? 'رصيد نقاط SHARK' : 'YOUR SHARK POINTS'}</div>
            <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 36, color: 'var(--gold)', letterSpacing: 2 }}>{user.sharkPts || 0}</div>
          </div>
          <button onClick={() => { onClose(); navigate('/shark-points'); }}
            style={{ padding: '9px 18px', background: 'rgba(245,158,11,.2)', border: '1px solid rgba(245,158,11,.4)', borderRadius: 9, color: 'var(--gold)', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
            Redeem →
          </button>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {[
          { label: `💬 ${isAr ? 'رسالة' : 'Message'}`, color: 'var(--teal)', bg: 'rgba(78,204,163,.1)' },
          { label: `📧 ${isAr ? 'بريد' : 'Email'}`, color: 'var(--text)', bg: 'var(--b2)' },
          ...(showActions ? [
            { label: `📊 ${isAr ? 'لوحة التحكم' : 'Dashboard'}`, color: 'var(--text)', bg: 'var(--b2)', action: () => { onClose(); navigate('/dashboard'); } },
            { label: `🚪 ${isAr ? 'تسجيل الخروج' : 'Sign Out'}`, color: '#f87171', bg: 'rgba(239,68,68,.1)', action: onLogout },
          ] : []),
        ].map(btn => (
          <button key={btn.label} onClick={btn.action || (() => {})}
            style={{ flex: 1, padding: '10px 0', borderRadius: 9, border: '1px solid var(--b2)', background: btn.bg, color: btn.color, fontWeight: 700, cursor: 'pointer', fontSize: 12, fontFamily: 'Inter,sans-serif', minWidth: 90 }}>
            {btn.label}
          </button>
        ))}
      </div>
    </Modal>
  );
}
