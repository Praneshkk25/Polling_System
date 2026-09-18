import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // themeMode can be: 'system' | 'light' | 'dark'
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('pulsepoll_theme_mode') || 'system';
  });

  // effectiveTheme is always 'light' | 'dark'
  const [effectiveTheme, setEffectiveTheme] = useState(() => {
    const saved = localStorage.getItem('pulsepoll_theme_mode') || 'system';
    if (saved === 'dark') return 'dark';
    if (saved === 'light') return 'light';
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const computeEffective = (mode) => {
      if (mode === 'dark') return 'dark';
      if (mode === 'light') return 'light';
      return mediaQuery.matches ? 'dark' : 'light';
    };

    const resolved = computeEffective(themeMode);
    setEffectiveTheme(resolved);

    // Apply data-theme attribute on root element
    document.documentElement.setAttribute('data-theme', resolved);
    document.documentElement.setAttribute('data-theme-mode', themeMode);

    // Persist user selection
    localStorage.setItem('pulsepoll_theme_mode', themeMode);

    // Listen for OS system theme changes
    const handleSystemChange = (e) => {
      if (themeMode === 'system') {
        const nextEffective = e.matches ? 'dark' : 'light';
        setEffectiveTheme(nextEffective);
        document.documentElement.setAttribute('data-theme', nextEffective);
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemChange);
      return () => mediaQuery.removeEventListener('change', handleSystemChange);
    }
  }, [themeMode]);

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const cycleTheme = () => {
    if (themeMode === 'system') setTheme('light');
    else if (themeMode === 'light') setTheme('dark');
    else setTheme('system');
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        effectiveTheme,
        setTheme,
        cycleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
