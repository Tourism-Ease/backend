import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const HF_API_KEY = process.env.HF_API_KEY;
const EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';
const LLM_MODEL = 'mistralai/Mixtral-8x7B-Instruct-v0.1';

export async function embedText(text) {
  const res = await axios.post(
    `https://api-inference.huggingface.co/pipeline/feature-extraction/${EMBEDDING_MODEL}`,
    { inputs: text },
    { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
  );

  return res.data[0]; // vector
}

export async function generateAnswer(question, chunks, lang) {
  const context = chunks.map((c) => c.text).join('\n\n---\n\n');

  const prompt = `
Answer the user's question using ONLY the provided company knowledge.

Question:
${question}

Context:
${context}

Language: ${lang === 'ar' ? 'Arabic' : 'English'}
`;

  const res = await axios.post(
    `https://api-inference.huggingface.co/models/${LLM_MODEL}`,
    { inputs: prompt },
    { headers: { Authorization: `Bearer ${HF_API_KEY}` } }
  );

  return res.data[0]?.generated_text || 'Sorry, I don’t know.';
}
