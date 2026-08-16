import { useCallback } from 'react';
import { useLanguage } from './useLanguage';
import { PRODUCT_TRANSLATIONS_AR } from '../data.productsAr';

/**
 * Returns a `localize(product)` function that resolves the correct
 * name/desc/cat/brand strings for the active language. Falls back to the
 * English source fields when no Arabic translation exists for that product.
 */
export function useLocalizedProduct() {
  const { lang } = useLanguage();

  const localize = useCallback(
    (product) => {
      if (!product) return product;
      if (lang !== 'ar') return product;

      const translation = PRODUCT_TRANSLATIONS_AR[product.id];
      if (!translation) return product;

      return {
        ...product,
        name: translation.name || product.name,
        desc: translation.desc || product.desc,
        cat: translation.cat || product.cat,
        brand: translation.brand || product.brand,
      };
    },
    [lang]
  );

  return localize;
}
