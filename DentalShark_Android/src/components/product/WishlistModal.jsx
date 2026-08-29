import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Modal from '../ui/Modal';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedProduct } from '../../hooks/useLocalizedProduct';
import { formatPrice } from '../../lib/format';
import EmptyState from '../ui/EmptyState';

export default function WishlistModal({ open, onClose }) {
  const { t, lang } = useLanguage();
  const { wishlist, toggle, clear } = useWishlist();
  const { runAddItem } = useCart();
  const { toast } = useToast();
  const localize = useLocalizedProduct();
  const navigate = useNavigate();

  const addToCart = (p) => {
    runAddItem(p); // COMMAND: undoable add-to-cart
    toast(t('cart.added', { name: p.name, points: p.pts || 0 }), 'success');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <span style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <span>
            <span style={{ color: 'var(--teal)' }}>{t('wishlist.label')}</span> · {t('wishlist.title')}
          </span>
          {wishlist.length > 0 && (
            <button
              onClick={clear}
              style={{ fontSize: 11, color: 'var(--text3)', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 12 }}
            >
              {t('wishlist.clear')}
            </button>
          )}
        </span>
      }
    >
      {!wishlist.length ? (
        <EmptyState
          icon="❤️"
          title={t('wishlist.emptyTitle')}
          description={t('wishlist.emptyDesc')}
          action={
            <button className="btn-primary" style={{ marginTop: 12 }} onClick={() => { onClose(); navigate('/shop'); }}>
              {t('wishlist.browse')}
            </button>
          }
        />
      ) : (
        <div>
          {wishlist.map((p) => {
            const lp = localize(p);
            return (
              <div key={p.id} style={{ display: 'flex', gap: 12, padding: '11px 0', borderBottom: '1px solid var(--b2)' }}>
                <img
                  src={p.img}
                  alt={lp.name}
                  referrerPolicy="no-referrer"
                  style={{ width: 54, height: 54, borderRadius: 8, objectFit: 'cover', background: 'var(--bg)' }}
                  onError={e => { e.currentTarget.style.opacity = 0.35; }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{lp.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text2)', marginTop: 2 }}>{lp.brand}</div>
                  <div style={{ fontSize: 14, color: 'var(--teal)', fontWeight: 700, marginTop: 4 }}>{formatPrice(p.price, lang)}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  <button onClick={() => toggle(p)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)' }}>
                    <Trash2 size={14} />
                  </button>
                  <button className="btn-cart" onClick={() => addToCart(p)} style={{ fontSize: 10, padding: '5px 8px' }}>
                    {t('common.addToCart')}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Modal>
  );
}
