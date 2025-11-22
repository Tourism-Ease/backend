import * as ragService from '../services/rag.service.js';

export async function chat(req, res, next) {
  try {
    const { question } = req.body;
    const result = await ragService.answer(question);
    res.json(result);
  } catch (err) {
    next(err);
  }
}
