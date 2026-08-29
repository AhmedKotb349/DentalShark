import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal';
import StarRating from '../ui/StarRating';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedProduct } from '../../hooks/useLocalizedProduct';
import { flyToCart } from '../../lib/animations';
import { formatPrice, discountPercent, getWarranty, getStockStatus } from '../../lib/format';

export default function ProductQuickView({ product, open, onClose }) {
  const { isAr, lang } = useLanguage();
  const { runAddItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const localize = useLocalizedProduct();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const cardRef = useRef(null);

  if (!product) return null;
  const lp = localize(product);
  const wishlisted = isWishlisted(product.id);
  const discount = discountPercent(product.price, product.old);
  const warranty = getWarranty(product);
  const stock = getStockStatus(product, lang);

  const handleAddToCart = () => {
    runAddItem(product, qty); // COMMAND: undoable add-to-cart
    flyToCart(cardRef.current);
    toast(`🛒 ${lp.name} × ${qty} added! ⚡ +${(product.pts || 0) * qty} pts`, 'success');
    onClose();
  };

  const viewFullPage = () => {
    onClose();
    navigate(`/product/${product.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title={lp.name} maxWidth={780}>
      <div ref={cardRef} className="qv-layout">
        {/* Image + shipping + points earned */}
        <div className="qv-media-col">
          <div className="qv-img-wrap">
            <img src={product.img} alt={lp.name} className="pc-img" referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.opacity = 0.35; }} />
            {product.badge && (
              <div className="pc-badge" style={{ position: 'absolute', top: 12, left: 12 }}>
                {product.badge.toUpperCase()}
              </div>
            )}
          </div>

          {/* Shipping */}
          <div className="qv-shipping-card">
            <div className="qv-shipping-label">{isAr ? 'الشحن' : 'SHIPPING'}</div>
            <div className="qv-shipping-line">
              ⚡ {isAr ? 'إكسبريس: ١-٢ يوم عمل' : 'Express: 1–2 business days'}
            </div>
            <div className="qv-shipping-sub">
              {isAr ? 'الشحن من القاهرة لجميع المحافظات الـ٢٧' : 'Ships from Cairo to all 27 governorates'}
            </div>
          </div>

          {/* SHARK points earned */}
          {product.pts > 0 && (
            <div className="qv-pts-banner">
              <div className="qv-pts-label">{isAr ? 'نقاط SHARK المكتسبة' : 'SHARK POINTS EARNED'}</div>
              <div className="qv-pts-value">⚡ {(product.pts * qty).toLocaleString()} {isAr ? 'نقطة' : 'POINTS'}</div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="qv-info">
          <div className="pc-cat"><span>🦷</span><span>{lp.cat2 || lp.cat}</span></div>
          <div className="qv-brand">{lp.brand}</div>
          <StarRating rating={product.rating} reviewCount={product.rev} />
          <p className="qv-desc">{lp.desc}</p>

          <div className="pc-price-row" style={{ marginTop: 12 }}>
            <span className="pc-price">{formatPrice(product.price, lang)}</span>
            {product.old > product.price && (
              <>
                <span className="pc-old">{formatPrice(product.old, lang)}</span>
                <span className="pc-disc">-{discount}%</span>
              </>
            )}
          </div>

          {/* Qty + actions */}
          <div className="qv-actions">
            <div className="qv-qty">
              <button onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty(q => q + 1)}>+</button>
            </div>
            <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1 }}>
              🛒 {isAr ? 'أضف للسلة' : 'Add to Cart'}
            </button>
            <button className={`qv-wish${wishlisted ? ' active' : ''}`} onClick={() => toggle(product)} aria-label="Wishlist">
              {wishlisted ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Brand / Category / Warranty / Stock grid */}
          <div className="qv-specs-grid">
            <div><div className="qv-spec-label">{isAr ? 'الماركة' : 'BRAND'}</div><div className="qv-spec-val">{lp.brand}</div></div>
            <div><div className="qv-spec-label">{isAr ? 'الفئة' : 'CATEGORY'}</div><div className="qv-spec-val">{lp.cat2 || lp.cat}</div></div>
            <div><div className="qv-spec-label">{isAr ? 'الضمان' : 'WARRANTY'}</div><div className="qv-spec-val">{warranty}</div></div>
            <div><div className="qv-spec-label">{isAr ? 'التوفر' : 'STOCK'}</div><div className="qv-spec-val qv-spec-stock">{stock}</div></div>
          </div>

          <button className="btn-outline" onClick={viewFullPage} style={{ width: '100%', marginTop: 10 }}>
            {isAr ? 'عرض التفاصيل الكاملة والتعليقات ←' : 'View Full Details & Reviews →'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
