import { useState, useEffect, useCallback } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../hooks/useLanguage';
import { displayLastName } from '../../lib/format';
import UserProfileModal from '../ui/UserProfileModal';

const NAV_LINKS = [
  { to: '/', label: 'HOME', labelAr: 'الرئيسية', end: true },
  { to: '/shop', label: 'SHOP', labelAr: 'المتجر' },
  { to: '/ai-scanner', label: 'AI SCANNER', labelAr: 'الذكاء الاصطناعي' },
  { to: '/engineers', label: 'ENGINEERS', labelAr: 'المهندسون' },
  { to: '/about', label: 'ABOUT', labelAr: 'من نحن' },
  { to: '/contact', label: 'CONTACT', labelAr: 'تواصل' },
];

function useSessionTimer() {
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const start = Date.now();
    const id = setInterval(() => setSecs(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => clearInterval(id);
  }, []);
  const h = String(Math.floor(secs / 3600)).padStart(2, '0');
  const m = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function Navbar({ onOpenCart, onOpenWishlist, onOpenNotifs, onOpenMobileDrawer }) {
  const { lang, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { user, isGuest, logout } = useAuth();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const timer = useSessionTimer();
  const isAr = lang === 'ar';

  const [query, setQuery] = useState('');
  const [profileOpen, setProfileOpen] = useState(false);

  const doSearch = useCallback(() => {
    if (!query.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(query.trim())}`);
  }, [query, navigate]);

  return (
    <nav id="main-nav" className="home-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 2000 }}>
      <div className="nav-in">
        {/* Logo */}
        <Link to="/" className="nav-logo" style={{ textDecoration: 'none', flexShrink: 0 }}>
          <img
            src="/logo.png"
            alt="DentalShark"
            className="nav-logo-img"
            onError={e => { e.currentTarget.src = '/logo.png'; }}
          />
          <div className="nav-logo-text">
            <div className="nav-logo-name">Dental<span>Shark</span></div>
          </div>
        </Link>

        {/* Search — same simple style as the Shop page's own search bar (no dropdown) */}
        <div className="nav-search" style={{ flex: '1 1 auto', maxWidth: 340, minWidth: 0, position: 'relative' }}>
          <input
            placeholder={isAr ? 'ابحث عن المنتجات...' : 'Search products...'}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
            style={{ width: '100%', padding: '10px 40px 10px 14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
          />
          <span onClick={doSearch} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text3)', cursor: 'pointer' }}>🔍</span>
        </div>

        {/* Nav links */}
        <div className="nav-links">
          {NAV_LINKS.map(l => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => `nl${isActive ? ' active' : ''}`}>
              {isAr ? l.labelAr : l.label}
            </NavLink>
          ))}
        </div>

        {/* Right controls */}
        <div className="nav-right">
          {/* Session timer */}
          <button
            className="nav-timer"
            style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(78,204,163,.1)', border: '1px solid rgba(78,204,163,.25)', borderRadius: 20, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: 'var(--teal)', cursor: 'default', flexShrink: 0 }}
          >
            ⏱ {timer}
          </button>

          {/* Language toggle — hidden on phone-width screens (class matches the
              existing mobile media query); still reachable via the hamburger drawer. */}
          <button className="icon-btn nav-lang" onClick={toggleLanguage}
            style={{ fontFamily: "'Cairo','Inter',sans-serif", fontSize: 11, fontWeight: 800, color: 'var(--text)', border: '1px solid var(--b2)', borderRadius: 6, padding: '3px 9px', background: 'var(--bg2)', minWidth: 56 }}>
            {isAr ? 'English' : 'العربية'}
          </button>

          {/* Theme */}
          <button className="icon-btn nav-theme" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>

          {/* Wishlist */}
          <button className="icon-btn nav-wishlist" onClick={onOpenWishlist} style={{ position: 'relative' }}>
            ❤️
            {wishlist.length > 0 && <span className="badge">{wishlist.length}</span>}
          </button>

          {/* Cart */}
          <button className="icon-btn nav-cart" onClick={onOpenCart} style={{ position: 'relative' }} id="nav-cart-btn">
            🛒
            <span className="badge" id="cart-badge-count">{itemCount}</span>
          </button>

          {/* Notifications */}
          <button className="icon-btn" onClick={onOpenNotifs} style={{ position: 'relative' }}>
            🔔
            {!isGuest && <span className="badge badge-red" style={{ background: '#ef4444' }}>3</span>}
          </button>

          {/* SHARK Points */}
          <button className="icon-btn nav-pts" onClick={() => navigate('/shark-points')} style={{ position: 'relative', color: 'var(--gold)' }}>
            ⚡
            {!isGuest && user?.sharkPts > 0 && (
              <span className="badge" style={{ background: 'var(--gold)', color: '#000' }}>{user.sharkPts}</span>
            )}
          </button>

          {/* User — guest counts as logged in; only show Sign In when nobody is signed in at all */}
          {!user ? (
            <button className="btn-signin" onClick={() => navigate('/login')}>{isAr ? 'تسجيل الدخول' : 'SIGN IN'}</button>
          ) : (
            <button className="btn-signin" onClick={() => setProfileOpen(true)}
              style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '5px 12px 5px 6px' }}>
              <span style={{
                width: 26, height: 26, borderRadius: 6, flexShrink: 0,
                background: user?.color?.includes('gradient') ? user.color : (user?.color || 'var(--teal)'),
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 800, color: '#fff',
              }}>
                {user?.initials || (user?.name || '?')[0]}
              </span>
              <span style={{ fontSize: 11, maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {displayLastName(user?.name)}
              </span>
            </button>
          )}

          {/* Hamburger */}
          <button className="hamburger" onClick={onOpenMobileDrawer} aria-label="Menu">☰</button>
        </div>
      </div>
      <UserProfileModal
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onLogout={() => { setProfileOpen(false); logout(); navigate('/login'); }}
        isAr={isAr}
      />
    </nav>
  );
}
