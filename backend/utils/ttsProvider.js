/**
 * Server-side speech for the advisor.
 *
 * Why this exists: the browser's built-in speechSynthesis can only speak a
 * language if a matching voice pack is installed on the machine. A plain
 * Windows install ships English voices only, so a Hindi or Tamil answer was
 * silently not spoken at all. Synthesising on the server means the 8 advisor
 * languages are spoken on every device, whatever it has installed.
 *
 * Source: Google Translate's public TTS endpoint. It needs no API key and
 * covers all 8 languages, but it is not a documented/supported API - treat it
 * as best effort. The caller falls back to the browser voice if this fails.
 */

const axios = require('axios');
const { isSupported } = require('./languages');

/** The endpoint rejects long strings, so speech is fetched in small pieces. */
const MAX_CHUNK = 190;

/** Keep recently spoken answers in memory - farmers replay the same reply. */
const CACHE_LIMIT = 60;
const cache = new Map();

/**
 * Split text into <=MAX_CHUNK pieces, preferring sentence ends, then word
 * boundaries, so the joined audio does not cut off mid-word.
 */
function chunkText(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= MAX_CHUNK) return [clean];

  // Sentence terminators for Latin plus Devanagari danda and its Indic cousins.
  const sentences = clean.split(/(?<=[.!?।॥])\s+/);
  const chunks = [];
  let current = '';

  const pushWords = (sentence) => {
    for (const word of sentence.split(' ')) {
      if ((current ? `${current} ${word}` : word).length > MAX_CHUNK) {
        if (current) chunks.push(current);
        current = word.slice(0, MAX_CHUNK);
      } else {
        current = current ? `${current} ${word}` : word;
      }
    }
  };

  for (const sentence of sentences) {
    if (sentence.length > MAX_CHUNK) {
      pushWords(sentence);
    } else if ((current ? `${current} ${sentence}` : sentence).length > MAX_CHUNK) {
      if (current) chunks.push(current);
      current = sentence;
    } else {
      current = current ? `${current} ${sentence}` : sentence;
    }
  }

  if (current) chunks.push(current);
  return chunks.filter(Boolean);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/** One piece of speech. The upstream connection drops occasionally, so retry. */
async function fetchChunk(text, lang, attempts = 3) {
  const url =
    'https://translate.google.com/translate_tts' +
    `?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${lang}&client=tw-ob&ttsspeed=1`;

  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const { data } = await axios.get(url, {
        responseType: 'arraybuffer',
        timeout: 15000,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36',
          Referer: 'https://translate.google.com/',
        },
      });

      const buffer = Buffer.from(data);
      if (buffer.length === 0) throw new Error('Empty audio returned');
      return buffer;
    } catch (err) {
      lastError = err;
      if (attempt < attempts - 1) await sleep(350 * (attempt + 1));
    }
  }

  throw lastError;
}

/**
 * Synthesise `text` in `lang` and return one MP3 buffer.
 * @returns {Promise<Buffer>}
 */
async function synthesize(text, lang) {
  const language = isSupported(lang) ? lang : 'en';
  const clean = (text || '').trim();
  if (!clean) throw new Error('No text to speak');

  const cacheKey = `${language}:${clean}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const chunks = chunkText(clean);
  const buffers = [];
  for (const chunk of chunks) {
    buffers.push(await fetchChunk(chunk, language));
  }

  // Successive MP3 frames play back as one continuous clip.
  const audio = Buffer.concat(buffers);

  if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value);
  cache.set(cacheKey, audio);

  return audio;
}

module.exports = { synthesize, chunkText };
