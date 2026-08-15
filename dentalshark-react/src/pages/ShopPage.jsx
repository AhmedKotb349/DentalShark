import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useProducts } from '../context/ProductsContext';
import { useLanguage } from '../hooks/useLanguage';
import { useLocalizedProduct } from '../hooks/useLocalizedProduct';
import EmptyState from '../components/ui/EmptyState';
import ProductCard from '../components/product/ProductCard';
import ProductListRow from '../components/product/ProductListRow';
import { SORT_STRATEGIES } from '../patterns/SortStrategy';

const SORT_OPTIONS = [
  { value: 'featured',   label: 'Sort: Featured',         labelAr: 'ترتيب: مميز' },
  { value: 'price-asc',  label: 'Price: Low → High',      labelAr: 'السعر: من الأقل' },
  { value: 'price-desc', label: 'Price: High → Low',      labelAr: 'السعر: من الأعلى' },
  { value: 'rating',     label: 'Best Rated',             labelAr: 'الأعلى تقييماً' },
];

const CAT_ICONS = {
  RESTORATIVE: '🔬', ENDODONTICS: '🔩', HANDPIECES: '⚙️',
  'DENTAL UNITS': '🦷', STERILIZATION: '🧪', IMAGING: '📡',
  PERIODONTICS: '🌿', ORTHODONTICS: '😁', SURGICAL: '🔪',
};

