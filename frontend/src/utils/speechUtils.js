/**
 * Speech synthesis helpers: pick the best installed voice for each of the 8
 * advisor languages and speak text in that language.
 *
 * Browsers ship very different voice sets, so each language has an ordered
 * fallback chain. Falling back to another Indic voice keeps the pronunciation
 * far closer than falling back to English, which reads Indic script as gibberish
 * or silently says nothing.
 */

import { getSpeechLocale } from './languages';

let cachedVoices = [];

const loadVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    cachedVoices = window.speechSynthesis.getVoices();
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }
}

/* Ordered preference per language: the language itself first, then the closest
   related Indic voice, and Indian English only as a last resort. */
const VOICE_FALLBACKS = {
  en: ['en-in', 'en-gb', 'en-us', 'en'],
  hi: ['hi-in', 'hi', 'mr-in', 'en-in'],
  gu: ['gu-in', 'gu', 'hi-in', 'en-in'],
  mr: ['mr-in', 'mr', 'hi-in', 'en-in'],
  pa: ['pa-in', 'pa-guru', 'pa', 'hi-in', 'en-in'],
  bn: ['bn-in', 'bn-bd', 'bn', 'hi-in', 'en-in'],
  ta: ['ta-in', 'ta-lk', 'ta', 'en-in'],
  te: ['te-in', 'te', 'ta-in', 'hi-in', 'en-in'],
  kn: ['kn-in', 'kn', 'te-in', 'hi-in', 'en-in'],
};

/* Some engines name voices by language rather than tagging them properly. */
const NAME_HINTS = {
  hi: ['hindi', 'हिन्दी'],
  gu: ['gujarati', 'ગુજરાતી'],
  mr: ['marathi', 'मराठी'],
  pa: ['punjabi', 'panjabi', 'ਪੰਜਾਬੀ'],
  bn: ['bengali', 'bangla', 'বাংলা'],
  ta: ['tamil', 'தமிழ்'],
  te: ['telugu', 'తెలుగు'],
  kn: ['kannada', 'ಕನ್ನಡ'],
  en: ['english'],
};

export const getBestVoice = (langCode) => {
  if (!cachedVoices || cachedVoices.length === 0) loadVoices();
  if (!cachedVoices || cachedVoices.length === 0) return null;

  const lang = (langCode || 'en').toLowerCase().split('-')[0];

  // 1. Walk the fallback chain, matching on the voice's BCP-47 tag.
  for (const tag of VOICE_FALLBACKS[lang] || VOICE_FALLBACKS.en) {
    const match = cachedVoices.find((v) => v.lang.toLowerCase().replace('_', '-').startsWith(tag));
    if (match) return match;
  }

  // 2. Try matching on the voice name ("Google हिन्दी", "Microsoft Tamil").
  for (const hint of NAME_HINTS[lang] || []) {
    const match = cachedVoices.find((v) => v.name.toLowerCase().includes(hint));
    if (match) return match;
  }

  // 3. Anything Indian, then anything English, then whatever exists.
  return (
    cachedVoices.find((v) => v.lang.toLowerCase().includes('-in')) ||
    cachedVoices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    cachedVoices[0] ||
    null
  );
};

/** True when the browser has a real voice for this language (not a substitute). */
export const hasNativeVoice = (langCode) => {
  if (!cachedVoices || cachedVoices.length === 0) loadVoices();
  const lang = (langCode || 'en').toLowerCase().split('-')[0];
  return cachedVoices.some((v) => v.lang.toLowerCase().replace('_', '-').startsWith(lang));
};

export const cleanTextForSpeech = (text) => {
  if (!text) return '';
  return text
    .replace(/[*#_~`]/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/[•⚠️🌾🤖]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

/* ------------------------------------------------------------------ server
   Most Windows machines ship English voices only, so an answer in Hindi,
   Gujarati, Tamil… simply never gets spoken by the browser. When the language
   has no local voice we ask the backend to synthesise it and play that audio
   instead, which keeps all 8 languages audible on any device. */

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

let serverAudio = null;

const stopServerAudio = () => {
  if (serverAudio) {
    serverAudio.pause();
    if (serverAudio.src.startsWith('blob:')) URL.revokeObjectURL(serverAudio.src);
    serverAudio = null;
  }
};

/** Stops both the browser voice and any server-generated audio. */
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  stopServerAudio();
};

const speakViaServer = async ({ text, language, onStart, onEnd, onError }) => {
  try {
    const response = await fetch(`${API_URL}/tts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, language }),
    });
    if (!response.ok) throw new Error(`TTS request failed (${response.status})`);

    const blob = await response.blob();
    const audio = new Audio(URL.createObjectURL(blob));
    serverAudio = audio;

    audio.onended = () => {
      stopServerAudio();
      if (onEnd) onEnd();
    };
    audio.onerror = () => {
      stopServerAudio();
      if (onError) onError();
    };

    await audio.play();
    if (onStart) onStart();
    return true;
  } catch (err) {
    stopServerAudio();
    if (onError) onError(err);
    return false;
  }
};

/**
 * Speak text in the given language.
 *
 * Uses the browser's own voice when one is installed for that language — it is
 * instant and works offline — and falls back to server-side speech otherwise.
 *
 * @param {string} language one of the 8 advisor language codes
 */
export const speakText = ({ text, language = 'en', onStart, onEnd, onError }) => {
  if (typeof window === 'undefined') return;

  stopSpeech(); // Stop anything already playing

  const cleanText = cleanTextForSpeech(text);
  if (!cleanText) return;

  const lang = (language || 'en').toLowerCase().split('-')[0];

  // No local voice for this language (the common case for Indic languages on
  // Windows) — go straight to the server so the farmer actually hears it.
  if (!('speechSynthesis' in window) || !hasNativeVoice(lang)) {
    speakViaServer({ text: cleanText, language: lang, onStart, onEnd, onError });
    return;
  }

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = getSpeechLocale(lang);

  const bestVoice = getBestVoice(lang);
  if (bestVoice) {
    utterance.voice = bestVoice;
    // Chrome ignores utterance.lang when a voice is attached, so keep the two
    // consistent — otherwise a Hindi answer can come out with English prosody.
    utterance.lang = bestVoice.lang;
  }

  utterance.pitch = 1.0;
  utterance.rate = 0.95; // Slightly slower for clear speech

  let started = false;
  utterance.onstart = () => {
    started = true;
    if (onStart) onStart();
  };
  utterance.onend = () => {
    if (onEnd) onEnd();
  };
  // Some engines accept the utterance then fail silently. If nothing started,
  // fall back to server speech rather than leaving the farmer with silence.
  utterance.onerror = () => {
    if (!started) {
      speakViaServer({ text: cleanText, language: lang, onStart, onEnd, onError });
    } else if (onError) {
      onError();
    }
  };

  window.speechSynthesis.speak(utterance);

  setTimeout(() => {
    if (!started && !window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      speakViaServer({ text: cleanText, language: lang, onStart, onEnd, onError });
    }
  }, 900);
};
