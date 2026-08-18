const cropKnowledgeBase = require('../data/cropKnowledgeBase');

// Basic English + Hindi/Gujarati (transliterated) stopwords to ignore during scoring
const STOPWORDS = new Set([
  'the', 'is', 'a', 'an', 'and', 'or', 'of', 'in', 'on', 'for', 'to', 'my',
  'how', 'what', 'when', 'why', 'do', 'does', 'i', 'me', 'should', 'can',
  'about', 'with', 'this', 'that', 'it', 'please', 'tell', 'am', 'are',
  'hai', 'ka', 'ki', 'ke', 'kya', 'mein', 'se', 'ko', 'aur', 'ke liye',
]);

function tokenize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\u0900-\u097F\u0A80-\u0AFF\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

/**
 * Very small, dependency-free retrieval function.
 * Scores each knowledge base chunk by counting overlapping keywords
 * (with a bonus if the crop name is directly mentioned in the query).
 * This avoids needing a vector database / embeddings API for a project
 * of this size, while still giving Gemini focused, grounded context.
 */
function retrieveContext(query, topK = 4) {
  const queryTokens = new Set(tokenize(query));
  if (queryTokens.size === 0) return [];

  const scored = cropKnowledgeBase.map((chunk) => {
    const chunkTokens = tokenize(`${chunk.crop} ${chunk.topic} ${chunk.content}`);
    let score = 0;
    for (const token of chunkTokens) {
      if (queryTokens.has(token)) score += 1;
    }
    // Bonus if the crop name itself appears in the query
    if (chunk.crop !== 'General' && query.toLowerCase().includes(chunk.crop.toLowerCase())) {
      score += 5;
    }
    return { chunk, score };
  });

  return scored
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((s) => s.chunk);
}

module.exports = { retrieveContext, tokenize };
