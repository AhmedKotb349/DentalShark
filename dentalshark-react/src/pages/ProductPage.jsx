import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { formatPrice, discountPercent } from '../lib/format';
import StarRating from '../components/ui/StarRating';
import EmptyState from '../components/ui/EmptyState';
import ReactionBar from '../components/product/ReactionBar';
import { ProductPresentation, VIEW_RENDERERS } from '../patterns/ProductViewBridge';

const BADGE_BG = { hot: '#f97316', sale: '#ef4444', new: '#3b82f6', limited: '#f59e0b' };

export default function ProductPage() {
  const { id } = useParams();
  const { t, lang, isAr } = useLanguage();
  const { getProduct, products } = useProducts();
  const { runAddItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const { toast } = useToast();
  const { user } = useAuth();
  const localize = useLocalizedProduct();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(null);
  const [viewMode, setViewMode] = useState('fancy'); // BRIDGE: 'simple' | 'fancy' — swappable independently of product data

  useEffect(() => {
    const p = getProduct(Number(id));
    if (p) {
      setProduct(p);
      setActiveImg(p.img);
      setComments(p.comments || []);
    }
  }, [id, getProduct, products]);

  const lp = product ? localize(product) : null;
  const wishlisted = product ? isWishlisted(product.id) : false;
  const discount = product ? discountPercent(product.price, product.old) : 0;

  // BRIDGE: same product data, swappable renderer implementor (Simple vs Fancy)
  const presentation = useMemo(() => {
    if (!product) return null;
    return new ProductPresentation(product, VIEW_RENDERERS[viewMode]).present();
  }, [product, viewMode]);

  const handleComment = useCallback(async () => {
    // A guest is a real, logged-in account and can comment like anyone else —
    // only a genuinely logged-out visitor (no user at all) needs to sign in first.
    if (!user) { toast('Please sign in to comment', 'warn'); return; }
    if (!commentText.trim()) return;
    try {
      const data = await api.comment(product.id, commentText.trim());
      setComments(data.comments || [...comments, { id: Date.now(), text: commentText, userName: user?.name || 'You', userId: user?._id }]);
      setCommentText('');
    } catch { toast('Error posting comment', 'error'); }
  }, [user, product, commentText, comments, toast]);

  const handleDeleteComment = useCallback(async (cid) => {
    try {
      const data = await api.deleteComment(product.id, cid);
      setComments(data.comments || comments.filter(c => c.id !== cid));
    } catch {}
  }, [product, comments]);

  const handleAddToCart = () => {
    runAddItem(product, qty); // COMMAND: undoable add-to-cart
    toast(`🛒 ${lp.name} × ${qty} added! ⚡ +${(product.pts || 0) * qty} pts`, 'success');
  };

  const handleWhatsApp = () => {
    const msg = `Hi DentalShark! I am interested in: ${lp.name} by ${lp.brand} — Price: ${formatPrice(product.price, lang)}. Can you help?`;
    window.open(`https://wa.me/201001234567?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!product) {
    return (
      <div style={{ paddingTop: 'var(--nav-offset)', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState icon="🦷" title="Product not found"
          action={<button className="btn-primary" onClick={() => navigate('/shop')} style={{ marginTop: 16 }}>← Back to Shop</button>}
        />
      </div>
    );
  }

  return (
    <div style={{ paddingTop: 'var(--nav-offset)', minHeight: '100vh', background: 'var(--bg)' }}>
      <div className="sec" style={{ maxWidth: 1100 }}>
        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text3)', marginBottom: 24 }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12 }}>{isAr ? 'الرئيسية' : 'Home'}</button>
          <span>›</span>
          <button onClick={() => navigate('/shop')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12 }}>{isAr ? 'المتجر' : 'Shop'}</button>
          <span>›</span>
          <button onClick={() => navigate(`/shop?cat=${encodeURIComponent(product.cat)}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 12 }}>{product.cat}</button>
          <span>›</span>
          <span style={{ color: 'var(--teal)', fontWeight: 600 }}>{lp.name}</span>
        </div>

        {/* Main layout */}
        <div className="pp-main-grid">
          {/* ── Image panel ── */}
          <div>
            <div style={{ borderRadius: 20, overflow: 'hidden', background: 'var(--bg2)', border: '1px solid var(--b2)', position: 'relative', aspectRatio: '1' }}>
              {activeImg ? (
                <img src={activeImg} alt={lp.name}
                  referrerPolicy="no-referrer"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 20, boxSizing: 'border-box' }}
                  onError={e => { e.currentTarget.style.opacity = 0.35; }}
                />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, color: 'var(--b2)' }}>🦷</div>
              )}
              {product.badge && (
                <div style={{ position: 'absolute', top: 16, left: 16, background: BADGE_BG[product.badge] || '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: 7, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {product.badge === 'hot' && '🔥 '}{product.badge.toUpperCase()}
                </div>
              )}
            </div>
          </div>

          {/* ── Info panel ── */}
          <div>
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>🦷 {lp.cat}</div>
            <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: 'var(--text)', lineHeight: 1.05, margin: '0 0 8px' }}>{lp.name}</h1>
            <div style={{ fontSize: 14, color: 'var(--text3)', marginBottom: 14 }}>{lp.brand}</div>

            <StarRating rating={product.rating} reviewCount={product.rev} />

            <p style={{ fontSize: 14, color: 'var(--text2)', lineHeight: 1.75, margin: '14px 0 20px' }}>
              {presentation?.showFullDescription ? lp.desc : `${(lp.desc || '').slice(0, 90)}${(lp.desc || '').length > 90 ? '…' : ''}`}
            </p>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8 }}>
              <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 40, color: 'var(--teal)', letterSpacing: 1 }}>
                {product.price?.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US')} <span style={{ fontSize: 18 }}>EGP</span>
              </span>
              {product.old > product.price && (
                <>
                  <span style={{ fontSize: 16, color: 'var(--text3)', textDecoration: 'line-through' }}>{product.old?.toLocaleString()} EGP</span>
                  <span style={{ background: 'rgba(239,68,68,.15)', color: '#f87171', fontSize: 12, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>-{discount}%</span>
                </>
              )}
            </div>

            {/* Points */}
            {product.pts > 0 && (
              <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ fontSize: 18 }}>⚡</span>
                <span>{isAr ? 'اكسب ' : 'Earn '}<strong style={{ color: 'var(--gold)' }}>{product.pts}</strong>{isAr ? ' نقطة SHARK مع هذا الشراء' : ' SHARK Points with this purchase'}</span>
              </div>
            )}

            {/* Shipping */}
            <div style={{ background: 'var(--b2)', borderRadius: 10, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: 'var(--text2)' }}>
              🚚 Ships from Cairo to all 27 governorates · <strong style={{ color: 'var(--teal)' }}>Express 1–2 days</strong>
            </div>

            {/* View mode toggle — BRIDGE: swap renderer implementor independently of the product data */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button onClick={() => setViewMode('simple')}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${viewMode === 'simple' ? 'var(--teal)' : 'var(--b2)'}`, background: viewMode === 'simple' ? 'rgba(78,204,163,.12)' : 'var(--bg2)', color: viewMode === 'simple' ? 'var(--teal)' : 'var(--text3)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                🗒️ {isAr ? 'عرض بسيط' : 'Simple View'}
              </button>
              <button onClick={() => setViewMode('fancy')}
                style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${viewMode === 'fancy' ? 'var(--teal)' : 'var(--b2)'}`, background: viewMode === 'fancy' ? 'rgba(78,204,163,.12)' : 'var(--bg2)', color: viewMode === 'fancy' ? 'var(--teal)' : 'var(--text3)', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}>
                ✨ {isAr ? 'عرض مميز' : 'Fancy View'}
              </button>
            </div>

            {/* Meta grid — driven by the Bridge's active ViewRenderer */}
            <div className="pp-meta-grid">
              {(presentation?.sections || []).map(({ label, value }) => (
                <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 10, padding: '10px 14px' }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 4 }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</div>
                </div>
              ))}
            </div>

            {/* Qty + Add to Cart */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--b2)', borderRadius: 10, overflow: 'hidden' }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))}
                  style={{ width: 38, height: 48, background: 'var(--bg2)', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ width: 48, textAlign: 'center', fontSize: 15, fontWeight: 700, color: 'var(--text)' }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q + 1))}
                  style={{ width: 38, height: 48, background: 'var(--bg2)', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
              </div>
              <button className="btn-primary" onClick={handleAddToCart} style={{ flex: 1, fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                🛒 Add to Cart
              </button>
              <button onClick={() => toggle(product)}
                style={{ width: 48, height: 48, border: `1.5px solid ${wishlisted ? 'rgba(239,68,68,.4)' : 'var(--b2)'}`, borderRadius: 10, background: wishlisted ? 'rgba(239,68,68,.08)' : 'var(--bg2)', cursor: 'pointer', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlisted ? '❤️' : '🤍'}
              </button>
            </div>

            <button className="btn-outline" onClick={handleWhatsApp} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              💬 WhatsApp — Ask about this product
            </button>
          </div>
        </div>

        {/* ── Reactions + Comments ── */}
        <div className="pp-reactions-comments-grid">
          {/* Reactions */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'var(--text)', marginBottom: 20, letterSpacing: 1 }}>{isAr ? 'تفاعلات المجتمع' : 'Community Reactions'}</h3>
            <ReactionBar product={product} onCommentClick={() => document.getElementById('product-comment-input')?.focus()} />
          </div>

          {/* Comments */}
          <div>
            <h3 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 22, color: 'var(--text)', marginBottom: 20, letterSpacing: 1 }}>
              Comments <span style={{ fontSize: 14, fontFamily: 'Inter,sans-serif', color: 'var(--text3)', fontWeight: 400 }}>({comments.length})</span>
            </h3>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <input id="product-comment-input" value={commentText} onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleComment()}
                placeholder={!user ? 'Sign in to comment…' : 'Write a comment…'}
                disabled={!user}
                style={{ flex: 1, padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 10, color: 'var(--text)', fontSize: 13, outline: 'none' }}
              />
              <button className="btn-primary" onClick={handleComment} style={{ padding: '10px 16px', whiteSpace: 'nowrap' }}>{isAr ? 'نشر' : 'Post'}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 320, overflowY: 'auto' }}>
              {comments.length === 0
                ? <p style={{ fontSize: 13, color: 'var(--text3)' }}>Be the first to comment on this product.</p>
                : comments.map(c => (
                  <div key={c.id || c._id} style={{ background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 10, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--teal)', marginBottom: 4 }}>{c.userName}</div>
                      <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>{c.text}</div>
                    </div>
                    {(user?._id === c.userId || user?.uid === c.userId) && (
                      <button onClick={() => handleDeleteComment(c.id || c._id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: 16, flexShrink: 0, alignSelf: 'flex-start' }}>✕</button>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
