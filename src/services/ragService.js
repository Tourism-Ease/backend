// services/rag.service.js
import { embedText, generateAnswer } from './rag/rag.embeddings.js';
import { getRelevantChunks } from './rag/rag.retriever.js';
import * as ragStore from './rag/rag.store.js';
import detectLang from '../utils/detectLang.js';

const MAX_ANSWER_LENGTH = 500;
const EXCLUDED_TAGS = ['greeting', 'smalltalk'];

// Middleware-style service
export async function chatHandler(req, res, next) {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // 1. Detect language + load store + embed in parallel
    const [_, queryVector] = await Promise.all([ragStore.ensureLoaded(), embedText(question)]);
    let contextChunks = getRelevantChunks(queryVector, 5);

    // 2. Filter meaningful chunks
    const meaningfulChunks = contextChunks.filter(
      (chunk) => !chunk.tags?.some((tag) => EXCLUDED_TAGS.includes(tag))
    );
    contextChunks =
      meaningfulChunks.length > 0 ? meaningfulChunks.slice(0, 3) : contextChunks.slice(0, 3);

    // 3. Generate answer
    let finalAnswer = await generateAnswer(question, contextChunks, detectLang(question));

    // 4. Truncate if too long
    if (finalAnswer.length > MAX_ANSWER_LENGTH) {
      finalAnswer = finalAnswer.slice(0, MAX_ANSWER_LENGTH) + '...';
    }

    res.json({ answer: finalAnswer });
  } catch (err) {
    next(err);
  }
}
