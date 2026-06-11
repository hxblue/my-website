import { useCallback, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { ThemeContext, type Theme } from './theme-context';

const THEME_STORAGE_KEY = 'chblue-theme';

const getInitialTheme = (): Theme =>
  document.documentElement.classList.contains('dark') ? 'dark' : 'light';

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';
    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');

    root.classList.toggle('dark', isDark);
    root.style.colorScheme = theme;
    themeColor?.setAttribute('content', isDark ? '#0E0E0D' : '#FAFAF7');
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((currentTheme) => (currentTheme === 'light' ? 'dark' : 'light'));
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
