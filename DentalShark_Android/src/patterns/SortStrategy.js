/**
 * STRATEGY PATTERN
 * -------------------------------------------------------------------------
 * The Shop page's sort dropdown used to be an if/else-if chain inside a
 * useMemo. Each ordering is now its own Strategy class implementing
 * `sort(products)`, and `SORT_STRATEGIES` is a lookup table keyed by the
 * same values the <select> already used. ShopPage just does
 * `SORT_STRATEGIES[sort].sort(list)` — adding a new ordering (e.g.
 * "Newest") means adding one class and one entry, not another `else if`.
 */

class SortStrategy {
  sort(products) { throw new Error('sort() not implemented'); }
}

class FeaturedSortStrategy extends SortStrategy {
  sort(products) { return products; } // preserve catalog/insertion order
}

class PriceAscSortStrategy extends SortStrategy {
  sort(products) { return [...products].sort((a, b) => a.price - b.price); }
}

class PriceDescSortStrategy extends SortStrategy {
  sort(products) { return [...products].sort((a, b) => b.price - a.price); }
}

class RatingSortStrategy extends SortStrategy {
  sort(products) { return [...products].sort((a, b) => (b.rating || 0) - (a.rating || 0)); }
}

class NameSortStrategy extends SortStrategy {
  sort(products) { return [...products].sort((a, b) => (a.name || '').localeCompare(b.name || '')); }
}

const SORT_STRATEGIES = {
  'featured': new FeaturedSortStrategy(),
  'price-asc': new PriceAscSortStrategy(),
  'price-desc': new PriceDescSortStrategy(),
  'rating': new RatingSortStrategy(),
  'name': new NameSortStrategy(),
};

export {
  SortStrategy,
  FeaturedSortStrategy,
  PriceAscSortStrategy,
  PriceDescSortStrategy,
  RatingSortStrategy,
  NameSortStrategy,
  SORT_STRATEGIES,
};
