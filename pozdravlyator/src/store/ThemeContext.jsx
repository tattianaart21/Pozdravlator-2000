import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pozdravlyator_theme';

const themes = [
  { id: 'light', name: 'Светлая' },
  { id: 'dark', name: 'Тёмная' },
  { id: 'system', name: 'Как в системе' },
];

const ThemeContext = createContext(null);

function applyTheme(id) {
  const root = document.documentElement;
  root.removeAttribute('data-theme');
  if (id === 'dark' || (id === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    root.setAttribute('data-theme', 'dark');
  } else {
    root.setAttribute('data-theme', 'light');
  }
}

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'system';
    } catch {
      return 'system';
    }
  });

  const setThemeId = useCallback((id) => {
    setThemeIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
    applyTheme(id);
  }, []);

  useEffect(() => {
    applyTheme(themeId);
    if (themeId === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('system');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [themeId]);

  const value = { themeId, setThemeId, themes };
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
