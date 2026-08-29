import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export function useLanguage() {
  const { i18n, t } = useTranslation();
  const lang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  const isRtl = lang === 'ar';

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    document.body.classList.toggle('arabic-mode', isRtl);
  }, [isRtl, lang]);

  const toggleLanguage = useCallback(() => {
    i18n.changeLanguage(lang === 'en' ? 'ar' : 'en');
  }, [i18n, lang]);

  const setLanguage = useCallback((next) => i18n.changeLanguage(next), [i18n]);

  return { lang, isRtl, toggleLanguage, setLanguage, t, isAr: lang === 'ar' };
}
