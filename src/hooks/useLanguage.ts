import { useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { Language } from '@/types';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage as setLanguageAction } from '@/store/slices/preferencesSlice';
import { LANGUAGE_META, isRtl as isRtlLanguage } from '@/i18n';

/**
 * Synchronises i18next + the document `lang`/`dir` attributes with Redux.
 * Switching to Arabic flips the entire layout to RTL.
 */
export function useLanguage() {
  const language = useAppSelector((state) => state.preferences.language);
  const dispatch = useAppDispatch();
  const { i18n } = useTranslation();

  useEffect(() => {
    const meta = LANGUAGE_META[language];
    const root = document.documentElement;
    root.lang = language;
    root.dir = meta.dir;
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const setLanguage = useCallback(
    (next: Language) => {
      dispatch(setLanguageAction(next));
      void i18n.changeLanguage(next);
    },
    [dispatch, i18n],
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'ar' ? 'en' : 'ar');
  }, [language, setLanguage]);

  return {
    language,
    setLanguage,
    toggleLanguage,
    dir: LANGUAGE_META[language].dir,
    locale: LANGUAGE_META[language].locale,
    isRtl: isRtlLanguage(language),
  };
}
