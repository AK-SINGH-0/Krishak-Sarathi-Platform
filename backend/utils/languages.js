/**
 * The 8 languages the Krishak Sarathi advisor speaks, plus automatic detection
 * of the language a farmer actually wrote in.
 *
 * Detection is script-first: each Indic language here has its own Unicode block,
 * so a single Gujarati or Tamil character is conclusive. The two ambiguous cases
 * are handled separately:
 *   - Hindi vs Marathi, which share the Devanagari block  -> function-word scoring
 *   - romanised Indian languages ("mere gehu me keeda")   -> keyword scoring
 */

const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', locale: 'en-IN' },
  { code: 'hi', name: 'Hindi', native: 'हिंदी', locale: 'hi-IN' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', locale: 'gu-IN' },
  { code: 'mr', name: 'Marathi', native: 'मराठी', locale: 'mr-IN' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', locale: 'pa-IN' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা', locale: 'bn-IN' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', locale: 'ta-IN' },
  { code: 'te', name: 'Telugu', native: 'తెలుగు', locale: 'te-IN' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', locale: 'kn-IN' },
];

const LANGUAGE_CODES = SUPPORTED_LANGUAGES.map((l) => l.code);

const isSupported = (code) => LANGUAGE_CODES.includes(code);

const getLanguage = (code) =>
  SUPPORTED_LANGUAGES.find((l) => l.code === code) || SUPPORTED_LANGUAGES[0];

/** Unicode blocks. Every one of these is unique to a single supported language. */
const SCRIPT_RANGES = [
  { code: 'gu', re: /[઀-૿]/g }, // Gujarati
  { code: 'pa', re: /[਀-੿]/g }, // Gurmukhi
  { code: 'bn', re: /[ঀ-৿]/g }, // Bengali
  { code: 'ta', re: /[஀-௿]/g }, // Tamil
  { code: 'te', re: /[ఀ-౿]/g }, // Telugu
  { code: 'kn', re: /[ಀ-೿]/g }, // Kannada
  { code: 'deva', re: /[ऀ-ॿ]/g }, // Devanagari -> Hindi or Marathi
];

/* Devanagari is shared, so score the function words that differ. These are
   everyday grammar words, not farming terms, so they fire on any sentence. */
const MARATHI_MARKERS = [
  'आहे', 'आहेत', 'नाही', 'आणि', 'काय', 'कसे', 'कशी', 'कधी', 'पाहिजे',
  'करावे', 'माझ्या', 'माझी', 'तुमच्या', 'त्याच्या', 'मध्ये', 'साठी', 'वर',
  'झाली', 'झाले', 'लागली', 'येत', 'शेतात', 'पीक', 'खत', 'फवारणी',
];

const HINDI_MARKERS = [
  'है', 'हैं', 'क्या', 'कैसे', 'कब', 'और', 'नहीं', 'चाहिए', 'करना',
  'मेरे', 'मेरी', 'आपके', 'रहा', 'रही', 'गया', 'हो', 'कौन', 'कितना',
  'खेत', 'फसल', 'खाद', 'छिड़काव', 'बीमारी',
];

/* Romanised (Latin-script) hints. Only used when the text has no Indic script
   at all — for example "mere kapas me safed makhi lag gayi hai". */
const ROMAN_MARKERS = {
  hi: ['kya', 'kaise', 'kaisa', 'kab', 'kyun', 'mera', 'meri', 'mere', 'hai', 'hain',
    'nahi', 'karna', 'chahiye', 'kitna', 'fasal', 'khet', 'khad', 'paani', 'bimari',
    'keeda', 'kida', 'ilaj', 'upay', 'bataye', 'batao', 'sinchai', 'beej'],
  mr: ['kay', 'kase', 'kashi', 'aahe', 'ahet', 'nahi', 'majhya', 'mala', 'tumhi',
    'pahije', 'karave', 'shet', 'shetat', 'pik', 'khat', 'favarni', 'kida'],
  gu: ['shu', 'kem', 'kevi', 'kyare', 'maru', 'mari', 'chhe', 'che', 'nathi',
    'joie', 'kharu', 'khatar', 'pak', 'khetar', 'pani', 'jivat', 'rog', 'upay'],
  pa: ['ki', 'kiven', 'kado', 'mera', 'meri', 'hai', 'nahi', 'chahida', 'khet',
    'fasal', 'khad', 'pani', 'keeda', 'bimari', 'ilaj'],
  bn: ['ki', 'kemon', 'kobe', 'amar', 'ache', 'nei', 'korbo', 'lagbe', 'fasal',
    'jomi', 'sar', 'pani', 'poka', 'rog', 'chas'],
  ta: ['enna', 'eppadi', 'eppo', 'enakku', 'irukku', 'illai', 'seyya', 'vendum',
    'payir', 'nilam', 'uram', 'thanni', 'poochi', 'noi'],
  te: ['emi', 'ela', 'eppudu', 'naa', 'undi', 'ledu', 'cheyali', 'kavali',
    'pantalu', 'polam', 'eruvu', 'neeru', 'purugu', 'vyadhi'],
  kn: ['enu', 'hege', 'yavaga', 'nanna', 'ide', 'illa', 'madabeku', 'beku',
    'bele', 'hola', 'gobbara', 'neeru', 'kide', 'roga'],
};

const countMatches = (text, needles) =>
  needles.reduce((total, needle) => (text.includes(needle) ? total + 1 : total), 0);

/**
 * Work out which of the 8 languages a farmer's message is written in.
 *
 * @param {string} text     the farmer's message
 * @param {string} fallback language to assume when the text carries no signal
 *                         (very short messages, digits, pure crop names)
 * @returns {string} one of the supported language codes
 */
function detectLanguage(text, fallback = 'en') {
  const raw = (text || '').trim();
  const safeFallback = isSupported(fallback) ? fallback : 'en';
  if (!raw) return safeFallback;

  // 1. Script detection — decisive for 5 of the 8 languages.
  const counts = SCRIPT_RANGES.map(({ code, re }) => ({
    code,
    count: (raw.match(re) || []).length,
  })).filter((s) => s.count > 0);

  if (counts.length > 0) {
    counts.sort((a, b) => b.count - a.count);
    const winner = counts[0].code;
    if (winner !== 'deva') return winner;

    // 2. Devanagari: Hindi or Marathi?
    const marathi = countMatches(raw, MARATHI_MARKERS);
    const hindi = countMatches(raw, HINDI_MARKERS);
    if (marathi > hindi) return 'mr';
    if (hindi > marathi) return 'hi';
    // No grammar words either way (e.g. "गेहूं खाद") — keep the caller's choice
    // when that choice is already a Devanagari language, else default to Hindi.
    return fallback === 'mr' ? 'mr' : 'hi';
  }

  // 3. Latin script — could be English or a romanised Indian language.
  const words = raw.toLowerCase().split(/[^a-z]+/).filter(Boolean);
  if (words.length === 0) return safeFallback;

  const wordSet = new Set(words);
  let best = null;
  for (const [code, markers] of Object.entries(ROMAN_MARKERS)) {
    const hits = markers.reduce((n, m) => (wordSet.has(m) ? n + 1 : n), 0);
    if (hits > 0 && (!best || hits > best.hits)) best = { code, hits };
  }

  // Require two hits before overriding English: single words like "ki" or "hai"
  // appear inside ordinary English sentences too.
  if (best && best.hits >= 2) return best.code;

  return 'en';
}

module.exports = {
  SUPPORTED_LANGUAGES,
  LANGUAGE_CODES,
  detectLanguage,
  getLanguage,
  isSupported,
};
