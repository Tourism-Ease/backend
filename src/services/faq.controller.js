import { findBestAnswer } from '../services/faq.service.js';

export const askFAQEndpoint = async (req, res, next) => {
  try {
    const { question, lang } = req.body;

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: 'Question is required and must be a string' });
    }

    const answer = await findBestAnswer({ question, lang });

    res.json(
      answer ?? {
        answer: lang === 'ar' ? 'عذراً، لا أعرف الإجابة الآن.' : 'Sorry, I do not know yet.',
        source: 'none',
      }
    );
  } catch (err) {
    next(err);
  }
};
