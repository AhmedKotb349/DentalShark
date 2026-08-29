import { useNavigate } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import { flyToCart } from '../lib/animations';
import { formatPrice } from '../lib/format';
import { useRef } from 'react';
import EmptyState from '../components/ui/EmptyState';

function WishlistItem({ product, onRemove }) {
  const { isAr } = useLanguage();
  const { runAddItem } = useCart();
  const { toast } = useToast();
  const localize = useLocalizedProduct();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const lp = localize(product);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    runAddItem(product); // COMMAND: undoable add-to-cart
    flyToCart(cardRef.current);
    toast(`🛒 ${lp.name} added — ⚡ +${product.pts || 0} pts`, 'success');
  };

  return (
    <div ref={cardRef} style={{ background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 14, padding: '16px', display: 'flex', gap: 14, alignItems: 'flex-start', cursor: 'pointer', transition: '.2s' }}
      onClick={() => navigate(`/product/${product.id}`)}
      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--teal)'}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--b2)'}
    >
      <img src={product.img} alt={lp.name}
        referrerPolicy="no-referrer"
        style={{ width: 80, height: 80, borderRadius: 10, objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }}
        onError={e => { e.currentTarget.style.opacity = 0.35; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>🦷 {lp.cat}</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 2, lineHeight: 1.3 }}>{lp.name}</div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>{lp.brand}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, color: 'var(--teal)', letterSpacing: 1 }}>
            {formatPrice(product.price, isAr ? 'ar' : 'en')}
          </span>
          {product.old > product.price && (
            <span style={{ fontSize: 12, color: 'var(--text3)', textDecoration: 'line-through' }}>
              {formatPrice(product.old, isAr ? 'ar' : 'en')}
            </span>
          )}
        </div>
        {product.pts > 0 && (
          <div style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 700, marginTop: 4 }}>⚡ Earn {product.pts} SHARK Points</div>
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
        <button onClick={handleAddToCart}
          style={{ padding: '8px 14px', background: 'var(--teal)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          🛒 {isAr ? 'أضف للسلة' : 'Add to Cart'}
        </button>
        <button onClick={e => { e.stopPropagation(); onRemove(product); }}
          style={{ padding: '8px 14px', background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.2)', borderRadius: 8, color: '#f87171', fontWeight: 700, cursor: 'pointer', fontSize: 12 }}>
          ✕ {isAr ? 'حذف' : 'Remove'}
        </button>
      </div>
    </div>
  );
}

export default function WishlistPage() {
  const { isAr } = useLanguage();
  const { wishlist, toggle, clear } = useWishlist();
  const navigate = useNavigate();

  return (
    <div style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="sec">
        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div className="sec-label">{isAr ? 'تفضيلاتي' : 'MY COLLECTION'}</div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: 'var(--text)', letterSpacing: 1.5 }}>
              {isAr ? 'قائمة ' : 'MY '}<span style={{ color: 'var(--teal)' }}>{isAr ? 'المفضلة' : 'WISHLIST'}</span>
            </h1>
            {wishlist.length > 0 && (
              <button onClick={clear}
                style={{ fontSize: 12, color: 'var(--text3)', background: 'none', border: '1px solid var(--b2)', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: 'Inter,sans-serif' }}>
                🗑 {isAr ? 'مسح الكل' : 'Clear All'}
              </button>
            )}
          </div>
        </div>

        {wishlist.length === 0 ? (
          /* Empty state */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: 80, marginBottom: 20 }}>❤️</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', marginBottom: 8 }}>
              {isAr ? 'قائمة المفضلة فارغة' : 'Your wishlist is empty'}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text2)', marginBottom: 24 }}>
              {isAr ? 'احفظ منتجاتك المفضلة للعودة إليها لاحقاً' : 'Save products you love for later'}
            </div>
            <button className="btn-primary" onClick={() => navigate('/shop')} style={{ padding: '12px 28px' }}>
              🛍️ {isAr ? 'تصفح المتجر' : 'Browse Shop'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 760 }}>
            {wishlist.map(p => (
              <WishlistItem key={p.id} product={p} onRemove={toggle} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
