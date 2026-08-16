import { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

function storageKey(userId) {
  return `ds_user_${userId || 'guest'}_wishlist`;
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.uid || 'guest';

  const [wishlist, setWishlist] = useState(() => readLocal(storageKey(userId)));

  useEffect(() => {
    setWishlist(readLocal(storageKey(userId)));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(wishlist));
  }, [wishlist, userId]);

  const isWishlisted = useCallback((productId) => wishlist.some((p) => p.id === productId), [wishlist]);

  const toggle = useCallback((product) => {
    setWishlist((prev) =>
      prev.some((p) => p.id === product.id) ? prev.filter((p) => p.id !== product.id) : [...prev, product]
    );
  }, []);

  const clear = useCallback(() => setWishlist([]), []);

  const value = useMemo(
    () => ({ wishlist, isWishlisted, toggle, clear }),
    [wishlist, isWishlisted, toggle, clear]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}
