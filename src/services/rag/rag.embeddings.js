import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

const HF_API_KEY = process.env.HF_API_KEY;
const EMBEDDING_MODEL = 'BAAI/bge-small-en-v1.5'; // ← More stable model
const LLM_MODEL = 'google/flan-t5-base'; // ← Smaller, faster, more reliable

export async function embedText(text) {
  try {
    const res = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${EMBEDDING_MODEL}`,
      { inputs: text }, // Simple format
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      }
    );

    // Log to see actual response
    // console.log('Raw Response:', res.data);

    // Handle array response
    if (Array.isArray(res.data)) {
      return res.data.flat();
    }

    throw new Error(`Unexpected format: ${JSON.stringify(res.data)}`);
  } catch (error) {
    console.error('Full Error:', error.response?.data || error.message);
    throw new Error(`Embedding failed: ${error.response?.data?.error || error.message}`);
  }
}

export async function generateAnswer(question, chunks, lang) {
  const context = chunks.map((c) => c.text).join('\n\n');

  const prompt = `Context information is below.\n\n${context}\n\nGiven the context information and not prior knowledge, answer the question concisely: ${question}\n\nAnswer in ${lang === 'ar' ? 'Arabic' : 'English'}:`;

  try {
    const res = await axios.post(
      `https://router.huggingface.co/hf-inference/models/${LLM_MODEL}`,
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${HF_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    // console.log('LLM Raw Response:', res.data);

    if (Array.isArray(res.data) && res.data[0]?.generated_text) {
      let answer = res.data[0].generated_text.trim();
      // Remove newlines and extra spaces
      answer = answer.replace(/\n+/g, ' ').replace(/\s+/g, ' ');
      return answer;
    }

    return chunks[0]?.text || 'No answer found.';
  } catch (error) {
    // console.error('LLM Error:', error.response?.data || error.message);
    return chunks[0]?.text || 'Error generating answer.';
  }
}
