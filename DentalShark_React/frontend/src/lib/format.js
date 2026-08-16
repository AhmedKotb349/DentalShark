export function formatPrice(amount, lang = 'en') {
  const n = Number(amount) || 0;
  const formatted = n.toLocaleString(lang === 'ar' ? 'ar-EG' : 'en-US');
  return lang === 'ar' ? `${formatted} ج.م` : `${formatted} EGP`;
}

export function formatDate(dateInput, lang = 'en') {
  const d = dateInput instanceof Date ? dateInput : new Date(dateInput);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function discountPercent(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

/**
 * Returns just the surname for compact nav display, e.g.
 * "Eng. Ahmed Kotb" -> "Kotb", "Dr. Ashraf Elsokary" -> "Elsokary".
 * Strips common titles before taking the last token.
 */
export function displayLastName(fullName = '') {
  const TITLES = new Set(['eng.', 'eng', 'dr.', 'dr', 'mr.', 'mr', 'ms.', 'ms', 'mrs.', 'mrs', 'prof.', 'prof']);
  const tokens = fullName.trim().split(/\s+/).filter(Boolean);
  const meaningful = tokens.filter(t => !TITLES.has(t.toLowerCase()));
  const pool = meaningful.length ? meaningful : tokens;
  return pool[pool.length - 1] || fullName || '';
}

export function initialsOf(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function classNames(...parts) {
  return parts.filter(Boolean).join(' ');
}

const EQUIPMENT_CATEGORIES = ['Dental Units', 'Sterilization', 'Imaging', 'Surgical', 'Periodontics', 'Handpieces'];

// Warranty/stock aren't in the product data model yet — derive a sensible
// default from category so quick-view / full product pages have something
// consistent to show rather than nothing.
export function getWarranty(product) {
  if (product?.warranty) return product.warranty;
  return EQUIPMENT_CATEGORIES.includes(product?.cat2) ? '12 months' : '6 months';
}

export function getStockStatus(product, lang = 'en') {
  if (product?.stock) return product.stock;
  return lang === 'ar' ? 'متوفر' : 'In Stock';
}
