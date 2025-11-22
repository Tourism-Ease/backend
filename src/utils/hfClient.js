import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const HF_API_KEY = process.env.HF_API_KEY;
const HF_EMBED_MODEL = process.env.HF_EMBED_MODEL || 'sentence-transformers/all-MiniLM-L6-v2'; // alternative lightweight
const HF_REWRITE_MODEL = process.env.HF_REWRITE_MODEL || 'google/flan-t5-small';

async function requestHF(path, body) {
  if (!HF_API_KEY) return null;
  const url = `https://api-inference.huggingface.co/${path}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    timeout: 60000,
  });
  if (!res.ok) {
    const txt = await res.text();
    console.error('HF request failed', res.status, txt);
    return null;
  }
  return res.json();
}

/**
 * Get embedding vector for text (returns Number[] or null)
 */
export async function getHFEmbedding(text) {
  if (!HF_API_KEY) return null;
  try {
    const path = `models/${HF_EMBED_MODEL}`;
    // HF embedding models generally return { embeddings: [...] } or array - adapt to response
    const json = await requestHF(path, { inputs: text });
    // many HF embedding models return an array of numbers directly; others wrap it. handle both.
    if (!json) return null;
    if (Array.isArray(json)) return json;
    if (json?.data && Array.isArray(json.data[0]?.embedding)) return json.data[0].embedding;
    if (json?.embedding && Array.isArray(json.embedding)) return json.embedding;
    return null;
  } catch (err) {
    console.error('getHFEmbedding error', err?.message || err);
    return null;
  }
}

/**
 * Rephrase / rewrite an answer to sound friendly and safe.
 * We constrain the prompt to prevent hallucinations: "Do not add facts, only rewrite"
 */
export async function hfRewriteAnswer(originalAnswer, userQuestion, lang = 'en') {
  if (!HF_API_KEY) return null;
  try {
    const model = HF_REWRITE_MODEL;
    const prompt =
      lang === 'ar'
        ? `أعد صياغة الرد التالي بلطف وبشكل واضح دون إضافة معلومات جديدة:\n\nالرد:\n${originalAnswer}\n\nسؤال المستخدم:\n${userQuestion}\n\nالصياغة المطلوبة:`
        : `Rewrite the following answer in a friendly, concise tone WITHOUT adding any new facts. Keep the meaning unchanged.\n\nAnswer:\n${originalAnswer}\n\nUser question:\n${userQuestion}\n\nRewritten answer:`;
    const path = `models/${model}`;
    // Many text generation HF endpoints accept { inputs: prompt, parameters: {...} }
    const json = await requestHF(path, {
      inputs: prompt,
      parameters: { max_new_tokens: 200, do_sample: false },
    });
    if (!json) return null;
    // Typical HF inference returns text in different shapes; normalize:
    if (typeof json === 'string') return json;
    if (json?.generated_text) return json.generated_text;
    if (Array.isArray(json) && typeof json[0] === 'string') return json[0];
    if (Array.isArray(json) && json[0]?.generated_text) return json[0].generated_text;
    return null;
  } catch (err) {
    console.error('hfRewriteAnswer error', err?.message || err);
    return null;
  }
}
