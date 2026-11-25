import { useCallback, useEffect } from 'react';
import type { Theme } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setTheme as setThemeAction, toggleTheme as toggleThemeAction } from '@/store/slices/preferencesSlice';

/**
 * Keeps the `<html>` element in sync with the Redux theme and exposes helpers.
 */
export function useTheme() {
  const theme = useAppSelector((state) => state.preferences.theme);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#071215' : '#153A41');
  }, [theme]);

  const setTheme = useCallback((next: Theme) => dispatch(setThemeAction(next)), [dispatch]);
  const toggleTheme = useCallback(() => dispatch(toggleThemeAction()), [dispatch]);

  return { theme, setTheme, toggleTheme, isDark: theme === 'dark' };
}
