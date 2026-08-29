import { useState, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import BottomNav from './BottomNav';
import MobileDrawer from './MobileDrawer';
import Footer from './Footer';
import ToastContainer from '../ui/ToastContainer';
import CartSidebar from '../cart/CartSidebar';
import WishlistModal from '../product/WishlistModal';
import NotificationsModal from '../ui/NotificationsModal';
import InfoModal from '../ui/InfoModal';

export default function Layout() {
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [notifsOpen, setNotifsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [infoTopic, setInfoTopic] = useState(null);
  const [infoPrefill, setInfoPrefill] = useState('');

  const openCart = useCallback(() => setCartOpen(true), []);
  const openWishlist = useCallback(() => setWishlistOpen(true), []);
  const openNotifs = useCallback(() => setNotifsOpen(true), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const showInfo = useCallback((topic, prefill = '') => { setInfoTopic(topic); setInfoPrefill(prefill); }, []);

  return (
    <>
      <Navbar
        onOpenCart={openCart}
        onOpenWishlist={openWishlist}
        onOpenNotifs={openNotifs}
        onOpenMobileDrawer={openDrawer}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onOpenCart={openCart}
        onOpenWishlist={openWishlist}
        onOpenNotifs={openNotifs}
      />

      <main>
        <Outlet context={{ openCart, openWishlist, showInfo }} />
      </main>

      <Footer onShowInfo={showInfo} />
      <BottomNav onOpenCart={openCart} onOpenWishlist={openWishlist} onOpenMenu={openDrawer} />

      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
      <WishlistModal open={wishlistOpen} onClose={() => setWishlistOpen(false)} />
      <NotificationsModal open={notifsOpen} onClose={() => setNotifsOpen(false)} />
      <InfoModal topic={infoTopic} prefill={infoPrefill} onClose={() => setInfoTopic(null)} />

      <ToastContainer />
    </>
  );
}
