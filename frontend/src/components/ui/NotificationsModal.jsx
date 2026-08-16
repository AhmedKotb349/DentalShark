import Modal from './Modal';
import { useLanguage } from '../../hooks/useLanguage';
import { useAuth } from '../../context/AuthContext';
import { getVisibleNotifs } from '../../data';
import EmptyState from './EmptyState';

export default function NotificationsModal({ open, onClose }) {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const { isStaffOrAdmin, isGuest } = useAuth();
  const notifs = getVisibleNotifs(isStaffOrAdmin, isGuest);

  return (
    <Modal open={open} onClose={onClose} title={`🔔 ${isAr ? 'الإشعارات' : 'Notifications'}`} maxWidth={560}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {notifs.length === 0 ? (
          <EmptyState icon="🔔" title={isAr ? 'لا توجد إشعارات' : 'No notifications yet'} description="" />
        ) : notifs.map((n, i) => (
          <div key={i} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 0',
            borderBottom: i < notifs.length - 1 ? '1px solid var(--b2)' : 'none',
          }}>
            {/* Dot indicator */}
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
              background: n.read ? 'var(--b2)' : 'var(--teal)',
            }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.45, marginBottom: 3 }}>{n.t}</div>
              <div style={{ fontSize: 11, color: 'var(--text3)' }}>{n.tm}</div>
            </div>
          </div>
        ))}
      </div>
    </Modal>
  );
}
