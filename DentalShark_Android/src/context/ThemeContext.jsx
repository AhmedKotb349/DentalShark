import { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef } from 'react';

const ThemeContext = createContext(null);

function getInitialTheme() {
  if (typeof window === 'undefined') return 'dark';
  return localStorage.getItem('ds_theme') || 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);
  const firstRun = useRef(true);

  useEffect(() => {
    // Suppress all CSS transitions for one frame so the hundreds of themed
    // elements swap color instantly instead of each animating individually
    // (which is what made the toggle feel slow).
    if (!firstRun.current) {
      const styleEl = document.createElement('style');
      styleEl.textContent = '*{transition:none!important}';
      document.head.appendChild(styleEl);
      // Force a reflow so the override applies before we remove it
      // eslint-disable-next-line no-unused-expressions
      window.getComputedStyle(styleEl).opacity;
      requestAnimationFrame(() => {
        document.head.removeChild(styleEl);
      });
    }
    firstRun.current = false;

    document.documentElement.setAttribute('data-theme', theme);
    document.body.classList.toggle('light-mode', theme === 'light');
    document.body.classList.toggle('dark-mode', theme === 'dark');
    localStorage.setItem('ds_theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
