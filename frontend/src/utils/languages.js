/**
 * The 8 languages the Krishak Sarathi advisor supports.
 *
 * This is the advisor's own language list, separate from the app-wide i18n UI
 * language (which ships translations for English/Hindi/Gujarati only). It drives
 * three things on the advisor pages: which language speech recognition listens
 * for, which language the answer comes back in, and which voice reads it out.
 */

export const ADVISOR_LANGUAGES = [
  { code: 'en', native: 'English', label: 'English', locale: 'en-IN' },
  { code: 'hi', native: 'हिंदी', label: 'Hindi', locale: 'hi-IN' },
  { code: 'gu', native: 'ગુજરાતી', label: 'Gujarati', locale: 'gu-IN' },
  { code: 'mr', native: 'मराठी', label: 'Marathi', locale: 'mr-IN' },
  { code: 'pa', native: 'ਪੰਜਾਬੀ', label: 'Punjabi', locale: 'pa-IN' },
  { code: 'bn', native: 'বাংলা', label: 'Bengali', locale: 'bn-IN' },
  { code: 'ta', native: 'தமிழ்', label: 'Tamil', locale: 'ta-IN' },
  { code: 'te', native: 'తెలుగు', label: 'Telugu', locale: 'te-IN' },
  { code: 'kn', native: 'ಕನ್ನಡ', label: 'Kannada', locale: 'kn-IN' },
];

/** Sent to the API when the farmer wants the language picked from their words. */
export const AUTO_LANGUAGE = 'auto';

export const getAdvisorLanguage = (code) =>
  ADVISOR_LANGUAGES.find((l) => l.code === code) || ADVISOR_LANGUAGES[0];

/** BCP-47 tag for the Web Speech API (recognition and synthesis). */
export const getSpeechLocale = (code) => getAdvisorLanguage(code).locale;

/** Native name, used for labels like "Answering in: मराठी". */
export const getNativeName = (code) => getAdvisorLanguage(code).native;
