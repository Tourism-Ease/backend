import FAQModel from '../models/faq.model.js';
import { getHFEmbedding, hfRewriteAnswer } from '../utils/hfClient.js';
import natural from 'natural';
import stringSimilarity from 'string-similarity';

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

// cosine helper for arrays
function cosine(a = [], b = []) {
  const len = Math.min(a.length, b.length);
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < len; i++) {
    dot += (a[i] || 0) * (b[i] || 0);
    magA += (a[i] || 0) * (a[i] || 0);
    magB += (b[i] || 0) * (b[i] || 0);
  }
  if (!magA || !magB) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Build TF-IDF index for small dataset
 */
function buildTfIdfIndex(faqs) {
  const tfidf = new TfIdf();
  faqs.forEach((f) => tfidf.addDocument(f.question + ' ' + (f.tags || []).join(' ')));
  return tfidf;
}

/**
 * fallback matching (TF-IDF + fuzzy)
 */
function fallbackFindBestMatch(question, faqs, tfidf) {
  const q = question.toLowerCase();
  const fuzzy = faqs
    .map((f) => ({ faq: f, sim: stringSimilarity.compareTwoStrings(q, f.question.toLowerCase()) }))
    .sort((a, b) => b.sim - a.sim);

  if (fuzzy[0] && fuzzy[0].sim >= 0.45)
    return { faq: fuzzy[0].faq, score: fuzzy[0].sim, source: 'fuzzy' };

  // TF-IDF scoring
  let best = null;
  faqs.forEach((f, idx) => {
    let score = 0;
    tfidf.tfidfs(question, (i, measure) => {
      if (i === idx) score = measure;
    });
    if (!best || score > best.score) best = { faq: f, score, source: 'tfidf' };
  });

  if (best && best.score > 0.1) return best;
  return null;
}

/**
 * Main function:
 * - Try HF embeddings if available
 * - If embedding match above threshold, return matched FAQ
 * - Else fallback to TF-IDF + fuzzy
 * - Optionally use hfRewriteAnswer to paraphrase the stored answer
 */
export async function findBestAnswer({ question, lang = 'en', rewrite = true }) {
  const faqs = await FAQModel.find({ lang }).lean();
  if (!faqs || faqs.length === 0) return null;

  // Try HF embedding for query if possible
  const queryEmbedding = await getHFEmbedding(question).catch(() => null);

  if (queryEmbedding) {
    // ensure faq embeddings exist — compute on demand for those missing
    const withEmbeddings = [];
    for (const f of faqs) {
      if (!f.embeddings) {
        const fe = await getHFEmbedding(f.question).catch(() => null);
        if (fe) {
          // store in DB asynchronously (non-blocking)
          FAQModel.updateOne({ _id: f._id }, { $set: { embeddings: fe } }).catch(() => {});
          f.embeddings = fe;
        }
      }
      if (f.embeddings) withEmbeddings.push(f);
    }

    if (withEmbeddings.length > 0) {
      let best = null;
      for (const f of withEmbeddings) {
        const sim = cosine(queryEmbedding, f.embeddings);
        if (!best || sim > best.score) best = { faq: f, score: sim, source: 'embedding' };
      }
      // Tune threshold as needed. 0.60 is a safe starting point.
      if (best && best.score >= 0.6) {
        let finalAnswer = best.faq.answer;
        if (rewrite) {
          const rewritten = await hfRewriteAnswer(finalAnswer, question, lang).catch(() => null);
          if (rewritten) finalAnswer = rewritten;
        }
        return { answer: finalAnswer, faq: best.faq, score: best.score, source: best.source };
      }
      // otherwise fall through to fallback
    }
  }

  // Fallback local
  const tfidf = buildTfIdfIndex(faqs);
  const fallback = fallbackFindBestMatch(question, faqs, tfidf);
  if (fallback) {
    let finalAnswer = fallback.faq.answer;
    // no rewrite if no HF key; attempt rewrite only if HF available
    if (rewrite) {
      const rewritten = await hfRewriteAnswer(finalAnswer, question, lang).catch(() => null);
      if (rewritten) finalAnswer = rewritten;
    }
    return {
      answer: finalAnswer,
      faq: fallback.faq,
      score: fallback.score,
      source: fallback.source,
    };
  }

  return null;
}
