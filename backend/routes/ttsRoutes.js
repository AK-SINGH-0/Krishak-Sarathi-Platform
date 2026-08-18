const express = require('express');
const router = express.Router();
const { synthesize } = require('../utils/ttsProvider');

// Answers are long; a GET query string is not a safe place for them, so the
// text is posted. Kept public because the advisor itself is public.
// @desc   Speak an advisor answer in one of the 8 supported languages
// @route  POST /api/tts
// @access Public
router.post('/', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'A "text" field is required' });
    }

    // Guard against someone posting a novel to the upstream service.
    const audio = await synthesize(text.slice(0, 3000), language);

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audio.length,
      'Cache-Control': 'public, max-age=86400',
    });
    return res.send(audio);
  } catch (error) {
    console.warn('TTS synthesis failed:', error.message);
    return res.status(502).json({ message: 'Could not generate speech for this answer.' });
  }
});

module.exports = router;
