import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './AuthContext';
import { CommandManager, AddItemCommand, RemoveItemCommand } from '../patterns/CartCommand';
import { decorateCartItem } from '../patterns/CartItemDecorators';

const CartContext = createContext(null);

const SHIPPING_FLAT = 150;

function storageKey(userId, kind) {
  return `ds_user_${userId || 'guest'}_${kind}`;
}

function readLocal(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const userId = user?._id || user?.uid || 'guest';

  const [cart, setCart] = useState(() => readLocal(storageKey(userId, 'cart')));

  // Reload cart whenever the active user changes (login/logout switches storage bucket).
  useEffect(() => {
    setCart(readLocal(storageKey(userId, 'cart')));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(storageKey(userId, 'cart'), JSON.stringify(cart));
  }, [cart, userId]);

  const addItem = useCallback((product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === product.id);
      if (existing) {
        return prev.map((c) => (c.id === product.id ? { ...c, qty: c.qty + qty } : c));
      }
      return [...prev, { ...product, qty }];
    });
  }, []);

  const removeItem = useCallback((productId) => {
    setCart((prev) => prev.filter((c) => c.id !== productId));
  }, []);

  const updateQty = useCallback((productId, qty) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((c) => c.id !== productId)
        : prev.map((c) => (c.id === productId ? { ...c, qty } : c))
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  // DECORATOR: per-line optional add-ons (Gift Wrap / Extended Warranty / Express Shipping)
  const toggleAddon = useCallback((productId, addonKey) => {
    setCart((prev) => prev.map((c) => {
      if (c.id !== productId) return c;
      const addons = c.addons || [];
      const has = addons.includes(addonKey);
      return { ...c, addons: has ? addons.filter((a) => a !== addonKey) : [...addons, addonKey] };
    }));
  }, []);

  // Decorated view of the cart: each line wrapped with its active addon decorators
  const decoratedCart = useMemo(() => cart.map((c) => ({
    raw: c,
    decorated: decorateCartItem(c),
  })), [cart]);

  const subtotal = useMemo(() => decoratedCart.reduce((sum, { decorated }) => sum + decorated.getPrice(), 0), [decoratedCart]);
  const itemCount = useMemo(() => cart.reduce((sum, c) => sum + c.qty, 0), [cart]);
  const pointsEarned = useMemo(() => cart.reduce((sum, c) => sum + (c.pts || 0) * c.qty, 0), [cart]);
  const shipping = cart.length ? SHIPPING_FLAT : 0;
  const total = subtotal + shipping;

  // COMMAND: undoable add/remove, driving the "Undo Last Action" button in the cart UI
  const commandManagerRef = useRef(new CommandManager());
  const [historyVersion, setHistoryVersion] = useState(0); // bump to re-render on history change

  const decrementOrRemove = useCallback((productId, qty) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === productId);
      if (!existing) return prev;
      const newQty = existing.qty - qty;
      return newQty <= 0 ? prev.filter((c) => c.id !== productId) : prev.map((c) => (c.id === productId ? { ...c, qty: newQty } : c));
    });
  }, []);

  const restoreItem = useCallback((snapshot) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.id === snapshot.id);
      if (existing) return prev.map((c) => (c.id === snapshot.id ? { ...c, qty: c.qty + snapshot.qty } : c));
      return [...prev, snapshot];
    });
  }, []);

  const cartApi = useMemo(() => ({ addItem, removeItem, updateQty, decrementOrRemove, restoreItem }), [addItem, removeItem, updateQty, decrementOrRemove, restoreItem]);

  const runAddItem = useCallback((product, qty = 1) => {
    commandManagerRef.current.run(new AddItemCommand(cartApi, product, qty));
    setHistoryVersion((v) => v + 1);
  }, [cartApi]);

  const runRemoveItem = useCallback((cartLine) => {
    commandManagerRef.current.run(new RemoveItemCommand(cartApi, cartLine));
    setHistoryVersion((v) => v + 1);
  }, [cartApi]);

  const undoLastAction = useCallback(() => {
    const undone = commandManagerRef.current.undoLast();
    setHistoryVersion((v) => v + 1);
    return undone;
  }, []);

  const canUndo = commandManagerRef.current.canUndo;
  const lastActionLabel = commandManagerRef.current.lastLabel;

  const value = useMemo(
    () => ({
      cart, addItem, removeItem, updateQty, clearCart, subtotal, itemCount, pointsEarned, shipping, total,
      toggleAddon, decoratedCart,
      runAddItem, runRemoveItem, undoLastAction, canUndo, lastActionLabel,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cart, addItem, removeItem, updateQty, clearCart, subtotal, itemCount, pointsEarned, shipping, total, toggleAddon, decoratedCart, runAddItem, runRemoveItem, undoLastAction, historyVersion]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
