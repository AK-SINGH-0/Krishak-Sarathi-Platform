const { askGemini } = require('../utils/gemini');
const { retrieveContext } = require('../utils/rag');
const { generateDynamicAdvice } = require('../utils/agronomyEngine');
const { detectLanguage, getLanguage, isSupported } = require('../utils/languages');
const ChatMessage = require('../models/ChatMessage');

// Small dependency-free unique id generator (good enough for grouping a chat session)
const uuidv4 = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

/** How many earlier turns to replay so follow-up questions make sense. */
const HISTORY_TURNS = 6;

function buildSystemPrompt({ language, mode }) {
  const { name, native } = getLanguage(language);
  const lengthRule =
    mode === 'voice'
      ? 'This answer will be READ ALOUD by a text-to-speech voice. Keep it to 2-4 short spoken sentences. Use plain flowing sentences, no markdown, no bullet points, no emoji, no tables, and write numbers in a way that is natural to speak.'
      : 'Keep the answer under about 180 words. Short paragraphs or up to 4 bullet points. Bold only the key figures.';

  return `You are "Krishak Sarathi", an agricultural advisor for Indian farmers. You are talking to a working farmer, not an agronomy student.

LANGUAGE (most important rule):
- The farmer wrote in ${name} (${native}). Write your ENTIRE reply in ${name} and nothing else.
- Do not translate into English, do not add an English version, and do not mix in English sentences. Never explain which language you are using.
- Keep only universally used technical tokens in their standard form: NPK, urea, DAP, pH, ml, kg, litre, product names, and scheme names such as PM-KISAN, PMFBY, PM-KUSUM.
- Write in the ${name} script only. Do not mix in letters or digits from another script (no Latin letters inside a ${name} word, no Urdu/Arabic characters, no Devanagari inside Tamil, and so on). Use ordinary 0-9 digits for numbers.
- Proof-read the reply before sending: every word must be spelled correctly in ${name}.

ANSWERING THE ACTUAL QUESTION:
- Read the farmer's question carefully and answer exactly what was asked. Do not answer a nearby question you know more about.
- Never reuse a generic all-purpose answer. Two different questions must get two clearly different replies.
- Use the conversation so far to understand follow-up questions like "and how much water?" or "when should I spray it?".
- ${lengthRule}

WHEN THE QUESTION IS INCOMPLETE:
- For a crop problem you need: the crop, its growth stage, the visible symptoms, and roughly when the trouble started. Soil type, recent weather, irrigation and last fertiliser or spray also matter.
- If a detail you truly need is missing, give the safe general step you can already recommend, then ask ONE short question for the single most important missing detail. Do not interrogate the farmer with a list of questions.
- If the question is too vague to act on at all, ask one short clarifying question instead of guessing.

ACCURACY AND SAFETY:
- Give practical, realistic advice suited to Indian farming conditions, and prefer well-established recommendations.
- Never invent a pesticide, a disease name, a scheme, a subsidy amount or a yield figure. If you are not sure, say plainly that you are not sure and tell the farmer to confirm with the local Krishi Vigyan Kendra (KVK) or agriculture officer.
- Whenever you mention a pesticide, fungicide or fertiliser: give the dose per litre or per acre, and add a short safety note - read the product label, wear protection, and observe the pre-harvest interval.
- Prefer cultural, preventive and organic options first where they genuinely work, and mention chemicals when they are needed.

SCOPE:
- You only handle farming: crops, soil, seeds, irrigation, pests, diseases, weeds, livestock, farm machinery, weather risk, market prices and government agriculture schemes.
- If the question is not about farming, say briefly in ${name} that you are a farming advisor and invite a farming question. Do not answer the off-topic question.

TONE: simple, warm, respectful, farmer-friendly. Short words. No jargon unless you explain it in one phrase.`;
}

