import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { Language } from '@/types';
import { readStorage, STORAGE_KEYS } from '@/utils/storage';
import en from './locales/en';
import ar from './locales/ar';

export const SUPPORTED_LANGUAGES: Language[] = ['en', 'ar'];

export const LANGUAGE_META: Record<Language, { label: string; nativeLabel: string; dir: 'ltr' | 'rtl'; locale: string }> = {
  en: { label: 'English', nativeLabel: 'English', dir: 'ltr', locale: 'en-US' },
  ar: { label: 'Arabic', nativeLabel: 'العربية', dir: 'rtl', locale: 'ar-EG' },
};

export function isRtl(language: string): boolean {
  return LANGUAGE_META[language as Language]?.dir === 'rtl';
}

const storedLanguage = readStorage<Language>(STORAGE_KEYS.language, 'en');
const initialLanguage: Language = SUPPORTED_LANGUAGES.includes(storedLanguage)
  ? storedLanguage
  : 'en';

void i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng: 'en',
  supportedLngs: SUPPORTED_LANGUAGES,
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

export default i18n;
