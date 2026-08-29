import { NavLink } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../hooks/useLanguage';

export default function BottomNav({ onOpenCart, onOpenWishlist, onOpenMenu }) {
  const { t, isAr } = useLanguage();
  const { itemCount } = useCart();
  const { wishlist } = useWishlist();

  return (
    <nav id="bottom-nav">
      <NavLink to="/" end className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
        <span className="bn-ic">🏠</span>
        <span>{t('nav.home')}</span>
      </NavLink>
      <NavLink to="/shop" className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
        <span className="bn-ic">🛍️</span>
        <span>{t('nav.shop')}</span>
      </NavLink>
      <button className="bn-item" onClick={onOpenCart}>
        <span className="bn-ic">🛒</span>
        <span>{t('nav.cart')}</span>
        {itemCount > 0 && <span className="bn-badge">{itemCount}</span>}
      </button>
      <NavLink to="/ai-scanner" className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
        <span className="bn-ic">🤖</span>
        <span>{isAr ? 'فحص' : 'Scan'}</span>
      </NavLink>
      <button className="bn-item" onClick={onOpenWishlist}>
        <span className="bn-ic">❤️</span>
        <span>{t('nav.wishlist')}</span>
        {wishlist.length > 0 && <span className="bn-badge">{wishlist.length}</span>}
      </button>
      <NavLink to="/shark-points" className={({ isActive }) => `bn-item shark-pts${isActive ? ' active' : ''}`}>
        <span className="bn-ic">⚡</span>
        <span>{isAr ? 'النقاط' : 'Points'}</span>
      </NavLink>
      <button className="bn-item" onClick={onOpenMenu}>
        <span className="bn-ic">☰</span>
        <span>{isAr ? 'القائمة' : 'Menu'}</span>
      </button>
    </nav>
  );
}
