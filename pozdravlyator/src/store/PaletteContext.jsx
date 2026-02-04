import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'pozdravlyator_palette';

const PALETTES = [
  { id: 'auto', name: 'По времени суток' },
  { id: 'dawn', name: 'Рассвет' },
  { id: 'day', name: 'День' },
  { id: 'dusk', name: 'Закат' },
  { id: 'night', name: 'Ночь' },
  { id: 'forest', name: 'Лес' },
  { id: 'ocean', name: 'Океан' },
];

function getPaletteByHour(hour) {
  if (hour >= 5 && hour < 9) return 'dawn';
  if (hour >= 9 && hour < 17) return 'day';
  if (hour >= 17 && hour < 21) return 'dusk';
  return 'night';
}

const PaletteContext = createContext(null);

export function PaletteProvider({ children }) {
  const [paletteId, setPaletteIdState] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'auto';
    } catch {
      return 'auto';
    }
  });
  const [timePalette, setTimePalette] = useState(() =>
    getPaletteByHour(new Date().getHours())
  );

  const setPaletteId = useCallback((id) => {
    setPaletteIdState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (paletteId !== 'auto') return;
    const tick = () => setTimePalette(getPaletteByHour(new Date().getHours()));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [paletteId]);

  const effectivePalette = paletteId === 'auto' ? timePalette : paletteId;

  useEffect(() => {
    document.documentElement.setAttribute('data-palette', effectivePalette);
  }, [effectivePalette]);

  const value = { paletteId, setPaletteId, palettes: PALETTES, effectivePalette };
  return (
    <PaletteContext.Provider value={value}>{children}</PaletteContext.Provider>
  );
}

export function usePalette() {
  const ctx = useContext(PaletteContext);
  if (!ctx) throw new Error('usePalette must be used within PaletteProvider');
  return ctx;
}
