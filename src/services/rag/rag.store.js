import FAQModel from '../../models/faqModel.js';
import { embedText } from './rag.embeddings.js';

let loaded = false;

export let CHUNKS = [];

export async function ensureLoaded() {
  if (loaded) return;

  const faqs = await FAQModel.find().lean();

  CHUNKS = [];

  for (const faq of faqs) {
    const text = `${faq.question}\n${faq.answer}`;

    const vector = faq.embedding || (await embedText(text));

    if (!faq.embedding) {
      FAQModel.updateOne({ _id: faq._id }, { $set: { embedding: vector } }).catch(() => {});
    }

    CHUNKS.push({
      id: faq._id.toString(),
      text,
      vector,
    });
  }

  loaded = true;
}