function buildUserPrompt(question, contextChunks) {
  if (contextChunks && contextChunks.length > 0) {
    const contextText = contextChunks
      .map((c, i) => `[${i + 1}] (${c.crop} - ${c.topic}): ${c.content}`)
      .join('\n');
    return `REFERENCE NOTES (verified agronomy from the Krishak Sarathi knowledge base - use only the parts that actually answer the question, and ignore the rest):
${contextText}

FARMER'S QUESTION:
${question}`;
  }
  return `FARMER'S QUESTION:\n${question}`;
}

/**
 * Recent turns for this chat, so follow-up questions have context.
 * Prefers the history the client sent (works for guests and when Mongo is
 * unavailable) and falls back to the stored session.
 */
async function loadHistory({ history, sessionId }) {
  if (Array.isArray(history) && history.length > 0) {
    return history
      .filter((h) => h && typeof h.text === 'string' && h.text.trim())
      .slice(-HISTORY_TURNS * 2)
      .map((h) => ({
        role: h.role === 'ai' || h.role === 'model' ? 'model' : 'user',
        text: h.text.trim().slice(0, 1500),
      }));
  }

  if (!sessionId) return [];

  try {
    const past = await ChatMessage.find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(HISTORY_TURNS)
      .lean();

    return past
      .reverse()
      .flatMap((m) => [
        { role: 'user', text: m.question },
        { role: 'model', text: m.answer },
      ]);
  } catch (err) {
    console.warn('Could not load chat history for context:', err.message);
    return [];
  }
}

// @desc   Ask the AI advisor a farming question (used by both AI Advisor chat and Voice Advisor)
// @route  POST /api/ai/chat
// @access Public (optionalAuth - saves history if logged in)
const chat = async (req, res) => {
  try {
    const { message, language = 'auto', mode = 'text', sessionId, history } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'A "message" field is required' });
    }

    const question = message.trim();

    // The farmer's own words decide the language. An explicit selection is only
    // used as the tie-breaker for text that carries no language signal.
    const requested = isSupported(language) ? language : null;
    const answerLanguage =
      language === 'auto' || !requested
        ? detectLanguage(question, requested || 'en')
        : requested;

    const contextChunks = retrieveContext(question, 4);
    const systemPrompt = buildSystemPrompt({ language: answerLanguage, mode });
    const priorTurns = await loadHistory({ history, sessionId });

    const messages = [
      ...priorTurns,
      { role: 'user', text: buildUserPrompt(question, contextChunks) },
    ];

    let answer;
    let source = 'gemini';
    try {
      const result = await askGemini({
        systemPrompt,
        messages,
        // Voice replies are short, so give them room without rambling.
        maxOutputTokens: mode === 'voice' ? 500 : 900,
      });
      answer = result.text;
    } catch (geminiError) {
      console.warn('Gemini unavailable, using offline knowledge base:', geminiError.message);
      answer = generateDynamicAdvice(question, answerLanguage, contextChunks);
      source = 'offline';
    }

    const finalSessionId = sessionId || uuidv4();

    // Save to history asynchronously in background (non-blocking)
    ChatMessage.create({
      user: req.user ? req.user._id : null,
      sessionId: finalSessionId,
      mode,
      question,
      answer,
      language: answerLanguage,
      sources: contextChunks.map((c) => ({ title: c.topic, crop: c.crop })),
    }).catch((dbErr) => {
      console.warn('Could not save chat history:', dbErr.message);
    });

    return res.json({
      answer,
      language: answerLanguage,
      languageName: getLanguage(answerLanguage).native,
      source,
      sessionId: finalSessionId,
      sources: contextChunks.map((c) => ({ title: c.topic, crop: c.crop })),
    });
  } catch (error) {
    console.error('AI chat controller error:', error.message);
    return res.status(500).json({
      message: 'Something went wrong while processing your question. Please try again.',
    });
  }
};

// @desc   Get chat history for the logged-in user
// @route  GET /api/ai/history
// @access Private
const getHistory = async (req, res) => {
  try {
    const history = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return res.json(history);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { chat, getHistory };
