import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en/translation.json';
import hi from './locales/hi/translation.json';
import gu from './locales/gu/translation.json';
import mr from './locales/mr/translation.json';
import bn from './locales/bn/translation.json';
import te from './locales/te/translation.json';
import ta from './locales/ta/translation.json';
import kn from './locales/kn/translation.json';
import pa from './locales/pa/translation.json';

import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  getLocale,
  isSupportedLanguage,
} from './locales/languages';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  gu: { translation: gu },
  mr: { translation: mr },
  bn: { translation: bn },
  te: { translation: te },
  ta: { translation: ta },
  kn: { translation: kn },
  pa: { translation: pa },
};

/** Remembered choice first, then the browser's language, then English. */
const detectInitialLanguage = () => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  try {
    const saved = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (isSupportedLanguage(saved)) return saved;
  } catch {
    /* private mode / storage disabled */
  }

  const browser = (window.navigator.language || '').split('-')[0];
  return isSupportedLanguage(browser) ? browser : DEFAULT_LANGUAGE;
};

i18n.use(initReactI18next).init({
  resources,
  lng: detectInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: Object.keys(resources),
  interpolation: {
    escapeValue: false, // React already escapes by default
  },
  returnEmptyString: false, // an empty translation falls back to English
});

/** Keeps the document in step with the chosen language. */
const applyDocumentLanguage = (lng) => {
  if (typeof document === 'undefined') return;
  document.documentElement.lang = getLocale(lng);
  document.documentElement.setAttribute('data-lang', lng);
};

applyDocumentLanguage(i18n.language);

i18n.on('languageChanged', (lng) => {
  applyDocumentLanguage(lng);
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, lng);
  } catch {
    /* ignore */
  }
});

export default i18n;
