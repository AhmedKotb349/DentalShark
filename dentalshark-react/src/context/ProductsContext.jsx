import { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { api } from '../lib/api';
import { PRODUCTS as FALLBACK_PRODUCTS, USERS as FALLBACK_USERS } from '../data';

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  // Always start with fallback data — products are visible immediately on first render
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [team, setTeam] = useState(FALLBACK_USERS);
  const [loading, setLoading] = useState(false); // false — fallback shows immediately
  const [isOffline, setIsOffline] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dbProducts, dbUsers] = await Promise.all([
        api.getProducts(),
        api.getUsers(),
      ]);
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        // Normalize: backend uses pid, frontend uses id
        setProducts(dbProducts.map(p => ({ ...p, id: p.id ?? p.pid ?? p._id })));
      }
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        setTeam(dbUsers);
      }
      setIsOffline(false);
    } catch {
      // Silent: keep showing fallback PRODUCTS from data.js
      setIsOffline(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const getProduct = useCallback(
    (id) => products.find(p => p.id === Number(id) || p.pid === Number(id)),
    [products]
  );

  const value = useMemo(
    () => ({ products, team, loading, isOffline, refresh, getProduct }),
    [products, team, loading, isOffline, refresh, getProduct]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used inside ProductsProvider');
  return ctx;
}
