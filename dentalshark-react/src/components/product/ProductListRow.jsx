import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedProduct } from '../../hooks/useLocalizedProduct';
import StarRating from '../ui/StarRating';

const BADGE_BG = { hot: '#f97316', sale: '#ef4444', new: '#3b82f6', limited: '#f59e0b' };

export default function ProductListRow({ product }) {
  const { isAr } = useLanguage();
  const navigate = useNavigate();
  const localize = useLocalizedProduct();
  const { runAddItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const p = localize(product);
  const wishlisted = isWishlisted(product.id);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    runAddItem(product);
    toast(isAr ? `🛒 ${p.name} تمت الإضافة` : `🛒 ${p.name} added`, 'success');
  };

  return (
    <div onClick={() => navigate(`/product/${product.id}`)}
      style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: 12,
        background: 'var(--card)', border: '1px solid var(--b2)', borderRadius: 12, cursor: 'pointer',
      }}>
      <img src={product.img} alt={p.name} loading="lazy"
        referrerPolicy="no-referrer"
        style={{ width: 64, height: 64, borderRadius: 9, objectFit: 'cover', background: 'var(--bg2)', flexShrink: 0 }}
        onError={e => { e.currentTarget.style.opacity = 0.35; }} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
          {product.badge && (
            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 20, background: BADGE_BG[product.badge] || '#3b82f6', color: '#fff' }}>
              {product.badge.toUpperCase()}
            </span>
          )}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{p.brand} · {p.cat2 || p.cat}</div>
        <div style={{ marginTop: 4 }}>
          <StarRating rating={product.rating} reviewCount={product.rev} />
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        <div style={{ fontWeight: 800, fontSize: 15, color: 'var(--teal)' }}>{product.price?.toLocaleString()} EGP</div>
        {product.old > product.price && (
          <div style={{ fontSize: 11, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.old?.toLocaleString()} EGP</div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
        <button onClick={e => { e.stopPropagation(); toggle(product); }}
          style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid var(--b2)', background: 'var(--bg2)', cursor: 'pointer' }}>
          {wishlisted ? '❤️' : '🤍'}
        </button>
        <button onClick={handleAddToCart}
          style={{ padding: '0 14px', height: 34, borderRadius: 8, border: 'none', background: 'var(--teal)', color: '#fff', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
          🛒 {isAr ? 'أضف' : 'Add'}
        </button>
      </div>
    </div>
  );
}
