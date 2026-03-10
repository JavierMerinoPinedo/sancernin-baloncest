import { createContext, useContext, useState, useEffect } from 'react';
import { DARK, LIGHT } from './theme.js';

const Ctx = createContext();

export function ThemeProvider({ children }) {
  const getInit = () => {
    try {
      const saved = localStorage.getItem('sc-theme');
      if (saved) return saved === 'dark';
    } catch {}
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;
  };

  const [dark, setDark] = useState(getInit);
  const T = dark ? DARK : LIGHT;

  useEffect(() => {
    try { localStorage.setItem('sc-theme', dark ? 'dark' : 'light'); } catch {}
    document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
    document.body.style.background = T.bg;
    document.body.style.transition = 'background .25s';
  }, [dark, T.bg]);

  return (
    <Ctx.Provider value={{ T, dark, toggle: () => setDark(d => !d) }}>
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);