export default function ShopPage() {
  const { isAr } = useLanguage();
  const { products, loading } = useProducts();
  const localize = useLocalizedProduct();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery]           = useState(searchParams.get('q') || '');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('cat') || '');
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sort, setSort]             = useState('featured');
  const [view, setView]             = useState('grid'); // GUI requirement: list vs grid view

  // Sync from URL
  useEffect(() => {
    setQuery(searchParams.get('q') || '');
    setSelectedCat(searchParams.get('cat') || '');
  }, [searchParams]);

  // Derived sets
  const cats   = useMemo(() => [...new Set(products.map(p => p.cat).filter(Boolean))].sort(), [products]);
  const brands = useMemo(() => [...new Set(products.map(p => p.brand).filter(Boolean))].sort(), [products]);

  // Count per category
  const catCounts = useMemo(() => {
    const c = {};
    products.forEach(p => { c[p.cat] = (c[p.cat] || 0) + 1; });
    return c;
  }, [products]);

  const filtered = useMemo(() => {
    let list = [...products];
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(p => {
      const lp = localize(p);
      return (lp.name || '').toLowerCase().includes(q)
        || (lp.brand || '').toLowerCase().includes(q)
        || (lp.cat || '').toLowerCase().includes(q);
    });
    if (selectedCat)            list = list.filter(p => p.cat === selectedCat);
    if (selectedBrands.length)  list = list.filter(p => selectedBrands.includes(p.brand));
    // STRATEGY: delegate ordering to whichever sort strategy is selected
    const strategy = SORT_STRATEGIES[sort] || SORT_STRATEGIES.featured;
    list = strategy.sort(list);
    return list;
  }, [products, query, selectedCat, selectedBrands, sort, localize]);

  const toggleBrand = brand =>
    setSelectedBrands(prev => prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]);

  return (
    <div className="shop-layout">
      {/* ── SIDEBAR ── */}
      <aside className="shop-sidebar">
        {/* CATEGORIES */}
        <div className="sb-label">{isAr ? 'الفئات' : 'CATEGORIES'}</div>

        {/* All Products row */}
        <button
          onClick={() => { setSelectedCat(''); setSelectedBrands([]); setQuery(''); setSearchParams({}); }}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: !selectedCat ? 'rgba(78,204,163,.1)' : 'none',
            color: !selectedCat ? 'var(--teal)' : 'var(--text2)',
            fontWeight: !selectedCat ? 700 : 500, fontSize: 13, fontFamily: 'Inter,sans-serif',
          }}>
          <span>🛒 {isAr ? 'جميع المنتجات' : 'All Products'}</span>
          <span style={{ background: 'var(--b2)', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>{products.length}</span>
        </button>

        {cats.map(cat => (
          <button key={cat}
            onClick={() => setSelectedCat(cat === selectedCat ? '' : cat)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '9px 10px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: selectedCat === cat ? 'rgba(78,204,163,.1)' : 'none',
              color: selectedCat === cat ? 'var(--teal)' : 'var(--text2)',
              fontWeight: selectedCat === cat ? 700 : 500, fontSize: 13, fontFamily: 'Inter,sans-serif',
            }}>
            <span>{CAT_ICONS[cat] || '🦷'} {cat.charAt(0) + cat.slice(1).toLowerCase()}</span>
            <span style={{ background: 'var(--b2)', borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 700, color: 'var(--text3)' }}>{catCounts[cat] || 0}</span>
          </button>
        ))}

        {/* BRANDS */}
        <div className="sb-label" style={{ marginTop: 20 }}>{isAr ? 'العلامات التجارية' : 'BRANDS'}</div>
        {brands.map(brand => (
          <label key={brand} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 10px', cursor: 'pointer', borderRadius: 7, fontSize: 12.5, color: 'var(--text2)', userSelect: 'none' }}>
            <input type="checkbox" checked={selectedBrands.includes(brand)} onChange={() => toggleBrand(brand)}
              style={{ accentColor: 'var(--teal)', width: 14, height: 14, flexShrink: 0 }} />
            {brand}
          </label>
        ))}
      </aside>

      {/* ── MAIN ── */}
      <main className="shop-main">
        {/* Top header row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          {/* Search input */}
          <div style={{ flex: 1, position: 'relative', minWidth: 200 }}>
            <input
              placeholder={isAr ? 'ابحث عن المنتجات...' : 'Search products...'}
              value={query}
              onChange={e => setQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 40px 10px 14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontSize: 13, boxSizing: 'border-box', outline: 'none' }}
            />
            <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text3)' }}>🔍</span>
          </div>
          {/* Product count */}
          <div style={{ fontSize: 13, color: 'var(--text2)', fontWeight: 600, flexShrink: 0 }}>
            {filtered.length} {isAr ? 'منتج' : 'products'}
          </div>
          {/* Sort */}
          <select value={sort} onChange={e => setSort(e.target.value)}
            style={{ padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--b2)', borderRadius: 9, color: 'var(--text)', fontSize: 13, appearance: 'auto' }}>
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{isAr ? o.labelAr : o.label}</option>)}
          </select>
          {/* Grid / List view toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--b2)', borderRadius: 9, overflow: 'hidden', flexShrink: 0 }}>
            <button onClick={() => setView('grid')} title={isAr ? 'عرض شبكي' : 'Grid view'}
              style={{ padding: '10px 12px', border: 'none', cursor: 'pointer', background: view === 'grid' ? 'var(--teal)' : 'var(--bg2)', color: view === 'grid' ? '#fff' : 'var(--text2)', fontSize: 14 }}>
              ▦
            </button>
            <button onClick={() => setView('list')} title={isAr ? 'عرض قائمة' : 'List view'}
              style={{ padding: '10px 12px', border: 'none', cursor: 'pointer', background: view === 'list' ? 'var(--teal)' : 'var(--bg2)', color: view === 'list' ? '#fff' : 'var(--text2)', fontSize: 14 }}>
              ☰
            </button>
          </div>
        </div>

        {/* Product grid / list */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80, color: 'var(--text2)' }}>
            {isAr ? 'جاري التحميل...' : 'Loading products…'}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="🔍" title={isAr ? 'لا توجد منتجات مطابقة لبحثك' : 'No products match your filters.'} />
        ) : view === 'grid' ? (
          <div className="prod-grid">
            {filtered.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="prod-list" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(p => <ProductListRow key={p.id} product={p} />)}
          </div>
        )}
      </main>
    </div>
  );
}
