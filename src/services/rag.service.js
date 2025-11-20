import { embedText, generateAnswer } from './rag/rag.embeddings.js';
import { getRelevantChunks } from './rag/rag.retriever.js';
import * as ragStore from './rag/rag.store.js';
import detectLang from '../utils/detectLang.js';

export async function answer(question) {
  // 1. Language detection (Arabic / English)
  const lang = detectLang(question);

  // 2. Ensure data is loaded into RAM
  await ragStore.ensureLoaded();

  // 3. Embed user question
  const queryVector = await embedText(question);

  // 4. Retrieve relevant chunks
  const contextChunks = getRelevantChunks(queryVector, 5);

  // 5. Final answer using HF
  const finalAnswer = await generateAnswer(question, contextChunks, lang);

  return {
    answer: finalAnswer,
    sources: contextChunks,
  };
}
