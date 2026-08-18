/**
 * Builds every locale file from src/locales/_catalog/*.js and then verifies
 * that all 9 languages have exactly the same keys.
 *
 *   node scripts/buildLocales.js          build + verify
 *   node scripts/buildLocales.js --check  verify only (no writes)
 *
 * The catalog is the single source of truth: one entry per key, holding the
 * translation for each language. Keeping them side by side is what stops a
 * language from quietly falling back to English when a new key is added.
 */

const fs = require('fs');
const path = require('path');

const LANGS = ['en', 'hi', 'gu', 'mr', 'bn', 'te', 'ta', 'kn', 'pa'];
const SRC = path.join(__dirname, '..', 'src', 'locales');
const CATALOG_DIR = path.join(SRC, '_catalog');
const checkOnly = process.argv.includes('--check');

/* ------------------------------------------------------------- helpers */
const setDeep = (obj, dotted, value) => {
  const parts = dotted.split('.');
  let node = obj;
  parts.forEach((part, i) => {
    if (i === parts.length - 1) {
      node[part] = value;
      return;
    }
    // Some hand-written locale files had a namespace stored as a plain string
    // (e.g. footer.resources: "…") which silently swallowed every nested key.
    // Replace any non-object node on the path with a real object.
    if (!node[part] || typeof node[part] !== 'object' || Array.isArray(node[part])) {
      node[part] = {};
    }
    node = node[part];
  });
};

const flatten = (obj, prefix = '', out = {}) => {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = v;
  }
  return out;
};

/* Sort keys so generated files stay diff-friendly. */
const sortDeep = (obj) => {
  if (Array.isArray(obj)) return obj;
  if (!obj || typeof obj !== 'object') return obj;
  return Object.keys(obj)
    .sort()
    .reduce((acc, k) => {
      acc[k] = sortDeep(obj[k]);
      return acc;
    }, {});
};

/* ------------------------------------------------------- load catalog */
const catalog = {};
const files = fs.readdirSync(CATALOG_DIR).filter((f) => f.endsWith('.js')).sort();
for (const file of files) {
  const part = require(path.join(CATALOG_DIR, file));
  for (const [key, translations] of Object.entries(part)) {
    // Entries for the same key in different files are merged language by
    // language — that is how a file can fill one missing language for a key
    // another file already covers. Only warn when the SAME language is redefined.
    const clashes = Object.keys(translations).filter(
      (lang) => catalog[key] && catalog[key][lang] !== undefined
    );
    if (clashes.length) {
      console.warn(`! "${key}" redefines [${clashes.join(', ')}] in ${file}`);
    }
    catalog[key] = { ...catalog[key], ...translations };
  }
}
console.log(`catalog: ${Object.keys(catalog).length} keys from ${files.length} file(s)`);

/* ------------------------------------------------ merge into locales */
const built = {};
for (const lang of LANGS) {
  const existingPath = path.join(SRC, lang, 'translation.json');
  const existing = fs.existsSync(existingPath)
    ? JSON.parse(fs.readFileSync(existingPath, 'utf8'))
    : {};

  const merged = JSON.parse(JSON.stringify(existing));
  for (const [key, translations] of Object.entries(catalog)) {
    if (translations[lang] !== undefined) setDeep(merged, key, translations[lang]);
  }
  built[lang] = sortDeep(merged);
}

/* ------------------------------------------------------------ verify */
const flatByLang = Object.fromEntries(LANGS.map((l) => [l, flatten(built[l])]));
const englishKeys = Object.keys(flatByLang.en);
let problems = 0;

for (const lang of LANGS) {
  if (lang === 'en') continue;
  const keys = flatByLang[lang];
  const missing = englishKeys.filter((k) => keys[k] === undefined || keys[k] === '');
  const untranslated = englishKeys.filter(
    (k) =>
      typeof keys[k] === 'string' &&
      typeof flatByLang.en[k] === 'string' &&
      keys[k] === flatByLang.en[k] &&
      /[A-Za-z]{4}/.test(flatByLang.en[k]) &&
      // brand names, addresses and technical tokens legitimately stay identical
      !/^(Krishak Sarathi|NPK|PM-KISAN|PMFBY|KCC|AI|UV|SMS|ET0|APMC|MSP|CloudStack)/.test(flatByLang.en[k]) &&
      !/@|https?:/.test(flatByLang.en[k])
  );

  if (missing.length) {
    problems += missing.length;
    console.log(`\n[${lang}] MISSING ${missing.length}:`);
    missing.slice(0, 25).forEach((k) => console.log(`    ${k}`));
    if (missing.length > 25) console.log(`    ... and ${missing.length - 25} more`);
  }
  if (untranslated.length) {
    console.log(`\n[${lang}] still English (${untranslated.length}):`);
    untranslated.slice(0, 15).forEach((k) => console.log(`    ${k} = "${String(keys[k]).slice(0, 50)}"`));
    if (untranslated.length > 15) console.log(`    ... and ${untranslated.length - 15} more`);
  }
}

/* ------------------------------------------------------------- write */
if (!checkOnly) {
  for (const lang of LANGS) {
    const dir = path.join(SRC, lang);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, 'translation.json'),
      `${JSON.stringify(built[lang], null, 2)}\n`,
      'utf8'
    );
  }
  console.log(`\nwrote ${LANGS.length} locale files (${englishKeys.length} keys each)`);
}

console.log(problems === 0 ? '\nOK: every language has every key.' : `\n${problems} missing key(s).`);
process.exit(problems === 0 ? 0 : 1);
