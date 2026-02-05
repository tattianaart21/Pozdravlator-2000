import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pozdravlyator_background';

const SettingsContext = createContext(null);

function readBackgroundOn() {
  try {
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  } catch {
    return true;
  }
}

export function SettingsProvider({ children }) {
  const [backgroundOn, setBackgroundOnState] = useState(readBackgroundOn);

  const setBackgroundOn = useCallback((on) => {
    setBackgroundOnState(on);
    try {
      localStorage.setItem(STORAGE_KEY, on ? 'true' : 'false');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-background', backgroundOn ? 'on' : 'off');
  }, [backgroundOn]);

  const value = { backgroundOn, setBackgroundOn };
  return (
    <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
