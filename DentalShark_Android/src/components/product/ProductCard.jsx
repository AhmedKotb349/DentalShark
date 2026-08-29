import { useRef, useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedProduct } from '../../hooks/useLocalizedProduct';
import { flyToCart, heartBurst } from '../../lib/animations';
import StarRating from '../ui/StarRating';
import ProductQuickView from './ProductQuickView';
import ReactionBar from './ReactionBar';

const BADGE_BG = { hot: '#f97316', sale: '#ef4444', new: '#3b82f6', limited: '#f59e0b' };
const BADGE_LABEL = { hot: '🔥 HOT', sale: 'SALE', new: 'NEW', limited: 'LIMITED' };

export default function ProductCard({ product }) {
  const { lang, isAr } = useLanguage();
  const navigate = useNavigate();
  const localize = useLocalizedProduct();
  const { runAddItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const cardRef = useRef(null);
  const wishBtnRef = useRef(null);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const p = localize(product);
  const wishlisted = isWishlisted(product.id);
  const discount = product.old > product.price ? Math.round(((product.old - product.price) / product.old) * 100) : 0;

  // Intersection observer for reveal animation
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add('revealed'); obs.unobserve(el); } },
      { threshold: 0.08 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // 3D parallax tilt on mouse move
  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const onMove = e => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const mx = rect.width / 2;
      const my = rect.height / 2;
      const rx = (my - y) / 16;
      const ry = (x - mx) / 16;
      el.style.transform = `perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-2px)`;
    };
    const onLeave = () => { el.style.transform = ''; };
    el.addEventListener('mousemove', onMove);
    el.addEventListener('mouseleave', onLeave);
    return () => { el.removeEventListener('mousemove', onMove); el.removeEventListener('mouseleave', onLeave); };
  }, []);

  const handleAddToCart = useCallback(e => {
    e.stopPropagation();
    runAddItem(product); // COMMAND: undoable add-to-cart
    flyToCart(cardRef.current);
    const msg = isAr
      ? `🛒 تم إضافة ${p.name} — ⚡ +${product.pts} نقطة`
      : `🛒 ${p.name} added — ⚡ +${product.pts} pts`;
    toast(msg, 'success');
  }, [product, runAddItem, toast, p.name, isAr]);

  const handleWishlist = useCallback(e => {
    e.stopPropagation();
    toggle(product);
    heartBurst(wishBtnRef.current);
  }, [product, toggle]);

  return (
    <div ref={cardRef} className="pc" onClick={() => setQuickViewOpen(true)}>
      {/* Image */}
      <div className="pc-img-wrap">
        <img
          className="pc-img"
          src={product.img}
          alt={p.name}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={e => { e.currentTarget.style.opacity = 0.35; }}
        />
        <div className="pc-img-overlay" />
        {product.badge && (
          <div className="pc-badge" style={{ background: BADGE_BG[product.badge] || '#3b82f6' }}>
            {BADGE_LABEL[product.badge] || product.badge.toUpperCase()}
          </div>
        )}
        <button
          ref={wishBtnRef}
          className={`pc-wish${wishlisted ? ' wl-active' : ''}`}
          onClick={handleWishlist}
          aria-label="Wishlist"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Body */}
      <div className="pc-body">
        <div className="pc-cat">
          <span>🦷</span>
          <span>{p.cat2 || p.cat}</span>
        </div>
        <div className="pc-name">{p.name}</div>
        <div className="pc-brand">{p.brand}</div>
        <div className="pc-desc">{p.desc}</div>
        <StarRating rating={product.rating} reviewCount={product.rev} />

        {/* Price */}
        <div className="pc-price-row">
          <span className="pc-price">
            {product.price?.toLocaleString(isAr ? 'ar-EG' : 'en-US')} EGP
          </span>
          {product.old > product.price && (
            <>
              <span className="pc-old">{product.old?.toLocaleString()} EGP</span>
              <span className="pc-disc">-{discount}%</span>
            </>
          )}
        </div>

        {/* SHARK Points */}
        {product.pts > 0 && (
          <div className="pc-pts">
            ⚡ {isAr ? `اكسب ${product.pts} نقطة SHARK` : `Earn ${product.pts} SHARK Points`}
          </div>
        )}

        {/* Shipping */}
        <div className="pc-ship ship-express">
          ⚡ {isAr ? 'توصيل سريع ١–٢ يوم' : 'Express 1–2 days'}
        </div>

        {/* Facebook-style reactions */}
        <div style={{ margin: '10px 0 8px' }}>
          <ReactionBar product={product} onCommentClick={() => setQuickViewOpen(true)} />
        </div>

        {/* Cart + View actions */}
        <div className="pc-actions">
          <button className="btn-cart" onClick={handleAddToCart}>
            🛒 {isAr ? 'أضف للسلة' : 'Add to Cart'}
          </button>
          <button className="btn-qv" onClick={e => { e.stopPropagation(); setQuickViewOpen(true); }} title="Quick View">
            👁️
          </button>
        </div>
      </div>

      <ProductQuickView product={product} open={quickViewOpen} onClose={() => setQuickViewOpen(false)} />
    </div>
  );
}
