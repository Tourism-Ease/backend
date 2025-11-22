import { CHUNKS } from './rag.store.js';

function cosine(a, b) {
  let dot = 0,
    magA = 0,
    magB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }

  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function getRelevantChunks(queryVector, limit = 5) {
  const scored = CHUNKS.map((c) => ({
    ...c,
    score: cosine(queryVector, c.vector),
  }));

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, limit);
}
