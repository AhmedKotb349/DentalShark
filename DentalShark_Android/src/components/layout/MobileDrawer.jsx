import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useProducts } from '../../context/ProductsContext';
import { useLanguage } from '../../hooks/useLanguage';
import { useLocalizedProduct } from '../../hooks/useLocalizedProduct';

const LINKS = [
  { to: '/', icon: '🏠', key: 'home' },
  { to: '/shop', icon: '🛍️', key: 'shop' },
  { to: '/ai-scanner', icon: '🤖', key: 'ai' },
  { to: '/engineers', icon: '🔧', key: 'engineers' },
  { to: '/about', icon: 'ℹ️', key: 'about' },
  { to: '/contact', icon: '📞', key: 'contact' },
];

export default function MobileDrawer({ open, onClose, onOpenWishlist, onOpenCart, onOpenNotifs }) {
  const { t, lang, toggleLanguage, isAr } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isGuest, logout } = useAuth();
  const { products } = useProducts();
  const localize = useLocalizedProduct();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const matches = query.trim().length >= 1
    ? products.filter(p => {
        const q = query.toLowerCase();
        return p.name.toLowerCase().includes(q)
          || (p.brand || '').toLowerCase().includes(q)
          || (p.cat2 || p.cat || '').toLowerCase().includes(q);
      }).slice(0, 6).map(localize)
    : [];

  const doSearch = () => {
    if (!query.trim()) return;
    onClose();
    setQuery('');
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  };

  const go = (fn) => {
    fn();
    onClose();
  };

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 1599 }}
        />
      )}
      <div className={`mob-drawer${open ? ' open' : ''}`} id="mob-drawer">
        <div className="mob-drawer-head">
          <div className="mob-brand">DentalShark</div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: '8px 0' }}>
          {/* Search — this is the previously-missing mobile search; live-filters as you type,
              same matching logic as the desktop navbar and the Shop page. */}
          <div id="mob-search-row" style={{ padding: '4px 16px 10px' }}>
            <input
              className="mob-search"
              placeholder={isAr ? 'ابحث عن المنتجات...' : 'Search products...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && doSearch()}
            />
            {matches.length > 0 && (
              <div style={{ background: 'var(--card2)', border: '1px solid var(--b2)', borderRadius: 10, overflow: 'hidden', marginTop: -4, marginBottom: 8 }}>
                {matches.map(p => (
                  <div key={p.id} className="sdrop-item" style={{ cursor: 'pointer' }}
                    onClick={() => { navigate(`/product/${p.id}`); setQuery(''); onClose(); }}>
                    <img className="sdrop-img" src={p.img} alt={p.name} referrerPolicy="no-referrer" onError={e => { e.currentTarget.style.opacity = 0.35; }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="sdrop-name">{p.name}</div>
                      <div className="sdrop-brand">{p.brand}</div>
                    </div>
                    <span className="sdrop-price">{(p.price || 0).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="mob-drawer-link" onClick={onClose}>
              <span className="mi">{l.icon}</span>
              {t(`nav.${l.key}`)}
            </Link>
          ))}
          <button className="mob-drawer-link" onClick={() => go(onOpenWishlist)}>
            <span className="mi">❤️</span>
            {t('footer.myWishlist')}
          </button>
          <button className="mob-drawer-link" onClick={() => go(onOpenCart)}>
            <span className="mi">🛒</span>
            {t('nav.cart')}
          </button>
          {!isGuest && (
            <>
              <button className="mob-drawer-link" onClick={() => go(onOpenNotifs)}>
                <span className="mi">🔔</span>
                {t('nav.notifications')}
              </button>
              <Link to="/shark-points" className="mob-drawer-link" onClick={onClose}>
                <span className="mi">⚡</span>
                {t('footer.sharkPoints')}
              </Link>
              <Link to="/dashboard" className="mob-drawer-link" onClick={onClose}>
                <span className="mi">📊</span>
                {t('dashboard.overview')}
              </Link>
            </>
          )}
          <button className="mob-drawer-link" onClick={toggleTheme}>
            <span className="mi">{theme === 'dark' ? '🌙' : '☀️'}</span>
            {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
          </button>
          <button className="mob-drawer-link" onClick={toggleLanguage}>
            <span className="mi">🌐</span>
            {t('nav.language')}
          </button>
          {!user ? (
            <button className="mob-drawer-link" onClick={() => go(() => navigate('/login'))}>
              <span className="mi">🔑</span>
              {t('common.signIn')}
            </button>
          ) : (
            <button className="mob-drawer-link" onClick={() => go(() => { logout(); navigate('/login'); })}>
              <span className="mi">🚪</span>
              {t('common.signOut')}
            </button>
          )}
        </div>
      </div>
    </>
  );
}
