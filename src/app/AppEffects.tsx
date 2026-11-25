import { useLanguage } from '@/hooks/useLanguage';
import { useTheme } from '@/hooks/useTheme';

/**
 * Mounts the side effects that keep the document in sync with app state:
 * theme class, `lang`/`dir` attributes and i18next language.
 * Renders nothing.
 */
export function AppEffects() {
  useTheme();
  useLanguage();
  return null;
}
