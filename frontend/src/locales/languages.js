/**
 * Every language the Krishak Sarathi interface is available in.
 *
 * `code` is the i18next resource key and the value stored in localStorage,
 * `locale` is the BCP-47 tag used for speech recognition / synthesis and for
 * the <html lang> attribute, and `native` is what the farmer sees in the
 * language switcher — always written in that language's own script.
 */

export const UI_LANGUAGES = [
  { code: 'en', native: 'English', english: 'English', locale: 'en-IN' },
  { code: 'hi', native: 'हिंदी', english: 'Hindi', locale: 'hi-IN' },
  { code: 'gu', native: 'ગુજરાતી', english: 'Gujarati', locale: 'gu-IN' },
  { code: 'mr', native: 'मराठी', english: 'Marathi', locale: 'mr-IN' },
  { code: 'bn', native: 'বাংলা', english: 'Bengali', locale: 'bn-IN' },
  { code: 'te', native: 'తెలుగు', english: 'Telugu', locale: 'te-IN' },
  { code: 'ta', native: 'தமிழ்', english: 'Tamil', locale: 'ta-IN' },
  { code: 'kn', native: 'ಕನ್ನಡ', english: 'Kannada', locale: 'kn-IN' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', english: 'Punjabi', locale: 'pa-IN' },
];

export const LANGUAGE_CODES = UI_LANGUAGES.map((l) => l.code);

export const DEFAULT_LANGUAGE = 'en';

/** Where the farmer's choice is remembered between visits. */
export const LANGUAGE_STORAGE_KEY = 'ks_language';

export const getLanguage = (code) =>
  UI_LANGUAGES.find((l) => l.code === code) || UI_LANGUAGES[0];

export const getNativeName = (code) => getLanguage(code).native;

export const getLocale = (code) => getLanguage(code).locale;

export const isSupportedLanguage = (code) => LANGUAGE_CODES.includes(code);
